

> **Note on this copy:** this zip has been updated with a round of SEO/technical
> fixes (favicon, robots.txt, sitemap.xml, llms.txt, per-page titles &
> meta descriptions, canonical tags, Open Graph/Twitter share tags,
> structured data, breadcrumbs, a duplicate-`<h1>` bug fix, and route-level
> code-splitting for smaller JS bundles). See **"SEO Fixes in This Build"**
> near the bottom of this file for the full list and what's still left to do.
>
> To keep the download small, `node_modules/`, `frontend/dist/`, and the
> ~60 test/verification screenshot PNGs in `frontend/` were **not** included —
> none of them are needed to run the app. Run `npm install` in `frontend/`
> and `pip install -r requirements.txt` in `backend/` as usual (see
> "Getting Started" below); `npm run build` will regenerate `dist/`.

A premium digital learning and skill-development platform connecting trainees, trainers, and administrators.

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for bundling and dev server
- **Tailwind CSS** for styling
- **React Router v6** for routing
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend
- **Python 3 / Flask** REST API
- **Flask-SQLAlchemy** ORM
- **SQLite** database (structured for PostgreSQL migration)
- **PyJWT** for authentication
- **Werkzeug** for password hashing

## Project Structure

```
capacity-connect/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask app factory
│   │   ├── models/              # SQLAlchemy models (12 models)
│   │   ├── routes/              # API blueprints (10 route files)
│   │   └── utils/               # Decorators, helpers
│   ├── config.py
│   ├── run.py                   # Entry point
│   ├── seed.py                  # Database seeding
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/          # UI + shared components
│   │   ├── contexts/            # Auth, Toast providers
│   │   ├── hooks/               # Custom hooks
│   │   ├── pages/               # Route pages (trainee, trainer, admin)
│   │   ├── services/            # API service modules
│   │   ├── types/               # TypeScript interfaces
│   │   └── utils/               # Utilities
│   ├── package.json
│   └── vite.config.ts
└── .gitignore
```

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm 9+

### Backend Setup

```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
venv\Scripts\activate    # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Seed the database with demo data
python seed.py

# Start the server
python run.py
```

Backend runs at `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at `http://localhost:5173`

## Demo Credentials

| Role    | Email                          | Password    |
|---------|--------------------------------|-------------|
| Admin   | admin@capacityconnect.com      | Admin@123   |
| Trainer | ananya.iyer@example.com         | Trainer@123 |
| Trainer | rohan.mehta@example.com     | Trainer@123 |
| Trainer | priya.sharma@example.com       | Trainer@123 |
| Trainee | arjun.nair@example.com        | Trainee@123 |
| Trainee | kavya.reddy@example.com        | Trainee@123 |
| Trainee | raj.patel@example.com          | Trainee@123 |
| Trainee | neha.gupta@example.com          | Trainee@123 |
| Trainee | vikram.singh@example.com       | Trainee@123 |

## Features

### Trainee Experience
- **Course Catalog** — Browse, search, and filter courses by category and difficulty
- **Course Detail** — View modules, lessons, and quizzes before enrolling
- **Learning** — Read lessons with sidebar navigation showing progress
- **Quizzes** — Take timed assessments with instant scoring
- **Progress Tracking** — Dashboard with per-course progress and quiz results
- **Certificates** — Earn and print completion certificates

### Trainer Experience
- **Course Management** — Create courses with modules, lessons, and quizzes
- **Content Editor** — Add/edit/delete modules, lessons, quiz questions
- **Student Tracking** — View enrolled students with progress and quiz scores
- **Analytics** — Course performance metrics, enrollment stats, completion rates
- **Needs Attention** — Automatic detection of students with low progress or scores

### Admin Experience
- **Dashboard** — Platform-wide statistics and recent activity feed
- **User Management** — Search, filter, edit roles, activate/deactivate users
- **Trainee/Trainer Views** — Detailed enrollment and course data per user
- **Course Moderation** — Publish/unpublish courses platform-wide
- **Analytics** — Category distribution, top courses, enrollment timeline, role breakdown
- **Settings** — Platform configuration

## API Endpoints

### Authentication
- `POST /api/auth/register` — Register (trainee/trainer only)
- `POST /api/auth/login` — Login, returns JWT
- `GET /api/auth/me` — Current user info

### Courses
- `GET /api/courses` — List published courses (search, filter)
- `GET /api/courses/:id` — Course detail with modules
- `POST /api/courses/:id/enroll` — Enroll in course

### Learning
- `GET /api/lessons/:id` — Get lesson with navigation context
- `POST /api/lessons/:id/complete` — Mark lesson complete

### Quizzes
- `GET /api/quizzes/:id` — Get quiz with questions
- `POST /api/quizzes/:id/submit` — Submit answers, get score

### Progress
- `GET /api/progress` — All enrolled courses with progress
- `GET /api/progress/dashboard` — Trainee dashboard data
- `GET /api/progress/courses/:id` — Detailed course progress

### Certificates
- `GET /api/certificates` — User's certificates
- `POST /api/certificates/claim/:courseId` — Claim certificate

### Trainer (requires trainer role)
- `GET/POST /api/trainer/courses` — CRUD courses
- `POST /api/trainer/courses/:id/modules` — Add modules
- `POST /api/trainer/modules/:id/lessons` — Add lessons
- `POST /api/trainer/courses/:id/quizzes` — Add quizzes
- `GET /api/trainer/students` — Enrolled students with progress
- `GET /api/trainer/analytics` — Course analytics
- `GET /api/trainer/needs-attention` — At-risk students

### Admin (requires admin role)
- `GET /api/admin/dashboard` — Platform statistics
- `GET/PUT/DELETE /api/admin/users` — User management
- `GET /api/admin/trainees` — Trainee details with progress
- `GET /api/admin/trainers` — Trainer details with course counts
- `GET /api/admin/analytics` — Platform analytics
- `GET/PUT /api/admin/settings` — Platform settings

## Design System

- **Theme**: Dark slate (950/900/800) with off-white text
- **Accents**: Restrained violet (`#8b5cf6`) and cyan (`#06b6d4`)
- **Typography**: Strong hierarchy with tracking and weight variation
- **Components**: Button, Input, Select, Badge, Table, Dialog, Tabs, ProgressBar, Alert, Toast, Skeleton, EmptyState, ErrorState
- **Special**: CursorDrivenParticleTypography (canvas particle animation), PixelCanvas (ambient pixel grid)

## Database Models

1. **User** — id, name, email, password_hash, role, avatar, bio, is_active
2. **Course** — id, title, description, category, difficulty, duration_hours, trainer_id
3. **Module** — id, title, description, order, course_id
4. **Lesson** — id, title, content, type, duration_minutes, order, module_id
5. **Enrollment** — id, user_id, course_id, status, enrolled_at, completed_at
6. **Quiz** — id, title, description, passing_score, course_id, time_limit_minutes
7. **Question** — id, quiz_id, text, option_a/b/c/d, correct_option, points
8. **QuizAttempt** — id, user_id, quiz_id, score, percentage, passed
9. **QuizAnswer** — id, attempt_id, question_id, selected_option, is_correct
10. **LessonProgress** — id, user_id, lesson_id, completed, completed_at
11. **Certificate** — id, certificate_uid, user_id, course_id, trainer_name
12. **Activity** — id, user_id, type, description, created_at

## SEO Fixes in This Build

Checked against a standard front-end SEO checklist. Fixed in this pass:

| Item | What was done |
|---|---|
| Favicon | `frontend/public/favicon.ico` + `favicon.png` created (the old `index.html` linked to a `/vite.svg` that didn't exist anywhere in the repo — a broken 404). |
| Meta descriptions | Default description added to `index.html`; every page now sets its own via `useSEO()`. |
| Unique page titles / custom tab title | `src/hooks/use-seo.ts` — a small dependency-free hook that sets `document.title` per route. Wired into all 28 page components. |
| Canonical tags | `useSEO()` writes a `<link rel="canonical">` per route. **Update `SITE_URL` in `use-seo.ts` and the domain in `index.html`/`sitemap.xml`/`robots.txt` once you have a real domain.** |
| Social share images (OG/Twitter) | `frontend/public/og-image.png` created; `og:*` / `twitter:*` tags added to `index.html` and kept in sync per-page by `useSEO()`. |
| Structured data | Organization JSON-LD in `index.html`; `Course` JSON-LD on the course detail page; `BreadcrumbList` JSON-LD emitted by the new `Breadcrumbs` component. |
| Breadcrumbs | New `src/components/shared/breadcrumbs.tsx`, added to the trainee course-detail page and the trainer course-manage page (extend to other nested pages the same way if you want it everywhere). |
| sitemap.xml / robots.txt / llms.txt | Added under `frontend/public/`. Dashboard routes (`/trainee/*`, `/trainer/*`, `/admin/*`) are disallowed/noindexed since they require login. |
| One H1 per page | Fixed a real bug in `pages/trainee/learning.tsx`: Markdown `# ` headings inside lesson content were rendered as a second `<h1>` alongside the page's own title `<h1>`. Now demoted to `<h2>`/`<h3>`/`<h4>`. |
| Smaller JS bundles | `App.tsx` now lazy-loads every trainee/trainer/admin page with `React.lazy` + `Suspense` (previously all 28 pages were bundled into one 798 KB chunk). `vite.config.ts` also splits `react`, `recharts`, and `lucide-react` into separate vendor chunks. |
| No source maps in prod | Vite already defaults to this; made it explicit in `vite.config.ts`. |
| Custom 404 page | Already existed (`pages/not-found.tsx`, wired via the `path="*"` route) — now also marked `noindex`. |
| No placeholder content | Checked — none found. |

### Not changed / needs your input

- **Custom domain** and **clean URL slugs** aren't things a codebase alone can fix — the domain is a hosting/DNS decision, and slugs (e.g. `/trainee/courses/react-basics` instead of `/trainee/courses/42`) would need a `slug` column added to the `Course` model on the backend plus route/lookup changes. Ask if you'd like that added.
- **Local business schema**: skipped on purpose — this is an online learning platform, not a physical/local business, so a `LocalBusiness` schema would be factually wrong. The `Organization` schema added is the correct type here.
- A SPA served via `BrowserRouter` returns a real HTTP 404 only if your host is configured to do so for unknown paths; on most static hosts (Netlify, Vercel, etc.) unmatched routes fall back to `index.html` with a 200 status, and the app's own `NotFoundPage` component then renders the 404 UI client-side. If you need a true HTTP 404 status code, that's a hosting/server config, not a React change.
- Breadcrumbs were only added to two representative nested pages (trainee course-detail, trainer course-manage) as a pattern — extend `<Breadcrumbs items={...} />` to other nested pages (e.g. trainer course-performance, admin course drill-downs) the same way if you want full coverage.
