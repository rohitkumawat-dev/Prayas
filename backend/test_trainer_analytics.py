"""
test_trainer_analytics.py

Automated integration test suite for Trainer Performance Analytics.
Dynamically discovers actual trainers, owned courses, unowned courses, and enrolled trainees from the database.
Verifies RBAC, course ownership isolation, data accuracy against direct SQLite queries, and deterministic insights.
"""

import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from datetime import datetime, timedelta, timezone
import jwt
from app import create_app, db
from app.models.user import User
from app.models.course import Course
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAttempt
from app.models.enrollment import Enrollment

def run_tests():
    app = create_app()
    with app.app_context():
        client = app.test_client()
        print("==================================================")
        print("STARTING TRAINER ANALYTICS INTEGRATION TESTS")
        print("==================================================")

        # 1. DYNAMIC DISCOVERY
        # Find a trainer who owns at least one course
        all_trainers = User.query.filter_by(role='trainer').all()
        assert len(all_trainers) >= 2, "Need at least 2 trainers in the database for cross-ownership testing"

        trainer_a = None
        owned_course = None
        for t in all_trainers:
            course = Course.query.filter_by(trainer_id=t.id).first()
            if course:
                trainer_a = t
                owned_course = course
                break

        assert trainer_a and owned_course, "Could not discover a trainer with an owned course"
        print(f"Discovered Trainer A: ID={trainer_a.id}, Email={trainer_a.email}, Name='{trainer_a.name}'")
        print(f"Discovered Owned Course: ID={owned_course.id}, Title='{owned_course.title}'")

        # Discover a course owned by ANOTHER trainer
        unowned_course = Course.query.filter(Course.trainer_id != trainer_a.id).first()
        assert unowned_course, "Could not discover an unowned course"
        trainer_b = User.query.get(unowned_course.trainer_id)
        print(f"Discovered Unowned Course: ID={unowned_course.id}, Title='{unowned_course.title}' (Trainer: {trainer_b.name} ID={trainer_b.id})")

        # Discover a trainee
        trainee = User.query.filter_by(role='trainee').first()
        assert trainee, "Could not discover a trainee in the database"
        print(f"Discovered Trainee: ID={trainee.id}, Email={trainee.email}, Name='{trainee.name}'")

        # Generate tokens
        def make_token(uid):
            return jwt.encode({
                'sub': uid,
                'exp': datetime.now(timezone.utc) + timedelta(hours=24)
            }, app.config['SECRET_KEY'], algorithm='HS256')

        token_trainer_a = make_token(trainer_a.id)
        token_trainer_b = make_token(trainer_b.id)
        token_trainee = make_token(trainee.id)

        headers_trainer_a = {'Authorization': f'Bearer {token_trainer_a}'}
        headers_trainer_b = {'Authorization': f'Bearer {token_trainer_b}'}
        headers_trainee = {'Authorization': f'Bearer {token_trainee}'}

        # -----------------------------------------------------------------
        # TEST 1: AUTHORIZATION AND OWNERSHIP ACCESS CONTROL
        # -----------------------------------------------------------------
        print("\n--- TEST 1: AUTHORIZATION & OWNERSHIP ISOLATION ---")
        
        # 1.1 Unauthenticated requests should return 401
        res = client.get(f'/api/trainer/courses/{owned_course.id}/performance')
        assert res.status_code == 401, f"Expected 401 for unauthenticated request, got {res.status_code}"
        print("[PASS] Unauthenticated access returns 401 Unauthorized")

        # 1.2 Trainee token should return 403
        res = client.get(f'/api/trainer/courses/{owned_course.id}/performance', headers=headers_trainee)
        assert res.status_code == 403, f"Expected 403 for trainee access, got {res.status_code}"
        print("[PASS] Trainee role access returns 403 Forbidden")

        # 1.3 Other trainer (unowned course) should return 403
        res = client.get(f'/api/trainer/courses/{unowned_course.id}/performance', headers=headers_trainer_a)
        assert res.status_code == 403, f"Expected 403 for cross-trainer access, got {res.status_code}"
        print(f"[PASS] Trainer A accessing Course {unowned_course.id} (owned by Trainer B) returns 403 Forbidden")

        # 1.4 Legitimate owner should return 200
        res = client.get(f'/api/trainer/courses/{owned_course.id}/performance', headers=headers_trainer_a)
        assert res.status_code == 200, f"Expected 200 for course owner, got {res.status_code}: {res.get_json()}"
        print("[PASS] Course owner accessing own course returns 200 OK")

        # -----------------------------------------------------------------
        # TEST 2: COURSE PERFORMANCE AGGREGATIONS VALIDATION
        # -----------------------------------------------------------------
        print("\n--- TEST 2: COURSE PERFORMANCE METRICS ACCURACY ---")
        perf_data = res.get_json()['data']
        assert perf_data['course_id'] == owned_course.id
        assert perf_data['course_title'] == owned_course.title

        # Query direct SQLite database to verify data integrity
        direct_enrollments = Enrollment.query.filter_by(course_id=owned_course.id).all()
        direct_quizzes = Quiz.query.filter_by(course_id=owned_course.id).all()
        direct_quiz_ids = [q.id for q in direct_quizzes]
        direct_attempts = QuizAttempt.query.filter(QuizAttempt.quiz_id.in_(direct_quiz_ids)).all() if direct_quiz_ids else []

        assert perf_data['enrolled_trainees_count'] == len(direct_enrollments), \
            f"Enrolled count mismatch: {perf_data['enrolled_trainees_count']} vs DB {len(direct_enrollments)}"
        assert perf_data['total_attempts_count'] == len(direct_attempts), \
            f"Total attempts mismatch: {perf_data['total_attempts_count']} vs DB {len(direct_attempts)}"
        
        unique_trainees = len({a.user_id for a in direct_attempts})
        assert perf_data['attempted_trainees_count'] == unique_trainees, \
            f"Unique trainees mismatch: {perf_data['attempted_trainees_count']} vs DB {unique_trainees}"

        passed_count = sum(1 for a in direct_attempts if a.passed)
        failed_count = len(direct_attempts) - passed_count
        assert perf_data['passed_count'] == passed_count
        assert perf_data['failed_count'] == failed_count

        if len(direct_attempts) > 0:
            expected_avg = round(sum(a.percentage for a in direct_attempts) / len(direct_attempts), 1)
            expected_pass_rate = round(passed_count / len(direct_attempts) * 100, 1)
            assert perf_data['average_score'] == expected_avg, f"Avg mismatch: {perf_data['average_score']} vs {expected_avg}"
            assert perf_data['pass_rate'] == expected_pass_rate, f"Pass rate mismatch: {perf_data['pass_rate']} vs {expected_pass_rate}"
        print(f"[PASS] Metrics verified against direct SQLite records: Enrolled={perf_data['enrolled_trainees_count']}, Attempts={perf_data['total_attempts_count']}, Avg={perf_data['average_score']}%, Pass Rate={perf_data['pass_rate']}%")

        # -----------------------------------------------------------------
        # TEST 3: COURSE LEARNERS PERFORMANCE LIST
        # -----------------------------------------------------------------
        print("\n--- TEST 3: COURSE LEARNERS LIST VALIDATION ---")
        # Test ownership enforcement on /learners
        res_learners_unowned = client.get(f'/api/trainer/courses/{unowned_course.id}/learners', headers=headers_trainer_a)
        assert res_learners_unowned.status_code == 403, "Expected 403 on unowned course /learners"

        res_learners = client.get(f'/api/trainer/courses/{owned_course.id}/learners', headers=headers_trainer_a)
        assert res_learners.status_code == 200
        learners_data = res_learners.get_json()['data']
        assert isinstance(learners_data, list)
        assert len(learners_data) == len(direct_enrollments), f"Expected {len(direct_enrollments)} learners, got {len(learners_data)}"

        for l in learners_data:
            assert 'trainee_id' in l
            assert 'trainee_name' in l
            assert 'attempts_count' in l
            assert 'status_label' in l
            assert l['status_label'] in ['PASSED', 'NEEDS_REVIEW', 'NOT_STARTED']
            assert 'suggestions' in l
            assert len(l['suggestions']) > 0

        print(f"[PASS] Verified {len(learners_data)} enrolled learners returned with complete status, scores, and suggestions")

        # -----------------------------------------------------------------
        # TEST 4: INDIVIDUAL LEARNER DETAIL & ATTEMPTS TIMELINE
        # -----------------------------------------------------------------
        print("\n--- TEST 4: LEARNER DETAIL & ATTEMPTS TIMELINE ---")
        # Find a learner who has attempts if possible
        learner_with_attempts = next((l for l in learners_data if l['attempts_count'] > 0), None)
        target_trainee_id = learner_with_attempts['trainee_id'] if learner_with_attempts else (learners_data[0]['trainee_id'] if learners_data else trainee.id)

        # 4.1 Cross-ownership check on learner detail
        res_det_unowned = client.get(f'/api/trainer/courses/{unowned_course.id}/learners/{target_trainee_id}', headers=headers_trainer_a)
        assert res_det_unowned.status_code == 403, "Expected 403 on unowned course learner detail"

        # 4.2 Legitimate owner check
        res_detail = client.get(f'/api/trainer/courses/{owned_course.id}/learners/{target_trainee_id}', headers=headers_trainer_a)
        assert res_detail.status_code == 200
        detail_data = res_detail.get_json()['data']

        assert 'trainee' in detail_data
        assert 'course' in detail_data
        assert 'summary' in detail_data
        assert 'quizzes' in detail_data
        assert 'insights' in detail_data
        assert detail_data['trainee']['id'] == target_trainee_id

        if learner_with_attempts:
            print(f"Learner {detail_data['trainee']['name']} has {detail_data['summary']['total_attempts']} attempt(s):")
            for q in detail_data['quizzes']:
                print(f"  Quiz '{q['quiz_title']}': {len(q['attempts'])} attempt(s)")
                for att in q['attempts']:
                    print(f"    Attempt #{att['attempt_number']}: {att['score']}/{att['total_points']} pts ({att['percentage']}%) Passed={att['passed']}")
            print(f"  Insights: {detail_data['insights']}")
        print("[PASS] Trainee detail, attempts timeline, and insights validated")

        # -----------------------------------------------------------------
        # TEST 5: QUIZZES PERFORMANCE BREAKDOWN & SCHEMA NOTICE
        # -----------------------------------------------------------------
        print("\n--- TEST 5: QUIZZES BREAKDOWN & SCHEMA NOTICE ---")
        # Cross ownership check
        res_q_unowned = client.get(f'/api/trainer/courses/{unowned_course.id}/quizzes/performance', headers=headers_trainer_a)
        assert res_q_unowned.status_code == 403, "Expected 403 on unowned course quizzes breakdown"

        res_quizzes = client.get(f'/api/trainer/courses/{owned_course.id}/quizzes/performance', headers=headers_trainer_a)
        assert res_quizzes.status_code == 200
        q_data = res_quizzes.get_json()['data']

        assert 'quizzes' in q_data
        assert 'topic_analytics_status' in q_data
        assert q_data['topic_analytics_status']['available'] is False
        assert "schema" in q_data['topic_analytics_status']['notice'].lower()

        for q in q_data['quizzes']:
            assert 'quiz_id' in q
            assert 'quiz_title' in q
            assert 'passing_score' in q
            assert 'total_attempts' in q
            assert 'pass_rate' in q
            assert 'passed_count' in q
            assert 'failed_count' in q
        print(f"[PASS] Quiz breakdown verified with {len(q_data['quizzes'])} quizzes and transparent schema notice")

        print("\n==================================================")
        print("ALL TRAINER ANALYTICS INTEGRATION TESTS PASSED!")
        print("==================================================")

if __name__ == '__main__':
    run_tests()
