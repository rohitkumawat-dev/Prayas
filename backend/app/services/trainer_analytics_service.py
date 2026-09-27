"""
trainer_analytics_service.py

Encapsulates course-scoped learner performance analytics and aggregations for instructors.
Strictly scopes all attempts and answers to quizzes belonging to the target course.
Calculates deterministic, data-backed learning insights.
"""

from app import db
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAttempt
from app.models.user import User

class TrainerAnalyticsService:
    @staticmethod
    def get_course_performance(course_id: int):
        course = Course.query.get(course_id)
        if not course:
            return None

        # 1. Enrolled trainees
        enrollments = Enrollment.query.filter_by(course_id=course_id).all()
        enrolled_trainees_count = len(enrollments)

        # 2. Quizzes for this course
        quizzes = Quiz.query.filter_by(course_id=course_id).all()
        quiz_ids = [q.id for q in quizzes]

        if not quiz_ids:
            return {
                'course_id': course.id,
                'course_title': course.title,
                'enrolled_trainees_count': enrolled_trainees_count,
                'attempted_trainees_count': 0,
                'total_attempts_count': 0,
                'average_score': 0.0,
                'pass_rate': 0.0,
                'passed_count': 0,
                'failed_count': 0,
                'latest_attempt_at': None,
                'quizzes_count': 0
            }

        # 3. Attempts strictly belonging to this course's quizzes
        attempts = QuizAttempt.query.filter(QuizAttempt.quiz_id.in_(quiz_ids)).all()
        total_attempts_count = len(attempts)

        unique_trainee_ids = {a.user_id for a in attempts}
        attempted_trainees_count = len(unique_trainee_ids)

        passed_count = sum(1 for a in attempts if a.passed)
        failed_count = total_attempts_count - passed_count

        avg_score = (sum(a.percentage for a in attempts) / total_attempts_count) if total_attempts_count > 0 else 0.0
        pass_rate = (passed_count / total_attempts_count * 100) if total_attempts_count > 0 else 0.0

        latest_attempt = max(attempts, key=lambda a: a.completed_at or a.started_at) if attempts else None
        latest_attempt_at = None
        if latest_attempt:
            dt = latest_attempt.completed_at or latest_attempt.started_at
            latest_attempt_at = dt.isoformat() if dt else None

        return {
            'course_id': course.id,
            'course_title': course.title,
            'enrolled_trainees_count': enrolled_trainees_count,
            'attempted_trainees_count': attempted_trainees_count,
            'total_attempts_count': total_attempts_count,
            'average_score': round(avg_score, 1),
            'pass_rate': round(pass_rate, 1),
            'passed_count': passed_count,
            'failed_count': failed_count,
            'latest_attempt_at': latest_attempt_at,
            'quizzes_count': len(quiz_ids)
        }

    @staticmethod
    def get_course_learners(course_id: int):
        course = Course.query.get(course_id)
        if not course:
            return None

        enrollments = Enrollment.query.filter_by(course_id=course_id).all()
        quizzes = Quiz.query.filter_by(course_id=course_id).all()
        quiz_ids = [q.id for q in quizzes]

        learners = []
        for e in enrollments:
            trainee = e.user
            if not trainee:
                continue

            trainee_attempts = []
            if quiz_ids:
                trainee_attempts = QuizAttempt.query.filter(
                    QuizAttempt.user_id == trainee.id,
                    QuizAttempt.quiz_id.in_(quiz_ids)
                ).order_by(QuizAttempt.completed_at.desc(), QuizAttempt.id.desc()).all()

            attempts_count = len(trainee_attempts)
            if attempts_count > 0:
                latest_att = trainee_attempts[0]
                latest_score = latest_att.percentage
                best_score = max(a.percentage for a in trainee_attempts)
                avg_score = sum(a.percentage for a in trainee_attempts) / attempts_count
                latest_result = 'PASSED' if latest_att.passed else 'FAILED'
                
                dt = latest_att.completed_at or latest_att.started_at
                last_attempt_at = dt.isoformat() if dt else None

                # Generate deterministic suggestion
                suggestions = []
                failed_attempts = [a for a in trainee_attempts if not a.passed]
                if len(failed_attempts) >= 2 and not latest_att.passed:
                    suggestions.append("Multiple failed attempts recorded. Recommend reviewing curriculum lessons before retrying.")
                elif latest_att.passed:
                    suggestions.append("Successfully satisfied assessment passing criteria.")
                elif attempts_count >= 2:
                    # check trend
                    prev_att = trainee_attempts[1]
                    if latest_att.percentage > prev_att.percentage:
                        diff = round(latest_att.percentage - prev_att.percentage, 1)
                        suggestions.append(f"Score improved by +{diff}% compared to previous attempt.")
                    else:
                        suggestions.append("Review missed questions and retake assessment.")
                else:
                    suggestions.append("Review course materials to prepare for retake.")

                status_label = 'PASSED' if any(a.passed for a in trainee_attempts) else 'NEEDS_REVIEW'
            else:
                latest_score = None
                best_score = None
                avg_score = None
                latest_result = 'NOT_ATTEMPTED'
                last_attempt_at = None
                suggestions = ["No assessment attempt recorded yet."]
                status_label = 'NOT_STARTED'

            learners.append({
                'trainee_id': trainee.id,
                'trainee_name': trainee.name,
                'trainee_email': trainee.email,
                'trainee_avatar': trainee.avatar,
                'enrollment_status': e.status,
                'enrolled_at': e.enrolled_at.isoformat() if e.enrolled_at else None,
                'attempts_count': attempts_count,
                'latest_score': round(latest_score, 1) if latest_score is not None else None,
                'best_score': round(best_score, 1) if best_score is not None else None,
                'average_score': round(avg_score, 1) if avg_score is not None else None,
                'latest_result': latest_result,
                'status_label': status_label,
                'last_attempt_at': last_attempt_at,
                'suggestions': suggestions
            })

        # Sort: learners with recent attempts first, then alphabetical
        learners.sort(key=lambda l: (l['last_attempt_at'] is not None, l['last_attempt_at'] or '', l['trainee_name']), reverse=True)
        return learners

    @staticmethod
    def get_learner_detail(course_id: int, trainee_id: int):
        course = Course.query.get(course_id)
        trainee = User.query.get(trainee_id)
        if not course or not trainee:
            return None

        enrollment = Enrollment.query.filter_by(course_id=course_id, user_id=trainee_id).first()
        quizzes = Quiz.query.filter_by(course_id=course_id).all()
        quiz_ids = [q.id for q in quizzes]

        quiz_details = []
        all_attempts_for_course = []

        for q in quizzes:
            attempts = QuizAttempt.query.filter_by(
                user_id=trainee_id,
                quiz_id=q.id
            ).order_by(QuizAttempt.completed_at.asc(), QuizAttempt.id.asc()).all()

            all_attempts_for_course.extend(attempts)

            attempt_items = []
            for idx, a in enumerate(attempts):
                dt = a.completed_at or a.started_at
                attempt_items.append({
                    'id': a.id,
                    'attempt_number': idx + 1,
                    'score': a.score,
                    'total_points': a.total_points,
                    'percentage': round(a.percentage, 1),
                    'passed': bool(a.passed),
                    'passing_score': q.passing_score,
                    'completed_at': dt.isoformat() if dt else None
                })

            quiz_details.append({
                'quiz_id': q.id,
                'quiz_title': q.title,
                'passing_score': q.passing_score,
                'time_limit_minutes': q.time_limit_minutes,
                'attempts': attempt_items,
                'attempts_count': len(attempt_items),
                'best_score': round(max([a.percentage for a in attempts], default=0), 1) if attempts else None,
                'latest_score': round(attempts[-1].percentage, 1) if attempts else None,
                'passed': any(a.passed for a in attempts)
            })

        total_attempts = len(all_attempts_for_course)
        avg_score = (sum(a.percentage for a in all_attempts_for_course) / total_attempts) if total_attempts > 0 else None
        best_score = max([a.percentage for a in all_attempts_for_course], default=None)
        latest_att = all_attempts_for_course[-1] if all_attempts_for_course else None

        # Data-backed insights
        insights = []
        if total_attempts == 0:
            insights.append("Trainee has enrolled in this course but has not yet taken any assessment.")
        elif any(a.passed for a in all_attempts_for_course):
            first_pass = next(a for a in all_attempts_for_course if a.passed)
            insights.append(f"Successfully reached passing threshold on attempt #{all_attempts_for_course.index(first_pass) + 1}.")
        else:
            insights.append(f"Trainee has completed {total_attempts} attempt(s) without reaching the {quizzes[0].passing_score if quizzes else 70.0}% passing threshold.")

        if total_attempts >= 2:
            first_score = all_attempts_for_course[0].percentage
            last_score = all_attempts_for_course[-1].percentage
            diff = round(last_score - first_score, 1)
            if diff > 0:
                insights.append(f"Overall score improvement: +{diff}% progression from initial attempt ({first_score}% -> {last_score}%).")
            elif diff < 0:
                insights.append(f"Score dropped by {abs(diff)}% from initial attempt. Further instructional review recommended.")

        return {
            'trainee': {
                'id': trainee.id,
                'name': trainee.name,
                'email': trainee.email,
                'avatar': trainee.avatar,
                'bio': trainee.bio
            },
            'course': {
                'id': course.id,
                'title': course.title,
                'category': course.category
            },
            'enrollment': {
                'status': enrollment.status if enrollment else 'not_enrolled',
                'enrolled_at': enrollment.enrolled_at.isoformat() if enrollment and enrollment.enrolled_at else None,
                'completed_at': enrollment.completed_at.isoformat() if enrollment and enrollment.completed_at else None
            },
            'summary': {
                'total_attempts': total_attempts,
                'average_score': round(avg_score, 1) if avg_score is not None else None,
                'best_score': round(best_score, 1) if best_score is not None else None,
                'latest_score': round(latest_att.percentage, 1) if latest_att else None,
                'latest_passed': bool(latest_att.passed) if latest_att else False,
                'passed_any': any(a.passed for a in all_attempts_for_course)
            },
            'quizzes': quiz_details,
            'insights': insights
        }

    @staticmethod
    def get_course_quizzes_performance(course_id: int):
        course = Course.query.get(course_id)
        if not course:
            return None

        quizzes = Quiz.query.filter_by(course_id=course_id).all()
        quiz_stats = []

        for q in quizzes:
            attempts = QuizAttempt.query.filter_by(quiz_id=q.id).all()
            total_attempts = len(attempts)
            unique_trainees = len({a.user_id for a in attempts})

            passed_count = sum(1 for a in attempts if a.passed)
            failed_count = total_attempts - passed_count
            pass_rate = (passed_count / total_attempts * 100) if total_attempts > 0 else 0.0
            avg_score = (sum(a.percentage for a in attempts) / total_attempts) if total_attempts > 0 else 0.0
            highest_score = max([a.percentage for a in attempts], default=0.0)
            lowest_score = min([a.percentage for a in attempts], default=0.0) if total_attempts > 0 else 0.0

            quiz_stats.append({
                'quiz_id': q.id,
                'quiz_title': q.title,
                'passing_score': q.passing_score,
                'time_limit_minutes': q.time_limit_minutes,
                'questions_count': len(q.questions),
                'total_attempts': total_attempts,
                'unique_trainees': unique_trainees,
                'average_score': round(avg_score, 1),
                'pass_rate': round(pass_rate, 1),
                'highest_score': round(highest_score, 1),
                'lowest_score': round(lowest_score, 1),
                'passed_count': passed_count,
                'failed_count': failed_count
            })

        return {
            'course_id': course.id,
            'course_title': course.title,
            'quizzes': quiz_stats,
            'topic_analytics_status': {
                'available': False,
                'notice': "Question-to-module mapping is not defined in the current database schema. Aggregate assessment and learner analytics are provided."
            }
        }
