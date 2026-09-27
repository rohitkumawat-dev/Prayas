import sqlite3

conn = sqlite3.connect('instance/capacity_connect.db')
cursor = conn.cursor()

courses = cursor.execute('SELECT id, title, category, difficulty FROM courses ORDER BY id').fetchall()
print(f"=== TOTAL COURSES: {len(courses)} ===")
for c in courses:
    print(f"Course {c[0]}: \"{c[1]}\" | Category: {c[2]} | Difficulty: {c[3]}")
    # Inspect modules and lessons for this course
    modules = cursor.execute('SELECT id, title FROM modules WHERE course_id = ? ORDER BY `order`', (c[0],)).fetchall()
    for m in modules:
        lessons = cursor.execute('SELECT id, title FROM lessons WHERE module_id = ? ORDER BY `order`', (m[0],)).fetchall()
        print(f"   Module {m[0]}: \"{m[1]}\" ({len(lessons)} lessons)")
        for l in lessons:
            print(f"      Lesson {l[0]}: {l[1]}")

print("\n=== EXISTING QUIZZES ===")
quizzes = cursor.execute('SELECT id, title, course_id, passing_score, time_limit_minutes FROM quizzes ORDER BY id').fetchall()
print(f"Total Quizzes: {len(quizzes)}")
for q in quizzes:
    q_count = cursor.execute('SELECT COUNT(*) FROM questions WHERE quiz_id = ?', (q[0],)).fetchone()[0]
    print(f"\nQuiz ID {q[0]}: \"{q[1]}\" -> Course {q[2]} | Questions: {q_count} | Passing: {q[3]}% | Time: {q[4]}m")
    qs = cursor.execute('SELECT id, [order], text, option_a, option_b, option_c, option_d, correct_option FROM questions WHERE quiz_id = ? ORDER BY id', (q[0],)).fetchall()
    for row in qs:
        print(f"   [{row[0]}] Q{row[1]}: {row[2]}")
        print(f"       A) {row[3]}")
        print(f"       B) {row[4]}")
        print(f"       C) {row[5]}")
        print(f"       D) {row[6]}")
        print(f"       Correct: {row[7]}")

print("\n=== COURSES WITHOUT QUIZZES ===")
for c in courses:
    course_quizzes = [q for q in quizzes if q[2] == c[0]]
    if not course_quizzes:
        print(f"Course {c[0]}: \"{c[1]}\" -> NO QUIZ")

conn.close()
