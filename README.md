# Store Rating Platform — FullStack Intern Coding Challenge

A full-stack web application where users can submit 1–5 star ratings for stores, with three roles:
System Administrator, Normal User, and Store Owner.

**Tech stack** (as specified): Express.js backend, PostgreSQL database (via Sequelize ORM), React.js frontend.

## Verified working

- Backend: all source files pass `node --check` (syntax) and `require('./src/app')` loads cleanly (all routes/controllers/models/middleware wire up with no errors).
- Frontend: `npm run build` completes successfully — 101 modules transformed, no build errors.
- Both were built and tested in this environment; the only thing not run end-to-end here is a live PostgreSQL instance (not available in this sandbox), so the actual HTTP request/response cycle against a real database hasn't been exercised. Test this locally before submitting (steps below).

## Project structure

```
store-rating-app/
├── backend/               Express + Sequelize + PostgreSQL API
│   ├── src/
│   │   ├── config/db.js          Sequelize connection
│   │   ├── models/                User, Store, Rating + associations
│   │   ├── middleware/            JWT auth, role guard, express-validator rules
│   │   ├── controllers/           auth, admin, store, rating, store-owner
│   │   ├── routes/                REST endpoints per role
│   │   ├── utils/seed.js          Creates the first System Administrator
│   │   ├── app.js                 Express app + route mounting
│   │   └── server.js              Entry point (connects DB, starts server)
│   ├── package.json
│   └── .env.example
└── frontend/              React (Vite) SPA
    └── src/
        ├── api/axios.js           Axios instance with JWT interceptor
        ├── context/AuthContext.jsx
        ├── components/            Navbar, ProtectedRoute, SortableTh, StarRating
        └── pages/                 Login, Signup, Admin*, UserStores, StoreOwnerDashboard, UpdatePassword
```

## Database schema

- **users**: id, name (20-60 chars), email (unique), password (bcrypt hash), address (max 400 chars), role (`SYSTEM_ADMIN` / `NORMAL_USER` / `STORE_OWNER`)
- **stores**: id, name (20-60 chars), email (unique), address (max 400 chars), owner_id (FK → users, nullable)
- **ratings**: id, user_id (FK), store_id (FK), rating (1-5), unique constraint on (user_id, store_id) so each user rates a store once and *updates* it thereafter

## Setup

### 1. Database
Create a PostgreSQL database:
```sql
CREATE DATABASE store_rating_db;
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# edit .env with your actual DB credentials and a real JWT_SECRET
npm run seed     # creates the first System Administrator (see credentials in .env)
npm run dev      # starts on http://localhost:5000
```
Sequelize's `sync()` in `server.js` will create the tables automatically on first run.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev       # starts on http://localhost:5173, proxies /api to the backend
```

### 4. Log in
Use the admin email/password from your `.env` (defaults: `admin@storerating.com` / `Admin@1234`) to log in as System Administrator, then create Store Owner and Normal User accounts from the Admin → Users screen (or let normal users self-register via Sign Up).

## Functionality checklist (per the spec)

**Auth**
- Single login endpoint for all roles (`POST /api/auth/login`), redirects to role-specific home
- Normal User self-registration (`POST /api/auth/signup`)
- Password update for any logged-in user (`PUT /api/auth/update-password`)

**System Administrator**
- Dashboard: total users, total stores, total ratings (`GET /api/admin/dashboard`)
- Add store / add user of any role (`POST /api/admin/stores`, `POST /api/admin/users`)
- List + filter (name/email/address/role) + sort stores and users (`GET /api/admin/stores`, `GET /api/admin/users`)
- View full user detail, including a Store Owner's store rating (`GET /api/admin/users/:id`)

**Normal User**
- Browse/search stores by name and address, see overall rating + their own rating (`GET /api/stores`)
- Submit a new rating (`POST /api/stores/ratings`) and modify it later (`PUT /api/stores/ratings/:storeId`)

**Store Owner**
- Dashboard: average rating + list of users who rated their store (`GET /api/store-owner/dashboard`)

**Validation** (enforced both client-side and server-side via express-validator)
- Name: 20-60 characters
- Address: max 400 characters
- Password: 8-16 characters, ≥1 uppercase, ≥1 special character
- Email: standard format validation

**Sorting**: every list table's column headers are clickable to toggle ascending/descending sort (name, email, address, role, rating).

## What's not yet done
- Not deployed anywhere — runs locally only.
- No automated test suite (unit/integration tests) — given the timeline, priority went to a complete, correct implementation of every required feature first.
