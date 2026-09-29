"""Lesson theory and module-quiz content, keyed by lesson / module title."""
from . import (course1_fullstack, course2_python_ds, course3_uiux,
               course4_react_ts, course5_ml, course6_css)

_MODULES = [course1_fullstack, course2_python_ds, course3_uiux,
            course4_react_ts, course5_ml, course6_css]

LESSON_THEORY = {}
MODULE_QUIZZES = {}
for _m in _MODULES:
    LESSON_THEORY.update(_m.LESSONS)
    MODULE_QUIZZES.update(_m.QUIZZES)
