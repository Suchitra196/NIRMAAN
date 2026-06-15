# NIRMAAN — Government Project & Operations Management System (GPOMS)

A web application for managing government infrastructure projects, tracking financial disbursements, and coordinating between administrative officers and contractors.

---

## What's Built So Far

### Authentication & Authorization
- Google OAuth sign-in via **NextAuth.js**
- JWT-based session management
- Role-based access control with three roles: **Admin**, **Officer**, and **Contractor**
- Role is stored in the database and propagated into the JWT session token
- Middleware helpers (`withAuth`, `withRole`) for protecting API routes
- Login page with role selector UI (Admin / Officer / Contractor)

### Database (PostgreSQL + Prisma)
Full schema defined and ready to migrate:

| Model | Description |
|-------|-------------|
| `User` | Stores user profile and role; linked to NextAuth accounts/sessions |
| `Account` / `Session` / `VerificationToken` | NextAuth standard models |
| `Project` | Core entity — tracks name, status, budget (planned vs actual), tender amount, assigned officer and contractor |
| `Task` | Work items linked to a project with status (`PENDING`, `IN_PROGRESS`, `COMPLETED`) and optional due date |
| `Installment` | Payment records against a project; automatically rolls up into `budgetActual` on the project |

Enums: `Role` (ADMIN, OFFICER, CONTRACTOR), `ProjectStatus` (ONGOING, DELAYED, COMPLETED), `TaskStatus`.

### REST API (Next.js Route Handlers)
All routes require an authenticated session. Role restrictions are enforced per route.

#### Projects — `/api/projects`
| Method | Endpoint | Who can access |
|--------|----------|---------------|
| GET | `/api/projects` | All roles (filtered by role — admin sees all, officer/contractor see their own) |
| POST | `/api/projects` | Admin, Officer |
| GET | `/api/projects/[id]` | All authenticated users |
| PUT | `/api/projects/[id]` | Admin, or the Officer assigned to the project |
| DELETE | `/api/projects/[id]` | Admin only |

#### Tasks — `/api/tasks`
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/tasks?projectId=...` | Requires `projectId` query param |
| POST | `/api/tasks` | Creates a task under a project |
| GET | `/api/tasks/[id]` | |
| PUT | `/api/tasks/[id]` | Update title, description, status, dueDate |
| DELETE | `/api/tasks/[id]` | |

#### Installments — `/api/installments`
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/installments?projectId=...` | Requires `projectId` query param |
| POST | `/api/installments` | Admin / Officer only; auto-updates `budgetActual` on the parent project |
| GET | `/api/installments/[id]` | |
| PUT | `/api/installments/[id]` | Admin only; recalculates `budgetActual` |
| DELETE | `/api/installments/[id]` | Admin only; recalculates `budgetActual` |

#### Users — `/api/users`
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/users` | Admin only; supports `?role=` filter |
| POST | `/api/users` | Returns current authenticated user's profile |
| GET | `/api/users/[id]` | Any authenticated user |
| PUT | `/api/users/[id]` | Admin only — can update name and role |
| DELETE | `/api/users/[id]` | Admin only |

### UI Pages
All pages guard against unauthenticated access and redirect to `/login`.

#### `/login`
- Split-screen layout (branding hero + login panel)
- Role selector (Admin / Officer / Contractor)
- Google sign-in button
- Responsive — collapses to single-column on mobile

#### `/admin`
- Sidebar navigation (Projects, Officers, Departments, Finance, Reports)
- Top bar with search, notifications, and user avatar
- Summary cards: Total Projects, Active Officers, Total Tender Value (currently static placeholder data)
- Financial overview placeholder (chart area)
- Recent Projects table with status badges (Ongoing / Completed / Delayed)

#### `/officer`
- Sidebar + mobile bottom navigation
- Profile card showing session user's name and avatar
- Key stats: Active Projects, Pending Clearances, Budget Utilization (static placeholders)
- Assigned Projects list with a progress bar
- Pending Clearances panel with Approve/Review actions (UI only, not wired to API)

#### `/contractor`
- Sidebar navigation
- Contractor Performance Dashboard header
- Top metrics: Total Disbursed, Pending Installments, Tasks Under Review (static placeholders)
- Active Contracts list with progress bars
- Live Task Update form with contract selector, progress description textarea, and file upload drop zone (UI only, not wired to API)

---

## What's Not Built Yet

- Dashboards are not wired to the API — all numbers and lists are static placeholder data
- No real chart/graph library integrated (financial overview is a placeholder div)
- No file upload backend for contractor evidence submission
- No department model or department management pages
- No notifications system (bell icon is present but non-functional)
- No search functionality (search input exists but is not wired)
- No report generation
- Role-based redirect after login (the login page passes a role to the callback URL but the server doesn't enforce it — the role comes from the DB, not the selector)
- No admin user management UI (only the API exists)
- No mobile sidebar/drawer (mobile nav is bottom tabs only)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Auth | NextAuth.js v4 (Google OAuth, JWT sessions) |
| Database | PostgreSQL |
| ORM | Prisma 7 with `@prisma/adapter-pg` |
| Styling | Tailwind CSS v4 |
| Runtime | Node.js |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A PostgreSQL database
- A Google OAuth app (Client ID + Secret)

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy `.env` and fill in your values:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/gpoms"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-here"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

3. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### Other Commands

```bash
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npx prisma studio  # Open Prisma database browser
```

---

## Project Structure

```
gpoms-app/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── admin/page.tsx     # Admin dashboard
│   │   ├── officer/page.tsx   # Officer dashboard
│   │   ├── contractor/page.tsx # Contractor dashboard
│   │   ├── login/page.tsx     # Login page
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── projects/      # CRUD for projects
│   │   │   ├── tasks/         # CRUD for tasks
│   │   │   ├── installments/  # CRUD for installments
│   │   │   └── users/         # User management
│   │   ├── layout.tsx         # Root layout with SessionProvider
│   │   └── providers.tsx      # NextAuth SessionProvider wrapper
│   ├── lib/
│   │   └── prisma.ts          # Prisma client singleton
│   ├── middleware/
│   │   └── auth.ts            # withAuth / withRole helpers
│   └── types/
│       └── next-auth.d.ts     # NextAuth type augmentations
└── package.json
```
