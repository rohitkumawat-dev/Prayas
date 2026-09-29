"""
apply_theory.py

Writes the full theory text into every lesson of the existing database, matched
by lesson title. Safe to run repeatedly (idempotent) and never touches users,
enrollments, progress or quiz attempts. Needs only the Python standard library.

    python apply_theory.py                 # uses instance/capacity_connect.db
    python apply_theory.py path/to/db.sqlite
"""
import os
import sqlite3
import sys

HERE = os.path.abspath(os.path.dirname(__file__))
sys.path.insert(0, HERE)
from content import LESSON_THEORY  # noqa: E402


def main(db_path):
    if not os.path.exists(db_path):
        sys.exit(f"Database not found: {db_path}\nRun seed.py first, or pass the path to your .db file.")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    updated = unchanged = 0
    missing = []
    for lesson_id, title, content in cur.execute("SELECT id, title, content FROM lessons").fetchall():
        text = LESSON_THEORY.get(title)
        if text is None:
            missing.append(title)
        elif content == text:
            unchanged += 1
        else:
            cur.execute("UPDATE lessons SET content = ? WHERE id = ?", (text, lesson_id))
            updated += 1
    conn.commit()
    conn.close()
    print(f"Lessons updated: {updated}, already up to date: {unchanged}")
    if missing:
        print("No theory defined for:", ", ".join(missing))


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'instance', 'capacity_connect.db'))
