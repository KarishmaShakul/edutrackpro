# LMS Backend API

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB v6+

### Installation

```bash
cd backend
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and update values:
```bash
cp .env.example .env
```

### Seed Database

```bash
npm run seed
```

### Run Development Server

```bash
npm run dev
```

Server runs at: `http://localhost:5000`

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

---

## 🔐 Auth Routes (`/api/user`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/login` | User login | ❌ |
| POST | `/logout` | User logout | ✅ |
| GET | `/validate` | Validate token | ✅ |
| POST | `/refresh` | Refresh token | ❌ |
| GET | `/profile` | Get profile | ✅ |
| PUT | `/profile` | Update profile | ✅ |
| PUT | `/change-password` | Change password | ✅ |

---

## 👨‍💼 Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/dashboard` | Dashboard stats | ✅ Admin |
| GET | `/teachers` | List teachers | ✅ Admin |
| POST | `/teachers` | Add teacher | ✅ Admin |
| GET | `/teachers/:id` | Get teacher | ✅ Admin |
| PUT | `/teachers/:id` | Update teacher | ✅ Admin |
| DELETE | `/teachers/:id` | Delete teacher | ✅ Admin |
| GET | `/students` | List students | ✅ Admin |
| POST | `/students` | Add student | ✅ Admin |
| GET | `/students/:id` | Get student | ✅ Admin |
| PUT | `/students/:id` | Update student | ✅ Admin |
| DELETE | `/students/:id` | Delete student | ✅ Admin |
| GET | `/classes` | List classes | ✅ Admin |
| POST | `/classes` | Create class | ✅ Admin |
| PUT | `/classes/:id` | Update class | ✅ Admin |
| DELETE | `/classes/:id` | Delete class | ✅ Admin |
| POST | `/classes/:id/assign-teacher` | Assign teacher | ✅ Admin |

---

## 👨‍🏫 Teacher Routes (`/api/teacher`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/dashboard` | Dashboard stats | ✅ Teacher |
| GET | `/classes` | My classes | ✅ Teacher |
| GET | `/classes/:id` | Class details | ✅ Teacher |
| GET | `/classes/:classId/quizzes` | Class quizzes | ✅ Teacher |
| POST | `/quizzes` | Create quiz | ✅ Teacher |
| GET | `/quizzes/:id` | Get quiz | ✅ Teacher |
| PUT | `/quizzes/:id` | Update quiz | ✅ Teacher |
| DELETE | `/quizzes/:id` | Delete quiz | ✅ Teacher |
| GET | `/classes/:classId/assignments` | Class assignments | ✅ Teacher |
| POST | `/assignments` | Create assignment | ✅ Teacher |
| GET | `/assignments/:id` | Get assignment | ✅ Teacher |
| PUT | `/assignments/:id` | Update assignment | ✅ Teacher |
| DELETE | `/assignments/:id` | Delete assignment | ✅ Teacher |
| POST | `/materials` | Upload material | ✅ Teacher |
| DELETE | `/materials/:id` | Delete material | ✅ Teacher |
| GET | `/classes/:classId/marks` | Class marks | ✅ Teacher |
| POST | `/marks` | Add marks | ✅ Teacher |
| PUT | `/marks/:id` | Update marks | ✅ Teacher |
| DELETE | `/marks/:id` | Delete marks | ✅ Teacher |

---

## 👨‍🎓 Student Routes (`/api/student`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/dashboard` | Dashboard stats | ✅ Student |
| GET | `/classes` | Enrolled classes | ✅ Student |
| GET | `/classes/:id` | Class details | ✅ Student |
| GET | `/classes/:classId/materials` | Class materials | ✅ Student |
| GET | `/materials/:id` | Get material | ✅ Student |
| GET | `/classes/:classId/quizzes` | Class quizzes | ✅ Student |
| GET | `/quizzes/:id` | Get quiz | ✅ Student |
| POST | `/quizzes/:id/submit` | Submit quiz | ✅ Student |
| GET | `/classes/:classId/assignments` | Class assignments | ✅ Student |
| GET | `/assignments/:id` | Get assignment | ✅ Student |
| POST | `/assignments/:id/submit` | Submit assignment | ✅ Student |
| GET | `/results` | My results | ✅ Student |

---

## 🎓 Head Routes (`/api/head`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/dashboard` | Dashboard stats | ✅ Head |
| GET | `/classes` | All classes | ✅ Head |
| GET | `/classes/:id/results` | Class results | ✅ Head |
| GET | `/classes/:classId/materials` | Class materials | ✅ Head |
| GET | `/graph` | Performance graphs | ✅ Head |
| GET | `/reports` | Generate reports | ✅ Head |

---

## 🧪 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@lms.com | admin123 |
| Head | head@lms.com | head1234 |
| Teacher | sarah@lms.com | teacher1 |
| Student | john@lms.com | student1 |

---

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js
├── controllers/
│   ├── authController.js
│   ├── adminController.js
│   ├── teacherController.js
│   ├── studentController.js
│   └── headController.js
├── middlewares/
│   ├── auth.js
│   ├── role.js
│   ├── validate.js
│   └── errorHandler.js
├── models/
│   ├── User.js
│   ├── Class.js
│   ├── Quiz.js
│   ├── Assignment.js
│   ├── Material.js
│   └── Marks.js
├── routes/
│   ├── authRoutes.js
│   ├── adminRoutes.js
│   ├── teacherRoutes.js
│   ├── studentRoutes.js
│   ├── headRoutes.js
│   └── indexRoutes.js
├── scripts/
│   └── seedDatabase.js
├── utils/
│   ├── token.js
│   ├── fileUpload.js
│   └── helpers.js
├── uploads/
├── .env
├── package.json
└── server.js
```

---

## 📊 Total Routes: 41

- Auth: 7 routes
- Admin: 16 routes  
- Teacher: 18 routes
- Student: 12 routes
- Head: 6 routes
- Index: 2 routes
