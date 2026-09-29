"""
quiz_helpers.py

Shared logic for the module-quiz / final-assessment flow:
  * which quizzes are "module" vs "final"
  * whether a quiz is unlocked for a trainee
  * turning a score into an easy-to-read performance level + message that is
    shown to trainees and, more importantly, to the course's trainer.
"""

from flask import current_app
from app.models.quiz import Quiz
from app.models.lesson import Lesson
from app.models.lesson_progress import LessonProgress
from app.models.quiz_attempt import QuizAttempt

EXCELLENT_THRESHOLD = 85.0   # percentage at/above which work is "excellent"

LEVEL_LABELS = {
    'EXCELLENT': 'Doing great',
    'GOOD': 'On track',
    'NEEDS_ATTENTION': 'Needs attention',
}


def is_final(quiz) -> bool:
    return quiz.module_id is None


def classify(percentage, passing_score=60.0):
    """Return (level, label) for a quiz percentage."""
    if percentage is None:
        return 'NOT_ATTEMPTED', 'Not attempted'
    if percentage >= EXCELLENT_THRESHOLD:
        return 'EXCELLENT', LEVEL_LABELS['EXCELLENT']
    if percentage >= (passing_score or 60.0):
        return 'GOOD', LEVEL_LABELS['GOOD']
    return 'NEEDS_ATTENTION', LEVEL_LABELS['NEEDS_ATTENTION']


def attempt_feedback(percentage, passing_score, quiz_title='this quiz', final=False):
    """Message shown right after a submission (to the trainee and reused for the trainer)."""
    level, label = classify(percentage, passing_score)
    kind = 'final assessment' if final else 'module quiz'
    if level == 'EXCELLENT':
        msg = f'Excellent result ({percentage:.0f}%). Strong grasp of the {kind} material.'
    elif level == 'GOOD':
        msg = f'Passed with {percentage:.0f}%. Solid understanding; a quick review of missed questions will make it stronger.'
    else:
        gap = max(0.0, (passing_score or 60.0) - percentage)
        msg = (f'Scored {percentage:.0f}%, {gap:.0f} points below the {passing_score:.0f}% pass mark. '
               f'Review the lessons and retake the {kind}.')
    return {'level': level, 'label': label, 'message': msg}


def _course_lesson_ids(course):
    return [l.id for m in course.modules for l in m.lessons]


def _completed_count(user_id, lesson_ids):
    if not lesson_ids:
        return 0
    return LessonProgress.query.filter(
        LessonProgress.user_id == user_id,
        LessonProgress.lesson_id.in_(lesson_ids),
        LessonProgress.completed == True  # noqa: E712
    ).count()


def quiz_lock(user_id, quiz):
    """
    Returns {'locked': bool, 'reason': str|None, 'remaining_lessons': int}.
    Module quiz  -> needs every lesson of its module completed.
    Final quiz   -> needs every lesson of the course completed.
    """
    if not current_app.config.get('REQUIRE_COMPLETION_FOR_QUIZZES', True):
        return {'locked': False, 'reason': None, 'remaining_lessons': 0}

    if quiz.module_id is not None:
        module = quiz.module_ref if hasattr(quiz, 'module_ref') else None
        lesson_ids = [l.id for l in (module.lessons if module else [])]
        scope = 'this module'
    else:
        lesson_ids = _course_lesson_ids(quiz.course_ref)
        scope = 'the course'

    remaining = len(lesson_ids) - _completed_count(user_id, lesson_ids)
    if remaining > 0:
        noun = 'lesson' if remaining == 1 else 'lessons'
        return {'locked': True,
                'reason': f'Complete the remaining {remaining} {noun} in {scope} to unlock this quiz.',
                'remaining_lessons': remaining}
    return {'locked': False, 'reason': None, 'remaining_lessons': 0}


def quiz_status(user_id, quiz):
    """Compact per-user status used by course detail and lesson pages."""
    attempts = QuizAttempt.query.filter_by(user_id=user_id, quiz_id=quiz.id).all()
    best = max((a.percentage for a in attempts), default=None)
    lock = quiz_lock(user_id, quiz)
    data = quiz.to_dict()
    data.update({
        'locked': lock['locked'],
        'lock_reason': lock['reason'],
        'attempts_count': len(attempts),
        'best_score': round(best, 1) if best is not None else None,
        'passed': any(a.passed for a in attempts),
    })
    return data


def serialize_attempt(attempt, quiz=None):
    """Attempt dict enriched with quiz context + performance feedback."""
    quiz = quiz or Quiz.query.get(attempt.quiz_id)
    data = attempt.to_dict()
    if quiz:
        fb = attempt_feedback(attempt.percentage or 0, quiz.passing_score, quiz.title, is_final(quiz))
        data['feedback'] = fb
        data['quiz'] = {
            'id': quiz.id,
            'title': quiz.title,
            'is_final': is_final(quiz),
            'passing_score': quiz.passing_score,
            'course_id': quiz.course_id,
            'module_id': quiz.module_id,
            'module_title': quiz.module_ref.title if quiz.module_ref else None,
        }
    return data


def next_lesson_after_module(module):
    """First lesson of the module that follows `module` in its course (or None)."""
    modules = sorted(module.course.modules, key=lambda m: m.order)
    for i, m in enumerate(modules):
        if m.id == module.id and i + 1 < len(modules):
            nxt = sorted(modules[i + 1].lessons, key=lambda l: l.order)
            return nxt[0].id if nxt else None
    return None
