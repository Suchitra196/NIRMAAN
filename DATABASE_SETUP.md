# Database & Backend Setup Guide

## ✅ Completed Backend Components

- Environment configuration (.env.local)
- Role-based authentication middleware
- API routes with authorization:
  - **Projects**: GET all/by ID, POST create, PUT update, DELETE
  - **Tasks**: GET all/by ID, POST create, PUT update, DELETE
  - **Installments**: GET all/by ID, POST create, PUT update, DELETE
  - **Users**: GET all/by ID, POST current user, PUT update role, DELETE

## 📋 Setup Steps

### 1. PostgreSQL Database Setup

**Windows:**
```bash
# Install PostgreSQL from: https://www.postgresql.org/download/windows/
# During installation:
# - Note your password for the 'postgres' user
# - Keep the default port 5432
# - Enable pgAdmin for easy management

# Open pgAdmin or use psql command line:
psql -U postgres

# Create database:
CREATE DATABASE gpoms_db;
CREATE USER gpoms_user WITH PASSWORD 'your_secure_password';
ALTER ROLE gpoms_user SET client_encoding TO 'utf8';
ALTER ROLE gpoms_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE gpoms_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE gpoms_db TO gpoms_user;
\q
```

**macOS (using Homebrew):**
```bash
brew install postgresql
brew services start postgresql
createdb gpoms_db
psql gpoms_db
# Then run the commands above (CREATE USER, etc.)
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres psql

# Then run the commands above
```

### 2. Update Environment Variables

Edit `.env.local`:

```env
# Database Configuration
DATABASE_URL="postgresql://gpoms_user:your_secure_password@localhost:5432/gpoms_db"

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_with: openssl rand -base64 32

# Environment
NODE_ENV=development
```

### 3. Generate Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable the "Google+ API"
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - http://localhost:3000/api/auth/callback/google
   - https://your-domain.com/api/auth/callback/google (for production)
6. Copy Client ID and Client Secret to .env.local

### 4. Generate NextAuth Secret

```bash
# Run in terminal:
openssl rand -base64 32
# Copy the output to NEXTAUTH_SECRET in .env.local
```

### 5. Run Prisma Migrations

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Create and run migrations
npx prisma migrate dev --name init

# (Optional) View database in Prisma Studio
npx prisma studio
```

### 6. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to test the application.

## 🔗 API Endpoints

All endpoints require authentication (NextAuth session).

### Projects
- `GET /api/projects` - Get all projects (filtered by role)
- `GET /api/projects/[id]` - Get specific project
- `POST /api/projects` - Create project (ADMIN/OFFICER)
- `PUT /api/projects/[id]` - Update project (ADMIN/OFFICER)
- `DELETE /api/projects/[id]` - Delete project (ADMIN only)

### Tasks
- `GET /api/tasks?projectId=[id]` - Get project tasks
- `GET /api/tasks/[id]` - Get specific task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

### Installments
- `GET /api/installments?projectId=[id]` - Get project installments
- `GET /api/installments/[id]` - Get specific installment
- `POST /api/installments` - Create installment (ADMIN/OFFICER)
- `PUT /api/installments/[id]` - Update installment (ADMIN)
- `DELETE /api/installments/[id]` - Delete installment (ADMIN)

### Users
- `GET /api/users` - Get all users (ADMIN)
- `GET /api/users?role=OFFICER` - Filter users by role
- `GET /api/users/[id]` - Get specific user
- `POST /api/users` - Get current user info
- `PUT /api/users/[id]` - Update user role (ADMIN)
- `DELETE /api/users/[id]` - Delete user (ADMIN)

## 🔒 Role-Based Access Control

**ADMIN**: Full access to all resources and user management
**OFFICER**: Can create/manage projects, record installments
**CONTRACTOR**: Can view assigned projects only

## 🧪 Testing the API

Use Postman or curl:

```bash
# Test projects endpoint
curl -X GET http://localhost:3000/api/projects \
  -H "Authorization: Bearer your-session-token"

# Or use Prisma Studio (visual database browser)
npx prisma studio
```

## 🚨 Troubleshooting

**"Can't connect to database"**
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in .env.local
- Ensure gpoms_user has privileges

**"Prisma migration fails"**
- Check database is empty: `psql gpoms_db -l`
- Delete migrations folder and retry: `npx prisma migrate reset`

**"Google OAuth not working"**
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Ensure redirect URI matches exactly
- Check NEXTAUTH_URL matches your domain

## ✅ Next Steps

1. Test database connection: `npx prisma studio`
2. Start dev server: `npm run dev`
3. Login with Google at http://localhost:3000/login
4. Test creating a project from admin dashboard
5. Proceed to frontend implementation
