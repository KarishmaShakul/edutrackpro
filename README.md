# EduTrackPro

**EduTrackPro** is a full-stack **MERN-based academic management system** designed to manage **classes, assignments, quizzes, and student performance analytics**.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, React Router, Axios, Recharts
- **Backend**: Node.js, Express
- **Database**: MongoDB, Mongoose
- **Auth/Security**: JWT (access + refresh), bcrypt password hashing, Helmet, CORS

## Features

- **Role-based portals**: Admin, Head (HOD), Teacher, Student
- **Class management**: create/assign classes, enroll students, view rosters
- **Assessments**: quizzes and assignments
- **Grades/marks**: record and view results
- **Analytics**: charts and dashboards (user distribution, trends, etc.)
- **Profile management**: view/update profile, change password

## Architecture Overview

This repo is structured as two apps:

- **`frontend/`**: React + Vite single-page app (SPA)
- **`backend/`**: Express REST API connected to MongoDB

High-level flow:

1. User logs in from the React UI.
2. Frontend calls the backend API (proxied via Vite during development).
3. Backend validates credentials against MongoDB, returns JWT tokens + user profile.
4. Frontend stores tokens and uses them for authenticated API calls.

## Authentication Flow

- **Login**: `POST /api/user/login`
  - Backend verifies email/password (bcrypt compare)
  - Returns `token` (access token), `refreshToken`, and `user`
- **Authenticated requests**: Frontend sends `Authorization: Bearer <token>`
- **Token validation**: `GET /api/user/validate`
- **Token refresh** (when access token expires): `POST /api/user/refresh`
  - Frontend sends `refreshToken`
  - Backend returns a new access `token`
- **Logout**: `GET /api/user/logout` or `POST /api/user/logout`

## Setup Instructions

### Prerequisites

- Node.js **v18+**
- MongoDB (local) **or** MongoDB Atlas connection string

### 1) Install dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd ../frontend
npm install
```

### 2) Configure environment variables

Create `backend/.env` (or edit the existing one):

```bash
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/lms_database
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=7d
```

### 3) Seed demo data (optional but recommended)

```bash
cd backend
npm run seed
```

### 4) Run the app

Start backend:

```bash
cd backend
npm run dev
```

Start frontend (new terminal):

```bash
cd frontend
npm run dev
```

### Notes

- **Frontend dev server** runs on `http://localhost:3000`
- **Backend API** runs on `http://localhost:5000`
- Vite is configured to **proxy** `/api` from the frontend to the backend during development.