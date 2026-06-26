# 🎓 Reappear Portal

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://reappear.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

> **A simple and easy-to-use platform for students to apply for reappear exams, access PYQs, and connect with faculty.**

Reappear Portal simplifies the chaotic process of applying for supplementary (reappear) exams. It empowers students with seamless application tracking, provides a rich repository of Previous Year Questions (PYQs), and enables direct communication with peers and faculty—all in one unified platform.

---

## 🌟 Key Features

### 🧑‍🎓 For Students

| Feature | Description |
| :--- | :--- |
| **Seamless Applications** | Apply for reappear exams with just a few clicks. |
| **PYQ Vault** | Download and prepare with an extensive collection of past papers. |
| **Instant Results** | Access exam results directly on your dashboard. |
| **Networking** | Chat and connect with classmates and faculty members. |

### 👨‍💼 For Admins

| Feature | Description |
| :--- | :--- |
| **Centralized Dashboard** | Manage all student reappear applications efficiently. |
| **Quick Approvals** | Approve or reject exam applications seamlessly. |
| **Subject Management** | Easily manage subjects and allocate them. |
| **Exam Scheduling** | Announce schedules and securely publish results. |

---

## 🛠️ Technology Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend Framework** | Next.js, React |
| **Styling & UI** | Tailwind CSS, Lucide React |
| **Animations** | GSAP, Framer Motion |
| **Backend Framework** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose) |
| **Queues & Jobs** | BullMQ, Redis |
| **Authentication** | JWT, Bcrypt, Google OAuth |
| **Services** | Resend / SendGrid (Emails), Cloudinary (Storage) |

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites
Make sure you have the following installed:
* **Node.js** (v18 or higher)
* **MongoDB** (Local or Atlas URL)
* **Redis** (Required for background email jobs)

### Installation Steps

**1. Clone the repository**
```bash
git clone <your-repo-url>
cd Reappear
```

**2. Setup Backend Server**
```bash
cd reappear-portal-backend
npm install
```

Create a `.env` file in the backend folder:
```env
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_super_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
REDIS_URL=your_redis_url
RESEND_API_KEY=your_resend_api_key
```

Run the backend services:
```bash
# Terminal 1: Start API Server
npm run dev

# Terminal 2: Start Email Background Worker
npm run email-worker
```

**3. Setup Frontend Client**
```bash
cd reappear-portal-frontend
npm install
```

Create a `.env.local` file in the frontend folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

Start the Next.js app:
```bash
npm run dev
```

> 🎉 **Success!** Your app should now be running on `http://localhost:3000`

---

## 📂 Project Architecture

```text
Reappear/
├── reappear-portal-backend/   # Express.js REST API
│   ├── controllers/           # Business logic (Auth, Exams, PYQs)
│   ├── models/                # MongoDB Schemas (Mongoose)
│   ├── routes/                # API Endpoint definitions
│   ├── workers/               # BullMQ Background Job Workers
│   └── server.js              # Application Entry Point
│
└── reappear-portal-frontend/  # Next.js Application
    ├── public/                # Static assets
    ├── src/                   # Next.js Pages & Components
    └── package.json           # Frontend Dependencies
```

---

<p align="center">
  Crafted with ❤️ for a better academic experience.
</p>
