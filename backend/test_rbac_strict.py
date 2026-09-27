import urllib.request
import urllib.error
import json
import sys

BASE_URL = 'http://localhost:5000/api'

def req(endpoint, method='GET', data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f"Bearer {token}"
    body = json.dumps(data).encode('utf-8') if data is not None else None
    request = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request) as response:
            res_body = response.read().decode('utf-8')
            return response.status, json.loads(res_body)
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        try:
            parsed = json.loads(err_body)
        except:
            parsed = {'raw': err_body}
        return e.code, parsed

def run():
    results = []

    def test(name, status_code, expected_code, check=None):
        passed = (status_code == expected_code)
        if passed and check:
            passed = check()
        msg = f"[{'PASS' if passed else 'FAIL'}] {name} (got {status_code}, expected {expected_code})"
        print(msg)
        results.append((name, passed, status_code, expected_code))
        return passed

    print("=== 1. TESTING AUTHENTICATION ===")
    
    # 1.1 Valid Admin Login
    s, d = req('/auth/login', 'POST', {'email': 'admin@capacityconnect.com', 'password': 'Admin@123'})
    test("Admin Login", s, 200)
    admin_token = d.get('data', {}).get('token')

    # 1.2 Valid Trainer Login (Sarah Chen, id=2)
    s, d = req('/auth/login', 'POST', {'email': 'sarah.chen@example.com', 'password': 'Trainer@123'})
    test("Trainer (Sarah) Login", s, 200)
    sarah_token = d.get('data', {}).get('token')

    # 1.3 Valid Trainer Login (Marcus Johnson, id=3)
    s, d = req('/auth/login', 'POST', {'email': 'marcus.johnson@example.com', 'password': 'Trainer@123'})
    test("Trainer (Marcus) Login", s, 200)
    marcus_token = d.get('data', {}).get('token')

    # 1.4 Valid Trainee Login (Alex Rivera)
    s, d = req('/auth/login', 'POST', {'email': 'alex.rivera@example.com', 'password': 'Trainee@123'})
    test("Trainee (Alex) Login", s, 200)
    trainee_token = d.get('data', {}).get('token')

    # 1.5 Wrong password
    s, d = req('/auth/login', 'POST', {'email': 'admin@capacityconnect.com', 'password': 'WrongPassword!'})
    test("Login with wrong password -> 401", s, 401)

    # 1.6 Non-existent user
    s, d = req('/auth/login', 'POST', {'email': 'nobody@nonexistent.com', 'password': 'Password123'})
    test("Login non-existent user -> 401", s, 401)

    print("\n=== 2. TESTING UNAUTHORIZED REQUESTS ===")

    # 2.1 No token to protected route
    s, d = req('/admin/dashboard', 'GET')
    test("No token to /admin/dashboard -> 401", s, 401)

    # 2.2 Invalid/Malformed token
    s, d = req('/admin/dashboard', 'GET', token="invalid.token.here")
    test("Invalid token -> 401", s, 401)

    # 2.3 No token to /progress/dashboard
    s, d = req('/progress/dashboard', 'GET')
    test("No token to /progress/dashboard -> 401", s, 401)

    # 2.4 No token to /trainer/courses
    s, d = req('/trainer/courses', 'GET')
    test("No token to /trainer/courses -> 401", s, 401)

    print("\n=== 3. TESTING ROLE-BASED ACCESS CONTROL (RBAC) ===")

    # 3.1 Trainee trying to access Admin dashboard -> 403
    s, d = req('/admin/dashboard', 'GET', token=trainee_token)
    test("Trainee accessing /admin/dashboard -> 403", s, 403)

    # 3.2 Trainee trying to access Admin users -> 403
    s, d = req('/admin/users', 'GET', token=trainee_token)
    test("Trainee accessing /admin/users -> 403", s, 403)

    # 3.3 Trainee trying to access Trainer courses -> 403
    s, d = req('/trainer/courses', 'GET', token=trainee_token)
    test("Trainee accessing /trainer/courses -> 403", s, 403)

    # 3.4 Trainee trying to create course -> 403
    s, d = req('/trainer/courses', 'POST', {'title': 'Hack Course'}, token=trainee_token)
    test("Trainee creating course via /trainer/courses -> 403", s, 403)

    # 3.5 Trainer trying to access Admin dashboard -> 403
    s, d = req('/admin/dashboard', 'GET', token=sarah_token)
    test("Trainer accessing /admin/dashboard -> 403", s, 403)

    # 3.6 Trainer trying to access Admin user management -> 403
    s, d = req('/admin/users', 'GET', token=sarah_token)
    test("Trainer accessing /admin/users -> 403", s, 403)

    # 3.7 Trainer trying to access Admin settings -> 403
    s, d = req('/admin/settings', 'GET', token=sarah_token)
    test("Trainer accessing /admin/settings -> 403", s, 403)

    print("\n=== 4. TESTING TRAINER OWNERSHIP CHECKS ===")

    # Course 1 is owned by Sarah Chen (trainer_id=2)
    # Course 2 is owned by Marcus Johnson (trainer_id=3)
    
    # 4.1 Marcus trying to UPDATE Sarah's course (id=1) -> 403
    s, d = req('/trainer/courses/1', 'PUT', {'title': 'Hacked Title'}, token=marcus_token)
    test("Trainer Marcus modifying Sarah's course (id=1) -> 403", s, 403)

    # 4.2 Marcus trying to DELETE Sarah's course (id=1) -> 403
    s, d = req('/trainer/courses/1', 'DELETE', token=marcus_token)
    test("Trainer Marcus deleting Sarah's course (id=1) -> 403", s, 403)

    # 4.3 Sarah modifying HER OWN course (id=1) -> 200
    s, d = req('/trainer/courses/1', 'PUT', {'title': 'Full-Stack Web Development'}, token=sarah_token)
    test("Trainer Sarah modifying her own course (id=1) -> 200", s, 200)

    print("\n=== 5. TESTING AUTHORIZED ACCESS PER ROLE ===")

    # 5.1 Admin authorized access to /admin/dashboard
    s, d = req('/admin/dashboard', 'GET', token=admin_token)
    test("Admin accessing /admin/dashboard -> 200", s, 200)

    # 5.2 Admin authorized access to /admin/users
    s, d = req('/admin/users', 'GET', token=admin_token)
    test("Admin accessing /admin/users -> 200", s, 200)

    # 5.3 Admin authorized access to /admin/settings
    s, d = req('/admin/settings', 'GET', token=admin_token)
    test("Admin accessing /admin/settings -> 200", s, 200)

    # 5.4 Trainer authorized access to /trainer/courses
    s, d = req('/trainer/courses', 'GET', token=sarah_token)
    test("Trainer accessing /trainer/courses -> 200", s, 200)

    # 5.5 Trainer authorized access to /trainer/students
    s, d = req('/trainer/students', 'GET', token=sarah_token)
    test("Trainer accessing /trainer/students -> 200", s, 200)

    # 5.6 Trainee authorized access to /progress/dashboard
    s, d = req('/progress/dashboard', 'GET', token=trainee_token)
    test("Trainee accessing /progress/dashboard -> 200", s, 200)

    # 5.7 Trainee authorized access to /certificates
    s, d = req('/certificates', 'GET', token=trainee_token)
    test("Trainee accessing /certificates -> 200", s, 200)

    # Summary
    total = len(results)
    passed = sum(1 for r in results if r[1])
    failed = total - passed
    print(f"\n==========================================")
    print(f"RBAC & AUTH TEST SUMMARY: {passed}/{total} PASSED ({failed} FAILED)")
    print(f"==========================================")
    if failed > 0:
        sys.exit(1)

if __name__ == '__main__':
    run()
