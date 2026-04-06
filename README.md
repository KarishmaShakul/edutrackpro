# EduTrackPro 🎓

<div align="center">

![EduTrackPro Banner](https://capsule-render.vercel.app/api?type=waving&color=6366F1&height=200&section=header&text=EduTrackPro&fontSize=60&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Academic%20Management%20Platform&descAlignY=55&descSize=20)

</div>

<div align="center">

![EduTrackPro Banner](https://img.shields.io/badge/EduTrackPro-Academic%20Management%20Platform-6366F1?style=for-the-badge&logo=bookstack&logoColor=white)

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

**A full-stack MERN academic management system with role-based portals for Admin, Teacher, and Student.**

[📺 Watch Demo](https://youtu.be/MnNhpveKxSY) · [🐛 Report Bug](https://github.com/KarishmaShakul/edutrackpro/issues) · [✨ Request Feature](https://github.com/KarishmaShakul/edutrackpro/issues)

</div>

---

## 📺 Demo

[![EduTrackPro Demo](https://img.shields.io/badge/YouTube-Demo%20Video-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/MnNhpveKxSY)

> Click the badge above to watch the full demo on YouTube.

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Demo Credentials](#-demo-credentials)
- [API Endpoints](#-api-endpoints)
- [Project Structure](#-project-structure)
- [Author](#-author)
- [License](#-license)

---

## 🎯 About

**EduTrackPro** is a modern, full-stack academic management platform built with the MERN stack. It provides role-based dashboards for administrators, teachers, and students to manage classes, assignments, quizzes, marks, and attendance in one unified system.

Built as a personal project by a CS undergraduate to demonstrate real-world full-stack development skills including JWT authentication, role-based access control, real-time data polling, and RESTful API design.

---

## ✨ Features

### 🔐 Authentication & Security
- JWT access + refresh token system
- bcrypt password hashing (salt rounds: 12)
- Role-based route protection
- Helmet.js security headers
- CORS configuration

### 👨‍💼 Admin Portal
- Real-time dashboard with live statistics
- Manage teachers (add, edit, delete)
- Manage students (add, edit, delete)
- Manage classes and course assignments
- System alerts (classes without teacher, past due assignments, low attendance)
- User distribution charts (Recharts)
- Subject performance analytics

### 👨‍🏫 Teacher Portal
- Personal dashboard with class overview
- Class roster management
- Create and manage quizzes
- Create and manage assignments
- Upload course materials
- Enter and update student marks
- Mark daily attendance (present/absent/late)
- Real-time attendance average calculation

### 👨‍🎓 Student Portal
- Personal academic dashboard
- View enrolled classes
- Attempt quizzes
- Submit assignments
- View marks and results
- Track attendance percentage

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Routing** | React Router DOM v6 |
| **HTTP Client** | Axios with interceptors |
| **Charts** | Recharts |
| **Icons** | React Icons (Feather) |
| **Notifications** | React Hot Toast |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas, Mongoose |
| **Authentication** | JWT (access + refresh tokens) |
| **Password Hashing** | bcryptjs |
| **File Uploads** | Multer |
| **Security** | Helmet, CORS |
| **Logging** | Morgan |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────┐
│                  Frontend (React)                │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │  Admin   │ │ Teacher  │ │     Student      │ │
│  │  Portal  │ │  Portal  │ │     Portal       │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
│         Axios + JWT Token Interceptors            │
└─────────────────┬───────────────────────────────┘
                  │ REST API calls
┌─────────────────▼───────────────────────────────┐
│              Backend (Express.js)                │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │   Auth   │ │  Admin   │ │ Teacher/Student  │ │
│  │  Routes  │ │  Routes  │ │     Routes       │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
│         Middlewares: Auth, Role, Validation       │
└─────────────────┬───────────────────────────────┘
                  │ Mongoose ODM
┌─────────────────▼───────────────────────────────┐
│              MongoDB Atlas (Cloud)               │
│   Users │ Classes │ Marks │ Quiz │ Assignment   │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- npm v8+
- MongoDB Atlas account (free tier works)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/KarishmaShakul/edutrackpro.git
cd edutrackpro
```

**2. Install Backend Dependencies**
```bash
cd backend
npm install
```

**3. Install Frontend Dependencies**
```bash
cd ../frontend
npm install --legacy-peer-deps
```

**4. Configure Environment Variables**

Create `backend/.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_jwt_secret_key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

**5. Seed the Database (First time only!)**
```bash
cd backend
npm run seed
```
> ⚠️ WARNING: Never run seed again after initial setup — it wipes all data!

**6. Start the Application**

Open two terminals:

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

**7. Open in Browser**
```
http://localhost:3000
```

---

## ⚙️ Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT signing | `your-secret-key` |
| `JWT_EXPIRES_IN` | Access token expiry | `7d` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:3000` |

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@edutrackpro.com | admin123 |
| **Teacher** | balamurali@edutrackpro.com | teacher123 |
| **Student** | amrithab@edutrackpro.com | student123 |

> All students share the password: `student123`

---

## 📡 API Endpoints

### Auth Routes `/api/user`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/login` | Login user |
| POST | `/logout` | Logout user |
| GET | `/validate` | Validate JWT token |
| POST | `/refresh` | Refresh access token |
| GET | `/profile` | Get current user profile |
| PUT | `/profile` | Update profile |
| PUT | `/change-password` | Change password |

### Admin Routes `/api/admin`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Get dashboard stats |
| GET | `/teachers` | List all teachers |
| POST | `/addteacher` | Add new teacher |
| PUT | `/teachers/:id` | Update teacher |
| DELETE | `/teachers/:id` | Delete teacher |
| GET | `/students` | List all students |
| POST | `/students` | Add new student |
| GET | `/classes` | List all classes |
| POST | `/addclass` | Create new class |
| PUT | `/class/:id` | Update class |
| DELETE | `/class/:id` | Delete class |

### Teacher Routes `/api/teacher`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Teacher dashboard |
| GET | `/classes` | My classes |
| GET | `/quizzes` | My quizzes |
| POST | `/quizzes` | Create quiz |
| GET | `/assignments` | My assignments |
| POST | `/assignments` | Create assignment |
| GET | `/marks` | View marks |
| POST | `/marks` | Enter marks |
| POST | `/classes/:id/attendance` | Mark attendance |
| GET | `/classes/:id/attendance` | Get attendance |

### Student Routes `/api/student`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Student dashboard |
| GET | `/classes` | My enrolled classes |
| GET | `/quizzes` | Available quizzes |
| POST | `/quizzes/:id/submit` | Submit quiz |
| GET | `/assignments` | My assignments |
| POST | `/assignments/:id/submit` | Submit assignment |
| GET | `/results` | My marks/results |

---

## 📁 Project Structure

```
edutrackpro/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── teacherController.js
│   │   └── studentController.js
│   ├── middlewares/
│   │   ├── auth.js
│   │   ├── role.js
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Class.js
│   │   ├── Marks.js
│   │   ├── Quiz.js
│   │   ├── Assignment.js
│   │   └── Material.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── teacherRoutes.js
│   │   └── studentRoutes.js
│   ├── services/
│   │   └── dashboardService.js
│   ├── utils/
│   │   ├── token.js
│   │   ├── helpers.js
│   │   └── fileUpload.js
│   ├── scripts/
│   │   └── seedDatabase.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── Logo.jsx
│   │   │   ├── DataTable.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── StatCard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Teachers.jsx
│   │   │   │   ├── Students.jsx
│   │   │   │   └── Classes.jsx
│   │   │   ├── teacher/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Classes.jsx
│   │   │   │   ├── Assignments.jsx
│   │   │   │   ├── Quizzes.jsx
│   │   │   │   ├── Marks.jsx
│   │   │   │   ├── Materials.jsx
│   │   │   │   └── Attendance.jsx
│   │   │   └── student/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── Classes.jsx
│   │   │       ├── Assignments.jsx
│   │   │       ├── Quizzes.jsx
│   │   │       └── Results.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── README.md
└── start.bat
```

---

## 👩‍💻 Author

**Karishma Shakul**
- CS Undergraduate
- GitHub: [@KarishmaShakul](https://github.com/KarishmaShakul)

---

## 📄 License

This project is licensed under the MIT License.

```
MIT License — free to use, modify, and distribute
with attribution to the original author.
```

---

<div align="center">

Made with ❤️ by Karishma Shakul

⭐ Star this repo if you found it helpful!

</div>
