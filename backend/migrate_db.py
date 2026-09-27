import sqlite3
import os
from werkzeug.security import generate_password_hash
from datetime import datetime, timezone
from app import create_app, db
from app.models.user import User

app = create_app()

def migrate_and_seed_super_admin():
    db_path = os.path.join(app.instance_path, 'capacity_connect.db')
    print(f"Checking database at: {db_path}")

    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(users)")
        columns = [row[1] for row in cursor.fetchall()]
        print(f"Existing columns in 'users': {columns}")

        new_columns = [
            ("status", "VARCHAR(20) DEFAULT 'active' NOT NULL"),
            ("is_super_admin", "BOOLEAN DEFAULT 0 NOT NULL"),
            ("approved_by", "INTEGER REFERENCES users(id)"),
            ("approved_at", "DATETIME"),
            ("rejected_by", "INTEGER REFERENCES users(id)"),
            ("rejected_at", "DATETIME")
        ]

        for col_name, col_def in new_columns:
            if col_name not in columns:
                print(f"Adding column '{col_name}'...")
                cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_def}")

        # Update existing records to active and non-super-admin if null
        cursor.execute("UPDATE users SET status = 'active' WHERE status IS NULL OR status = ''")
        cursor.execute("UPDATE users SET is_super_admin = 0 WHERE is_super_admin IS NULL")
        conn.commit()
        conn.close()
        print("Schema migration completed successfully.")

    with app.app_context():
        # Ensure tables created if db was new
        db.create_all()

        # Idempotent Super Admin setup
        siddharth_email = 'paradhisiddharth@gmail.com'
        siddharth = User.query.filter_by(email=siddharth_email).first()
        if not siddharth:
            print(f"Creating Super Admin account for {siddharth_email}...")
            siddharth = User(
                name='Siddharth Paradhi',
                email=siddharth_email,
                password_hash=generate_password_hash('190925'),
                role='admin',
                is_super_admin=True,
                status='active',
                is_active=True,
                bio='Primary Super Administrator for Capacity Connect.'
            )
            db.session.add(siddharth)
        else:
            print(f"Updating existing Super Admin account for {siddharth_email}...")
            siddharth.name = 'Siddharth Paradhi'
            siddharth.role = 'admin'
            siddharth.is_super_admin = True
            siddharth.status = 'active'
            siddharth.is_active = True
            siddharth.password_hash = generate_password_hash('190925')

        # Ensure demo admin is active and non-super-admin
        demo_admin = User.query.filter_by(email='admin@capacityconnect.com').first()
        if demo_admin:
            demo_admin.role = 'admin'
            demo_admin.status = 'active'
            demo_admin.is_super_admin = False
            demo_admin.is_active = True
            print("Verified demo admin 'admin@capacityconnect.com' as standard active admin.")

        db.session.commit()
        print(f"Super Admin verified: {siddharth.name} ({siddharth.email}) | Super: {siddharth.is_super_admin} | Status: {siddharth.status}")

if __name__ == '__main__':
    migrate_and_seed_super_admin()
