# 🎓 BoardPrep AI — AI-Powered LMS for Board Exam Students

An AI-powered Learning Management System for **Class 10 & 12 board exam students**, featuring Google Gemini AI integration for doubt resolution, one-page summaries, quiz generation, and answer grading.

---

## 🚀 Features

| Feature | Description |
|---|---|
| **🤖 Doubt Destroyer** | Get instant answers in Hinglish from an AI tutor, 24/7 |
| **📝 One-Page Summaries** | AI converts 20-page chapters into quick revision notes |
| **🎯 Mock Test Generator** | 5 board-exam-level MCQs generated instantly by AI |
| **✅ Board Examiner Mode** | AI grades your answers like a real CBSE/ICSE examiner |
| **📚 PYQ / Resource Vault** | Previous Year Questions, notes, and video links |
| **🔥 Streaks & Leaderboard** | Daily streaks and point-based rankings to keep you motivated |

---

## 🗂️ Project Structure

```
Full_Stack/
├── backend/                  # Node.js + Express + MongoDB API
│   ├── config/db.js          # MongoDB connection
│   ├── controllers/          # Route handlers
│   │   ├── aiController.js
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   └── resourceController.js
│   ├── middleware/auth.js     # JWT protection middleware
│   ├── models/               # Mongoose models
│   │   ├── AILog.js
│   │   ├── Resource.js
│   │   └── User.js
│   ├── routes/               # Express routers
│   ├── services/geminiService.js  # Google Gemini AI integration
│   ├── .env                  # Environment variables (DO NOT COMMIT)
│   ├── .env.example          # Template for env variables
│   ├── package.json
│   └── server.js             # Entry point
│
└── frontend/                 # Next.js 16 + Tailwind CSS v4
    ├── app/
    │   ├── components/Navbar.js
    │   ├── context/AuthContext.js
    │   ├── lib/api.js         # API helper functions
    │   ├── dashboard/page.js
    │   ├── doubt/page.js
    │   ├── grade/page.js
    │   ├── leaderboard/page.js
    │   ├── login/page.js
    │   ├── quiz/page.js
    │   ├── register/page.js
    │   ├── resources/page.js
    │   ├── summary/page.js
    │   ├── globals.css
    │   ├── layout.js
    │   └── page.js            # Landing page
    ├── .env.local             # Frontend env (API URL)
    ├── next.config.mjs
    └── package.json
```

---

## ⚙️ Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS v4
- **Backend:** Node.js, Express.js, MongoDB (Mongoose)
- **AI:** Google Gemini 1.5 Flash (`@google/generative-ai`)
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **Database:** MongoDB Atlas

---

## 🔧 Setup & Installation

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key ([get one free](https://aistudio.google.com/app/apikey))

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Backend Environment

Copy `.env.example` → `.env` and fill in your values:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/lmsDB
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. Configure Frontend Environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Run the App

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Seed Sample Resources (optional)

After starting the app, visit the **Resources** page and click **"Seed Sample Resources"** to populate PYQs, notes, and video links.

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new student |
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/auth/me` | Get current user (protected) |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/progress` | Get subject progress |
| POST | `/api/dashboard/update-progress` | Update subject % |
| GET | `/api/dashboard/daily-goals` | AI-suggested study goals |
| GET | `/api/dashboard/chapters/:subject` | Get chapters list |
| GET | `/api/dashboard/leaderboard` | Top 20 students |

### AI (all protected)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/doubt` | Ask a doubt (Hinglish AI) |
| POST | `/api/ai/summary` | Generate chapter summary |
| POST | `/api/ai/generate-quiz` | Generate MCQ quiz |
| POST | `/api/ai/grade-answer` | Grade a written answer |

### Resources
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/resources/pyqs` | Filter PYQs |
| GET | `/api/resources/notes` | Filter notes |
| GET | `/api/resources/videos` | Filter videos |
| POST | `/api/resources/seed` | Seed sample data |

---

## 👤 Author

Built with ❤️ for Indian Board Exam Students — **BoardPrep AI © 2026**
