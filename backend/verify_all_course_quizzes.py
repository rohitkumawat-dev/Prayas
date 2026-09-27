"""
verify_all_course_quizzes.py

Comprehensive dynamic verification script:
- Dynamically discovers ALL Course records from SQLite (never hardcoded IDs).
- For every course, verifies:
  1. Associated quiz exists and quiz.course_id == course.id.
  2. Quiz passing_score == 70.0%.
  3. Quiz has >= 7 questions (exactly 8).
  4. Each question has non-empty text, 4 options (a, b, c, d), valid correct_option.
  5. Unenrolled trainee receives HTTP 403 on GET quiz, POST submit, and GET attempts.
  6. Enrolled trainee receives HTTP 200 on GET quiz, with correct_option strictly omitted.
  7. Enrolled trainee submits answers -> HTTP 200, score calculated, passed status evaluated.
  8. Real SQLite records verified in quiz_attempts and quiz_answers tables.
  9. Attempt detail endpoint returns attempt data for attempt owner.
  10. Cross-trainee attempt isolation strictly enforced with HTTP 403.
"""

import sys
import os
import time
import urllib.request
import urllib.error
import json
import sqlite3

BASE_URL = 'http://localhost:5000/api'
DB_PATH = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance', 'capacity_connect.db')

tests_passed = 0
total_tests = 0

def assert_test(condition, test_name, detail=""):
    global tests_passed, total_tests
    total_tests += 1
    if condition:
        tests_passed += 1
        print(f"[PASS] {test_name}" + (f" - {detail}" if detail else ""))
    else:
        print(f"[FAIL] {test_name}" + (f" - {detail}" if detail else ""))
        raise AssertionError(f"Test failed: {test_name} - {detail}")

def api_call(endpoint, method='GET', data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req_data = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        try:
            parsed = json.loads(err_body)
        except Exception:
            parsed = {'raw': err_body}
        return e.code, parsed

def run_all_course_quiz_verifications():
    print("=== STARTING DYNAMIC COURSE-QUIZ VERIFICATION SUITE ===\n")

    # Connect to SQLite for direct database assertions
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Dynamically discover all courses
    courses = cursor.execute('SELECT id, title, category FROM courses ORDER BY id').fetchall()
    assert_test(len(courses) > 0, f"Discovered {len(courses)} courses in database dynamically")

    # Register two distinct test trainees for enrollment & isolation tests
    ts = int(time.time())
    trainee_email = f"dynamic_trainee_{ts}@example.com"
    trainee_password = "Password@123"
    status, res = api_call('/auth/register', 'POST', {
        'name': f"Trainee Tester {ts}",
        'email': trainee_email,
        'password': trainee_password,
        'role': 'trainee'
    })
    assert_test(status == 201, "Test Trainee 1 registered successfully")

    status, res = api_call('/auth/login', 'POST', {'email': trainee_email, 'password': trainee_password})
    trainee_token = res['data']['token']
    trainee_id = res['data']['user']['id']

    # Second trainee for cross-trainee isolation
    other_email = f"dynamic_other_{ts}@example.com"
    status, res = api_call('/auth/register', 'POST', {
        'name': f"Other Trainee {ts}",
        'email': other_email,
        'password': trainee_password,
        'role': 'trainee'
    })
    assert_test(status == 201, "Test Trainee 2 registered successfully")
    status, res = api_call('/auth/login', 'POST', {'email': other_email, 'password': trainee_password})
    other_token = res['data']['token']

    print(f"\n--- Testing Every Course Dynamically ({len(courses)} courses) ---")

    for course_id, course_title, course_category in courses:
        print(f"\n>>> Verifying Course ID {course_id}: '{course_title}' ({course_category}) <<<")

        # A) Association Check: Discover associated quizzes from DB
        quizzes = cursor.execute('SELECT id, title, passing_score, time_limit_minutes FROM quizzes WHERE course_id = ?', (course_id,)).fetchall()
        assert_test(len(quizzes) >= 1, f"Course {course_id} has at least 1 associated quiz", f"Found {len(quizzes)} quiz(zes)")

        for quiz_id, quiz_title, passing_score, time_limit in quizzes:
            # B) Passing Score & Timing
            assert_test(passing_score == 70.0, f"Quiz {quiz_id} passing_score is 70.0%", f"Actual: {passing_score}")
            assert_test(time_limit == 30, f"Quiz {quiz_id} time_limit_minutes is 30m", f"Actual: {time_limit}")

            # C) Questions Verification
            questions = cursor.execute(
                'SELECT id, [order], text, option_a, option_b, option_c, option_d, correct_option, points '
                'FROM questions WHERE quiz_id = ? ORDER BY [order], id', (quiz_id,)
            ).fetchall()
            assert_test(len(questions) >= 7, f"Quiz {quiz_id} has >= 7 questions", f"Found {len(questions)} questions")
            assert_test(len(questions) == 8, f"Quiz {quiz_id} has exactly 8 questions", f"Found {len(questions)} questions")

            for q in questions:
                q_id, q_order, q_text, opt_a, opt_b, opt_c, opt_d, correct_opt, points = q
                assert_test(bool(q_text and q_text.strip()), f"Quiz {quiz_id} Q{q_id} has non-empty text")
                assert_test(bool(opt_a and opt_b and opt_c and opt_d), f"Quiz {quiz_id} Q{q_id} has all 4 options A, B, C, D")
                assert_test(correct_opt in ['a', 'b', 'c', 'd'], f"Quiz {quiz_id} Q{q_id} correct_option '{correct_opt}' is valid")
                assert_test(points >= 1, f"Quiz {quiz_id} Q{q_id} points >= 1")

            # D) Security: Unenrolled access blocked (HTTP 403)
            # Before enrolling, verify trainee 1 is blocked
            status, res = api_call(f'/quizzes/{quiz_id}', 'GET', token=trainee_token)
            assert_test(status == 403, f"Unenrolled trainee receives HTTP 403 on GET /quizzes/{quiz_id}", res.get('message'))
            assert_test(res.get('message') == 'Must be enrolled to view quiz', f"Quiz {quiz_id} enrollment error message verified")

            status, res = api_call(f'/quizzes/{quiz_id}/submit', 'POST', {'answers': {str(questions[0][0]): 'a'}}, token=trainee_token)
            assert_test(status == 403, f"Unenrolled trainee receives HTTP 403 on POST /quizzes/{quiz_id}/submit", res.get('message'))

            status, res = api_call(f'/quizzes/{quiz_id}/attempts', 'GET', token=trainee_token)
            assert_test(status == 403, f"Unenrolled trainee receives HTTP 403 on GET /quizzes/{quiz_id}/attempts", res.get('message'))

            # E) Trainee Enrollment
            status, res = api_call(f'/courses/{course_id}/enroll', 'POST', token=trainee_token)
            assert_test(status in [201, 409], f"Trainee 1 enrolled in Course {course_id} (Status: {status})")

            # F) Enrolled Trainee GET Quiz: Answers hidden
            status, res = api_call(f'/quizzes/{quiz_id}', 'GET', token=trainee_token)
            assert_test(status == 200, f"Enrolled trainee receives HTTP 200 on GET /quizzes/{quiz_id}")
            quiz_payload = res['data']
            assert_test(quiz_payload['id'] == quiz_id, f"Quiz ID in response matches {quiz_id}")
            assert_test(quiz_payload['course_id'] == course_id, f"Quiz payload course_id matches Course {course_id}")
            assert_test(len(quiz_payload['questions']) == len(questions), f"All {len(questions)} questions returned to enrolled trainee")

            # Crucial security check: correct_option NEVER present in trainee response
            has_leaked_answer = any('correct_option' in q for q in quiz_payload['questions'])
            assert_test(not has_leaked_answer, f"Quiz {quiz_id} GET response strictly omits correct_option")

            # G) Trainee Submit Quiz with Perfect Answers
            perfect_answers = {str(q[0]): q[7] for q in questions}
            total_points = sum(q[8] for q in questions)

            status, res = api_call(f'/quizzes/{quiz_id}/submit', 'POST', {'answers': perfect_answers}, token=trainee_token)
            assert_test(status == 200, f"Quiz {quiz_id} submitted successfully (HTTP 200)")
            attempt_data = res['data']
            attempt_id = attempt_data['id']
            assert_test(attempt_data['user_id'] == trainee_id, f"Attempt user_id ({attempt_data['user_id']}) matches trainee ({trainee_id})")
            assert_test(attempt_data['quiz_id'] == quiz_id, f"Attempt quiz_id ({attempt_data['quiz_id']}) matches quiz ({quiz_id})")
            assert_test(attempt_data['score'] == total_points, f"Attempt score is perfect: {attempt_data['score']}/{total_points}")
            assert_test(attempt_data['percentage'] == 100.0, f"Attempt percentage is 100.0%")
            assert_test(attempt_data['passed'] is True, f"Attempt passed status is True")

            # H) Real Database Persistence in SQLite
            attempt_row = cursor.execute('SELECT id, user_id, quiz_id, score, percentage, passed FROM quiz_attempts WHERE id = ?', (attempt_id,)).fetchone()
            assert_test(attempt_row is not None, f"QuizAttempt row {attempt_id} persisted in SQLite")
            assert_test(attempt_row[1] == trainee_id, f"SQLite attempt user_id == {trainee_id}")
            assert_test(attempt_row[2] == quiz_id, f"SQLite attempt quiz_id == {quiz_id}")
            assert_test(attempt_row[3] == total_points, f"SQLite attempt score == {total_points}")
            assert_test(attempt_row[5] == 1, f"SQLite attempt passed == 1")

            # Verify QuizAnswer rows in SQLite
            answer_rows = cursor.execute('SELECT id, question_id, selected_option, is_correct FROM quiz_answers WHERE attempt_id = ?', (attempt_id,)).fetchall()
            assert_test(len(answer_rows) == len(questions), f"All {len(questions)} QuizAnswer rows persisted in SQLite for attempt {attempt_id}")
            for a_row in answer_rows:
                assert_test(a_row[3] == 1, f"QuizAnswer {a_row[0]} is_correct == 1")

            # I) Attempt Detail & Attempt History
            status, res = api_call(f'/quizzes/{quiz_id}/attempts', 'GET', token=trainee_token)
            assert_test(status == 200, f"GET /quizzes/{quiz_id}/attempts returns HTTP 200")
            assert_test(any(a['id'] == attempt_id for a in res['data']), f"Attempt {attempt_id} found in trainee's attempts list")

            status, res = api_call(f'/quizzes/{quiz_id}/attempts/{attempt_id}', 'GET', token=trainee_token)
            assert_test(status == 200, f"Trainee 1 can access own attempt {attempt_id} details (HTTP 200)")
            assert_test(len(res['data']['answers']) == len(questions), f"Attempt detail contains all {len(questions)} answer records")

            # J) Cross-Trainee Attempt Isolation
            status, res = api_call(f'/quizzes/{quiz_id}/attempts/{attempt_id}', 'GET', token=other_token)
            assert_test(status == 403, f"Second trainee BLOCKED from accessing attempt {attempt_id} (HTTP 403)", res.get('message'))
            assert_test(res.get('message') == "Unauthorized to access another trainee's attempt", f"Isolation message verified")

    conn.close()
    print("\n==========================================")
    print(f"ALL COURSE QUIZ VERIFICATIONS PASSED: {tests_passed}/{total_tests}")
    print("==========================================\n")

if __name__ == '__main__':
    run_all_course_quiz_verifications()
