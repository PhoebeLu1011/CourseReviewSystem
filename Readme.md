# 選課工具箱 — Course Toolbox

An integrated course information web app for NTNU (National Taiwan Normal University) students, combining course search, peer reviews, discussions, groupmate finding, personal schedule, and admin management in one platform.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript (Vite) |
| Backend | Python + Flask (REST API) |
| Database | MongoDB Atlas (cloud, NoSQL) |
| DB driver | pymongo |
| Auth | JWT (PyJWT) |
| Avatar storage | GridFS (via pymongo) |
| Environment | `.env` file (connection string, secrets, ports) |

---

## Features

- **Course Search** — filter by keyword, department, semester, and more
- **Reviews** — write, edit, delete, and like course reviews; rating projection synced automatically
- **Discussions** — course-level threaded discussions and replies
- **Groupmates** — post and discover study groups, apply to join, recommendation scoring
- **Schedule** — personal course schedule synced to account; localStorage fallback when logged out
- **Notifications** — bell popover for application, review, report, and announcement events
- **Announcements** — admin-published site-wide announcements
- **Bookmarks** — save favorite courses
- **Achievements** — score-based badges shown on user profile
- **Admin Panel** — report audit queue, announcement management, analytics dashboard

---

## Project Structure

```
CourseReviewSystem/
├── frontend/                      # React + TypeScript (Vite)
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   └── src/
│       ├── main.tsx               # React entry
│       ├── App.tsx                # Global providers and router
│       ├── routes.tsx             # Lazy-loaded route map and guards
│       ├── api/                   # Feature API clients (all go through apiClient.ts)
│       │   ├── apiClient.ts
│       │   ├── userApi.ts
│       │   ├── courseApi.ts
│       │   ├── reviewApi.ts
│       │   ├── discussionApi.ts
│       │   ├── groupApi.ts
│       │   ├── applicationApi.ts
│       │   ├── notificationApi.ts
│       │   ├── reportApi.ts
│       │   ├── announcementApi.ts
│       │   ├── bookmarkApi.ts
│       │   ├── scheduleApi.ts
│       │   ├── achievementApi.ts
│       │   └── adminAnalyticsApi.ts
│       ├── components/            # Shared and feature UI components
│       ├── context/               # AuthContext, ScheduleContext
│       ├── hooks/                 # UI-facing feature hooks
│       ├── models/                # Frontend DTO / type contracts
│       ├── pages/                 # Route-level page components
│       │   ├── Home.tsx
│       │   ├── CourseCatalog.tsx
│       │   ├── CourseDetail.tsx
│       │   ├── Reviews.tsx
│       │   ├── Discussions.tsx
│       │   ├── DiscussionDetail.tsx
│       │   ├── GroupmatesIntegrated.tsx
│       │   ├── Schedule.tsx
│       │   ├── UserProfile.tsx
│       │   ├── auth/
│       │   └── admin/
│       ├── config/                # API base URL config
│       ├── styles/                # Global styles
│       └── utils/                 # Shared helpers
│
├── backend/                       # Python + Flask
│   ├── app.py                     # Flask composition root
│   ├── mongo.py                   # MongoDB and GridFS connection
│   ├── departments.py             # Department data provider
│   ├── requirements.txt
│   ├── env.example                # Environment variable template
│   ├── models/                    # Domain models and invariants
│   │   ├── user.py
│   │   ├── course.py
│   │   ├── review.py
│   │   ├── discussion.py
│   │   ├── reply.py
│   │   ├── group.py
│   │   ├── application.py
│   │   ├── schedule.py
│   │   ├── notification.py
│   │   ├── report.py
│   │   ├── announcement.py
│   │   ├── bookmark.py
│   │   └── badge.py
│   ├── repository/                # MongoDB queries and atomic writes
│   │   ├── student_repository.py
│   │   ├── course_repository.py
│   │   ├── review_repository.py
│   │   ├── discussion_repository.py
│   │   ├── reply_repository.py
│   │   ├── group_repository.py
│   │   ├── application_repository.py
│   │   ├── schedule_repository.py
│   │   ├── notification_repository.py
│   │   ├── report_repository.py
│   │   ├── announcement_repository.py
│   │   ├── bookmark_repository.py
│   │   └── badge_repository.py
│   ├── routes/                    # HTTP adapters (Flask blueprints)
│   │   ├── auth_routes.py
│   │   ├── user_routes.py
│   │   ├── course_routes.py
│   │   ├── review_routes.py
│   │   ├── discussion_routes.py
│   │   ├── group_routes.py
│   │   ├── application_routes.py
│   │   ├── notification_routes.py
│   │   ├── report_routes.py
│   │   ├── admin_routes.py
│   │   ├── announcement_routes.py
│   │   ├── bookmark_routes.py
│   │   ├── schedule_routes.py
│   │   └── achievement_routes.py
│   ├── services/                  # Use case services grouped by feature
│   │   ├── auth/                  # Login strategies, JWT, authorization
│   │   ├── profile/               # User profile and avatar storage
│   │   ├── course/                # Course search and query
│   │   ├── review/                # Review lifecycle and rating sync
│   │   ├── discussion/            # Discussions and replies
│   │   ├── group/                 # Groups, applications, recommendation
│   │   ├── admin/                 # Report audit and analytics read model
│   │   ├── communication/         # Notification, announcement, report
│   │   └── engagement/            # Bookmark, achievement, schedule
│   ├── docs/                      # Algorithm and design documentation
│   ├── migrations/                # Data migration scripts
│   ├── scripts/                   # Seed and migration runners
│   └── tests/                     # Backend use case and integration tests
│
└── README.md
```

---

## Installation & Setup

### Prerequisites

- Node.js 18+ (frontend)
- Python 3.10+ (backend)
- A MongoDB Atlas account (or local MongoDB instance)

### Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp env.example .env
# Edit .env and fill in MONGO_URI, DB_NAME, JWT_SECRET, etc.

# Start the Flask server
python app.py
```

Backend runs at: `http://127.0.0.1:5001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Environment Variables

Copy `backend/env.example` to `backend/.env` and fill in the values:

```env
# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/

# Database name
DB_NAME=Course

# Frontend URL (update to your Vercel URL in production)
FRONTEND_URL=http://localhost:5173

# Flask port (5001 recommended on macOS to avoid conflicts with system services)
PORT=5001

# Environment (development / production)
FLASK_ENV=development

# JWT signing secret — use a long random value in production
JWT_SECRET=replace_with_a_long_random_secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_DAYS=1
```

> **Note:** Never commit `.env` to version control. It is already listed in `.gitignore`.

---

## Seed Data & Migrations

Run these once after setting up the database:

```bash
cd backend
python scripts/seed_courses.py   # import course data
python scripts/seed_badges.py    # create default achievement badges
```

If migrating group data (enforces membership uniqueness):

```bash
python scripts/migrate_group_data.py --dry-run   # preview changes
python scripts/migrate_group_data.py --apply      # apply changes
```

---

## Verification

Backend:

```bash
cd backend
python -m unittest discover -s tests -v
python -m compileall .
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

---

## Architecture Overview

```mermaid
flowchart LR
    UI[React Pages and Components] --> Hook[Frontend Hooks]
    Hook --> API[Feature API Clients]
    API --> Route[Flask Routes]
    Route --> Authz[AuthorizationService]
    Route --> Service[Use Case Services]
    Service --> Domain[Domain Models]
    Service --> Repo[Repositories]
    Repo --> Mongo[(MongoDB and GridFS)]
    Service --> Collaborator[Policies, Read Models, Synchronizers]
```

### Layer Responsibilities

| Layer | Owns | Does Not Own |
|-------|------|-------------|
| Frontend page/component | UI state, layout, user events | Backend business rules |
| Frontend hook | UI orchestration for one feature | Raw HTTP details |
| Frontend API client | Endpoint calls and response types | Rendering |
| Route | Request parsing, auth guard, response code | Use case logic |
| Service | Use case orchestration | Flask request or Mongo document details |
| Domain model | State transitions and invariants | Database or HTTP |
| Repository | Queries, mapping, atomic writes | UI or cross-use-case flow |

### Design Patterns

| Pattern | Where | Purpose |
|---------|-------|---------|
| Repository | `backend/repository/` | Hide MongoDB queries and document mapping |
| Dependency Injection | `backend/app.py` | Wire services once; keep tests replaceable |
| Strategy | Auth login, admin report handlers | Select behavior by role or reported target |
| Factory Method | `StudentRegistrationFactory` | Validate and build `Student` consistently |
| Adapter | `GridFSAvatarStorage`, `apiClient.ts` | Hide GridFS/HTTP details behind stable methods |
| Query Object | `CourseSearchCriteria`, `AnnouncementQuery` | Keep query normalization out of routes |
| Decorator | Route guards, `BestEffortNotificationPublisher` | Add auth/best-effort behavior around core use cases |
| Read Model | `AdminAnalyticsService`, `GroupDashboardService` | Return UI-ready aggregate data |
| Synchronizer | `CourseRatingSynchronizer` | Recalculate course rating after review changes |

---

## Branch Strategy

```
main        stable production branch
develop     integration branch
usecase/*   feature branch per use case
```

Create feature branches from `develop`, then open a PR back to `develop` after tests pass.

---

## Key Behavior Notes

**Course ID format:**

```
{serialNumber}_{academicYear}_{semester}
```

Example: `0691_113_2`. The UI displays the shorter `serialNumber`, but reviews, bookmarks, discussions, groups, schedule, and API routes all use the full `courseID`.

**Groupmate "All" mode** excludes closed, full, expired, or hidden groups, and groups for courses where the user already has membership or a pending application.

**Schedule** is synced to the user's account when logged in. `localStorage` is used only as an unauthenticated/offline fallback cache.

**Notification UI** is a popover (`NotificationPopover.tsx`) beside the profile avatar — intentionally not a full page.

**Achievements** are integrated into the User Profile page; `/achievements` redirects to `/profile`.

---

## Further Reading

- [Group recommendation algorithm](backend/docs/recommendation_algorithm.md)
- [Achievement score algorithm](backend/docs/achievement_score_algorithm.md)
- [Discussion sorting strategy pattern](backend/docs/discussion_Sorting_Strategy_Pattern.md)

