import urllib.request
import json
import urllib.error

BASE_URL = 'http://localhost:5000/api'

def api_call(endpoint, method='GET', data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f"Bearer {token}"
    body = json.dumps(data).encode('utf-8') if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        try:
            parsed = json.loads(err_body)
        except:
            parsed = {'raw': err_body}
        return e.code, parsed

def run_tests():
    print("=== STARTING BACKEND SUPER ADMIN & APPROVAL TESTS ===\n")
    tests_passed = 0
    total_tests = 0

    def assert_test(cond, title, detail=""):
        nonlocal tests_passed, total_tests
        total_tests += 1
        if cond:
            print(f"[PASS] {title} {f'- {detail}' if detail else ''}")
            tests_passed += 1
        else:
            print(f"[FAIL] {title} {f'- {detail}' if detail else ''}")
            raise AssertionError(f"Test failed: {title} - {detail}")

    # 1. Super Admin Login (Siddharth Paradhi)
    status, res = api_call('/auth/login', 'POST', {'email': 'paradhisiddharth@gmail.com', 'password': '190925'})
    assert_test(status == 200, "Super Admin Login HTTP 200", f"Status: {status}")
    siddharth_token = res['data']['token']
    siddharth_user = res['data']['user']
    assert_test(siddharth_user['role'] == 'admin', "Super Admin role is admin")
    assert_test(siddharth_user['is_super_admin'] is True, "Super Admin is_super_admin flag is True")
    assert_test(siddharth_user['status'] == 'active', "Super Admin status is active")
    assert_test('password' not in siddharth_user and 'password_hash' not in siddharth_user, "No password or hash in user to_dict()")

    # 2. Standard Admin Login (Platform Admin)
    status, res = api_call('/auth/login', 'POST', {'email': 'admin@capacityconnect.com', 'password': 'Admin@123'})
    assert_test(status == 200, "Standard Admin Login HTTP 200", f"Status: {status}")
    demo_admin_token = res['data']['token']
    demo_admin_user = res['data']['user']
    assert_test(demo_admin_user['role'] == 'admin', "Standard Admin role is admin")
    assert_test(demo_admin_user['is_super_admin'] is False, "Standard Admin is_super_admin flag is False")
    assert_test(demo_admin_user['status'] == 'active', "Standard Admin status is active")

    # 3. Standard Admin blocked from Super Admin approval requests
    status, res = api_call('/admin/approval-requests', 'GET', token=demo_admin_token)
    assert_test(status == 403, "Standard Admin blocked from approval-requests with 403", f"Got: {status}")

    # 4. Trainee blocked from approval requests
    status, res = api_call('/auth/login', 'POST', {'email': 'arjun.nair@example.com', 'password': 'Trainee@123'})
    trainee_token = res['data']['token']
    status, res = api_call('/admin/approval-requests', 'GET', token=trainee_token)
    assert_test(status == 403, "Trainee blocked from approval-requests with 403", f"Got: {status}")

    # 5. Trainer blocked from approval requests
    status, res = api_call('/auth/login', 'POST', {'email': 'ananya.iyer@example.com', 'password': 'Trainer@123'})
    trainer_token = res['data']['token']
    status, res = api_call('/admin/approval-requests', 'GET', token=trainer_token)
    assert_test(status == 403, "Trainer blocked from approval-requests with 403", f"Got: {status}")

    # 6. Unauthenticated blocked
    status, res = api_call('/admin/approval-requests', 'GET')
    assert_test(status == 401, "Unauthenticated blocked with 401", f"Got: {status}")

    # 7. Super Admin can access approval requests
    status, res = api_call('/admin/approval-requests', 'GET', token=siddharth_token)
    assert_test(status == 200, "Super Admin can access approval-requests with 200", f"Pending count: {len(res['data'])}")

    # 8. Create new Admin user (defaults to pending)
    import time
    ts = int(time.time())
    new_admin_email = f"pending_admin_{ts}@example.com"
    status, res = api_call('/admin/users', 'POST', {
        'name': 'Pending Admin Test',
        'email': new_admin_email,
        'password': 'Password@123',
        'role': 'admin'
    }, token=siddharth_token)
    assert_test(status == 201, "Admin user creation HTTP 201", f"Status: {status}")
    pending_user = res['data']
    assert_test(pending_user['status'] == 'pending', "Created Admin has status 'pending'")
    assert_test(pending_user['is_super_admin'] is False, "Created Admin is_super_admin is False")
    pending_id = pending_user['id']

    # 9. Pending Admin login is blocked
    status, res = api_call('/auth/login', 'POST', {'email': new_admin_email, 'password': 'Password@123'})
    assert_test(status == 403, "Pending Admin login blocked with 403")
    assert_test(res.get('message') == 'Your administrator account is awaiting approval.', "Pending Admin receives awaiting approval message", res.get('message'))

    # 10. Standard Admin cannot approve
    status, res = api_call(f'/admin/users/{pending_id}/approve', 'POST', token=demo_admin_token)
    assert_test(status == 403, "Standard Admin blocked from approving with 403")

    # 11. Super Admin approves pending Admin
    status, res = api_call(f'/admin/users/{pending_id}/approve', 'POST', token=siddharth_token)
    assert_test(status == 200, "Super Admin approved pending admin with 200")
    approved_user = res['data']
    assert_test(approved_user['status'] == 'active', "Approved user status transitioned to 'active'")
    assert_test(approved_user['approved_by'] == siddharth_user['id'], "Approved user records approved_by ID")
    assert_test(bool(approved_user['approved_at']), "Approved user records approval timestamp")

    # 12. Approved Admin can now log in
    status, res = api_call('/auth/login', 'POST', {'email': new_admin_email, 'password': 'Password@123'})
    assert_test(status == 200, "Approved Admin successfully logs in with 200")
    assert_test(res['data']['user']['status'] == 'active', "Approved Admin profile status is active")

    # 13. State transition safety: Cannot approve already active user
    status, res = api_call(f'/admin/users/{pending_id}/approve', 'POST', token=siddharth_token)
    assert_test(status == 409, "Cannot re-approve active user (409 Conflict)", res.get('message'))

    # 14. Create another admin to test rejection
    reject_admin_email = f"reject_admin_{ts}@example.com"
    status, res = api_call('/admin/users', 'POST', {
        'name': 'Rejected Admin Test',
        'email': reject_admin_email,
        'password': 'Password@123',
        'role': 'admin'
    }, token=siddharth_token)
    assert_test(status == 201, "Second Admin user created")
    reject_id = res['data']['id']

    # 15. Super Admin rejects admin
    status, res = api_call(f'/admin/users/{reject_id}/reject', 'POST', token=siddharth_token)
    assert_test(status == 200, "Super Admin rejected admin with 200")
    rejected_user = res['data']
    assert_test(rejected_user['status'] == 'rejected', "User status transitioned to 'rejected'")
    assert_test(rejected_user['rejected_by'] == siddharth_user['id'], "User records rejected_by ID")
    assert_test(bool(rejected_user['rejected_at']), "User records rejection timestamp")

    # 16. Rejected Admin login is blocked
    status, res = api_call('/auth/login', 'POST', {'email': reject_admin_email, 'password': 'Password@123'})
    assert_test(status == 403, "Rejected Admin login blocked with 403")
    assert_test(res.get('message') == 'Your administrator account has been rejected.', "Rejected Admin receives rejected message", res.get('message'))

    # 17. State transition safety: Cannot approve already rejected user
    status, res = api_call(f'/admin/users/{reject_id}/approve', 'POST', token=siddharth_token)
    assert_test(status == 409, "Cannot approve already rejected user (409 Conflict)", res.get('message'))

    # 18. Public registration cannot create Admin
    status, res = api_call('/auth/register', 'POST', {
        'name': 'Hacker Admin',
        'email': f'hacker_{ts}@example.com',
        'password': 'Password@123',
        'role': 'admin'
    })
    assert_test(status == 400, "Public registration with role='admin' blocked with 400")

    # 19. Check database for duplicate Siddharth account
    from app import create_app
    from app.models.user import User
    app = create_app()
    with app.app_context():
        siddharth_count = User.query.filter_by(email='paradhisiddharth@gmail.com').count()
        assert_test(siddharth_count == 1, "Exactly ONE Siddharth account exists (no duplicates)", f"Count: {siddharth_count}")

    # ==========================================
    # LESSON AUTHORIZATION & ENROLLMENT TESTS
    # ==========================================
    print("\n--- Lesson Authorization & Enrollment Tests ---")

    # 20. Enrolled Trainee (Arjun Nair) accesses lesson in Course 1 (Lesson 1: Intro to Web Dev)
    # Arjun Nair is enrolled in Course 1
    status, res = api_call('/lessons/1', 'GET', token=trainee_token)
    assert_test(status == 200, "Enrolled trainee accesses Lesson 1 with HTTP 200", res.get('data', {}).get('title'))
    assert_test(res['data']['course_id'] == 1, "Lesson 1 resolved to Course 1")
    assert_test(res['data']['id'] == 1, "Lesson ID is 1")

    # 21. Reopening / Refreshing lesson returns HTTP 200
    status, res = api_call('/lessons/1', 'GET', token=trainee_token)
    assert_test(status == 200, "Reopening/refreshing Lesson 1 returns HTTP 200", res.get('data', {}).get('title'))

    # 22. Next lesson in same course also loads
    status, res = api_call('/lessons/2', 'GET', token=trainee_token)
    assert_test(status == 200, "Navigating to Lesson 2 in same course returns HTTP 200", res.get('data', {}).get('title'))

    # 23. Unenrolled trainee receives HTTP 403 on lessons of a course they are not enrolled in
    # Create fresh trainee not enrolled in anything
    fresh_trainee_email = f"fresh_trainee_{ts}@example.com"
    status, res = api_call('/auth/register', 'POST', {
        'name': 'Fresh Trainee',
        'email': fresh_trainee_email,
        'password': 'Password@123',
        'role': 'trainee'
    })
    assert_test(status == 201, "Fresh trainee registered successfully")
    status, res = api_call('/auth/login', 'POST', {'email': fresh_trainee_email, 'password': 'Password@123'})
    fresh_token = res['data']['token']

    # Fresh trainee tries to access Lesson 1 (Course 1) without enrolling
    status, res = api_call('/lessons/1', 'GET', token=fresh_token)
    assert_test(status == 403, "Unenrolled trainee receives 403 on Lesson 1", res.get('message'))
    assert_test(res.get('message') == 'You must be enrolled to view this lesson', "Correct error message returned")

    # 24. Fresh trainee tries to access Lesson 61 (Course 6: Advanced CSS) without enrolling
    status, res = api_call('/lessons/61', 'GET', token=fresh_token)
    assert_test(status == 403, "Unenrolled trainee receives 403 on Lesson 61 (Course 6)", res.get('message'))

    # 25. Fresh trainee enrolls in Course 6
    status, res = api_call('/courses/6/enroll', 'POST', token=fresh_token)
    assert_test(status == 201, "Fresh trainee successfully enrolls in Course 6", f"Status: {status}")

    # 26. Fresh trainee can now access Lesson 61 (first lesson of Course 6)
    status, res = api_call('/lessons/61', 'GET', token=fresh_token)
    assert_test(status == 200, "Newly enrolled trainee accesses Lesson 61 with HTTP 200", res.get('data', {}).get('title'))
    assert_test(res['data']['course_id'] == 6, "Lesson 61 correctly resolved to Course 6")

    # 27. Fresh trainee is STILL blocked from Lesson 1 (Course 1) because not enrolled in Course 1
    status, res = api_call('/lessons/1', 'GET', token=fresh_token)
    assert_test(status == 403, "Trainee enrolled in Course 6 is still blocked from Course 1 (Lesson 1) with 403")

    # 28. Attempting to access lesson with course ID (e.g. Lesson 6 belongs to Course 1, not Course 6)
    # Fresh trainee enrolled in Course 6 cannot access Lesson 6 (which is in Course 1)
    status, res = api_call('/lessons/6', 'GET', token=fresh_token)
    assert_test(status == 403, "Trainee enrolled in Course 6 is blocked from Lesson 6 (which belongs to Course 1)")

    # 29. Trainer/Admin can view lessons without enrollment
    status, res = api_call('/lessons/1', 'GET', token=trainer_token)
    assert_test(status == 200, "Trainer can view Lesson 1 without student enrollment")
    status, res = api_call('/lessons/1', 'GET', token=siddharth_token)
    assert_test(status == 200, "Admin can view Lesson 1 without student enrollment")

    print(f"\n==========================================")
    print(f"ALL BACKEND & AUTHORIZATION TESTS PASSED: {tests_passed}/{total_tests}")
    print(f"==========================================\n")

if __name__ == '__main__':
    run_tests()
