import urllib.request
import json
import urllib.error
import sqlite3

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

def run_quiz_tests():
    print("=== STARTING DEDICATED TRAINEE QUIZ BACKEND TEST SUITE ===\n")
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

    # 1. Login as enrolled Trainee (Arjun Nair - user_id 5)
    status, res = api_call('/auth/login', 'POST', {'email': 'arjun.nair@example.com', 'password': 'Trainee@123'})
    assert_test(status == 200, "Enrolled Trainee Arjun Nair login successful", f"Status: {status}")
    trainee_token = res['data']['token']
    trainee_id = res['data']['user']['id']

    # 2. Get Quiz 1 (Course 1: Full-Stack Web Development)
    status, res = api_call('/quizzes/1', 'GET', token=trainee_token)
    assert_test(status == 200, "Quiz 1 loads from real SQLite database", res['data']['title'])
    quiz_data = res['data']
    assert_test(quiz_data['id'] == 1, "Quiz ID is 1")
    assert_test(len(quiz_data['questions']) > 0, f"All {len(quiz_data['questions'])} questions loaded from database")

    # 3. Security: Check that correct_option is NOT exposed in get_quiz
    for q in quiz_data['questions']:
        assert_test('correct_option' not in q, f"Question {q['id']} omits correct_option (no leak to client)")
        assert_test(bool(q['text']), f"Question {q['id']} text is non-empty")
        assert_test(bool(q['option_a']) and bool(q['option_b']), f"Question {q['id']} options loaded")

    # 4. Query real SQLite database for actual answer keys
    conn = sqlite3.connect('instance/capacity_connect.db')
    cursor = conn.cursor()
    db_questions = cursor.execute('SELECT id, correct_option, points FROM questions WHERE quiz_id = 1').fetchall()
    assert_test(len(db_questions) == len(quiz_data['questions']), "Database questions count matches API questions count")

    # Build answers: answer all correctly
    perfect_answers = {str(q_id): correct_opt for q_id, correct_opt, _ in db_questions}
    total_possible_points = sum(points for _, _, points in db_questions)

    # 5. Submit Quiz with answers
    status, res = api_call('/quizzes/1/submit', 'POST', {'answers': perfect_answers}, token=trainee_token)
    assert_test(status == 200, "Quiz submitted successfully", f"Status: {status}")
    attempt_data = res['data']
    attempt_id = attempt_data['id']
    assert_test(attempt_data['user_id'] == trainee_id, "QuizAttempt user_id matches logged-in trainee")
    assert_test(attempt_data['quiz_id'] == 1, "QuizAttempt quiz_id is 1")
    assert_test(attempt_data['score'] == total_possible_points, f"Score correctly calculated: {attempt_data['score']}/{total_possible_points}")
    assert_test(attempt_data['percentage'] == 100.0, f"Percentage is 100%: {attempt_data['percentage']}")
    assert_test(attempt_data['passed'] is True, "Attempt passed status is True")

    # 6. Verify real SQLite database persistence for QuizAttempt
    db_attempt = cursor.execute(
        'SELECT id, user_id, quiz_id, score, total_points, percentage, passed, completed_at FROM quiz_attempts WHERE id = ?',
        (attempt_id,)
    ).fetchone()
    assert_test(db_attempt is not None, f"QuizAttempt row exists in SQLite table quiz_attempts (id: {attempt_id})")
    assert_test(db_attempt[1] == trainee_id, f"SQLite attempt user_id == {trainee_id}")
    assert_test(db_attempt[3] == total_possible_points, f"SQLite attempt score == {total_possible_points}")
    assert_test(db_attempt[6] == 1, "SQLite attempt passed == 1")

    # 7. Verify real SQLite database persistence for QuizAnswer rows
    db_answers = cursor.execute(
        'SELECT id, attempt_id, question_id, selected_option, is_correct FROM quiz_answers WHERE attempt_id = ?',
        (attempt_id,)
    ).fetchall()
    assert_test(len(db_answers) == len(db_questions), f"All {len(db_questions)} QuizAnswer rows persisted in SQLite")
    for ans in db_answers:
        assert_test(ans[1] == attempt_id, f"Answer row {ans[0]} belongs to attempt {attempt_id}")
        assert_test(ans[4] == 1, f"Answer row {ans[0]} is_correct == 1")

    # 8. Reopening quiz attempts via GET /quizzes/1/attempts
    status, res = api_call('/quizzes/1/attempts', 'GET', token=trainee_token)
    assert_test(status == 200, "GET /quizzes/1/attempts returns HTTP 200")
    attempts_list = res['data']
    assert_test(len(attempts_list) > 0, f"Returned {len(attempts_list)} attempt(s)")
    latest_attempt = attempts_list[0]
    assert_test(latest_attempt['id'] == attempt_id, f"Latest attempt in list is our newly submitted attempt (id: {attempt_id})")
    assert_test(latest_attempt['score'] == total_possible_points, "Persisted score verified in attempts list")

    # 9. Verify single attempt detail endpoint GET /quizzes/1/attempts/<attempt_id>
    status, res = api_call(f'/quizzes/1/attempts/{attempt_id}', 'GET', token=trainee_token)
    assert_test(status == 200, f"Trainee can view their own attempt {attempt_id} details (HTTP 200)")
    assert_test(len(res['data']['answers']) == len(db_questions), "Detailed attempt returns answer records")

    # 10. Trainee Isolation: Another trainee CANNOT view Arjun Nair's attempt
    # Login as Kavya Reddy (user_id 6)
    status, res = api_call('/auth/login', 'POST', {'email': 'kavya.reddy@example.com', 'password': 'Trainee@123'})
    emma_token = res['data']['token']
    status, res = api_call(f'/quizzes/1/attempts/{attempt_id}', 'GET', token=emma_token)
    assert_test(status == 403, "Other trainee (Kavya Reddy) BLOCKED from viewing Arjun's attempt with 403", res.get('message'))

    # Kavya enrolls in course 1 to test attempt isolation when both are enrolled
    api_call('/courses/1/enroll', 'POST', token=emma_token)
    status, res = api_call('/quizzes/1/attempts', 'GET', token=emma_token)
    assert_test(status == 200, "Enrolled trainee (Kavya) can view attempts endpoint (HTTP 200)")
    emma_attempts = res.get('data') or []
    alex_attempt_in_emma = any(a['id'] == attempt_id for a in emma_attempts)
    assert_test(not alex_attempt_in_emma, "Kavya's attempt list strictly excludes Arjun's attempt")

    # 11. Unenrolled trainee receives HTTP 403 on GET quiz
    # Register fresh trainee with zero enrollments
    import time
    ts = int(time.time())
    fresh_email = f"unenrolled_quiz_{ts}@example.com"
    status, res = api_call('/auth/register', 'POST', {
        'name': 'Unenrolled Quiz Tester',
        'email': fresh_email,
        'password': 'Password@123',
        'role': 'trainee'
    })
    status, res = api_call('/auth/login', 'POST', {'email': fresh_email, 'password': 'Password@123'})
    unenrolled_token = res['data']['token']

    status, res = api_call('/quizzes/1', 'GET', token=unenrolled_token)
    assert_test(status == 403, "Unenrolled trainee received HTTP 403 on GET /quizzes/1", res.get('message'))
    assert_test(res.get('message') == 'Must be enrolled to view quiz', "Exact enrollment error message received")

    # 12. Unenrolled trainee receives HTTP 403 on POST submit quiz
    status, res = api_call('/quizzes/1/submit', 'POST', {'answers': {'1': 'a'}}, token=unenrolled_token)
    assert_test(status == 403, "Unenrolled trainee received HTTP 403 on POST /quizzes/1/submit", res.get('message'))
    assert_test(res.get('message') == 'Must be enrolled to submit quiz', "Exact submission error message received")

    # 13. Unenrolled trainee receives HTTP 403 on GET attempts
    status, res = api_call('/quizzes/1/attempts', 'GET', token=unenrolled_token)
    assert_test(status == 403, "Unenrolled trainee received HTTP 403 on GET /quizzes/1/attempts", res.get('message'))

    # 14. Trainer functionality intact: Trainer Ananya Iyer can view quiz and course quizzes
    status, res = api_call('/auth/login', 'POST', {'email': 'ananya.iyer@example.com', 'password': 'Trainer@123'})
    trainer_token = res['data']['token']
    status, res = api_call('/quizzes/1', 'GET', token=trainer_token)
    assert_test(status == 200, "Trainer Ananya Iyer can view Quiz 1 without trainee enrollment requirement")

    # 15. Admin functionality intact: Super Admin Siddharth can view quiz
    status, res = api_call('/auth/login', 'POST', {'email': 'paradhisiddharth@gmail.com', 'password': '190925'})
    admin_token = res['data']['token']
    status, res = api_call('/quizzes/1', 'GET', token=admin_token)
    assert_test(status == 200, "Super Admin Siddharth can view Quiz 1 without trainee enrollment requirement")

    conn.close()
    print(f"\n==========================================")
    print(f"ALL QUIZ BACKEND TESTS PASSED: {tests_passed}/{total_tests}")
    print(f"==========================================\n")

if __name__ == '__main__':
    run_quiz_tests()
