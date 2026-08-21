<div align="center">
  <h1 align="center">🎓 Reappear Portal</h1>
</div>

<div align="center">
  <p align="center">
    <strong>A simple and easy-to-use platform for students to apply for reappear exams, access PYQs, and connect with faculty.</strong>
  </p>
  
  <p>
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
    <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
    <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express.js" />
    <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  </p>
</div>

<br />

## 🌟 About the Project

**Reappear Portal** simplifies the chaotic process of applying for supplementary (reappear) exams. It empowers students with seamless application tracking, provides a rich repository of **Previous Year Questions (PYQs)**, and enables direct communication with peers and faculty—all in one unified platform.

---

## ✨ Key Features

<table align="center">
  <tr>
    <td width="50%">
      <h3>🧑‍🎓 For Students</h3>
      <ul>
        <li><b>Seamless Applications:</b> Apply for reappear exams with a few clicks.</li>
        <li><b>PYQ Vault:</b> Download and prepare with an extensive collection of past exam papers.</li>
        <li><b>Instant Results:</b> Access exam results directly on your dashboard.</li>
        <li><b>Peer Networking:</b> Chat and connect with classmates and faculty members.</li>
      </ul>
    </td>
    <td width="50%">
      <h3>👨‍💼 For Admin & Faculty</h3>
      <ul>
        <li><b>Centralized Dashboard:</b> Manage student applications efficiently.</li>
        <li><b>Quick Approvals:</b> Approve/reject exam applications seamlessly.</li>
        <li><b>Subject Management:</b> Easily allocate subjects to specific faculty.</li>
        <li><b>Exam Scheduling:</b> Announce schedules and publish results securely.</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🛠️ Technology Stack

### 🎨 Frontend
- **Framework & UI:** Next.js, React, Custom CSS
- **Animations:** GSAP, Framer Motion, Lucide React
- **Data & Auth:** Axios, `@react-oauth/google`

### ⚙️ Backend
- **Server & Database:** Node.js, Express.js, MongoDB
- **Queues & Jobs:** BullMQ, Redis
- **Security:** JWT Authentication, Bcrypt
- **Email Services:** Resend, SendGrid, Nodemailer
- **Media Storage:** Cloudinary, Multer

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### 📋 Prerequisites
Make sure you have installed:
- **Node.js** (v18+)
- **MongoDB** (Local or Atlas)
- **Redis** (Required for background jobs)

### 💻 Installation

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
Run the backend:
```bash
# Terminal 1: API Server
npm run dev

# Terminal 2: Email Background Worker
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
📦 Reappear
 ┣ 📂 reappear-portal-backend   # Express.js REST API
 ┃ ┣ 📂 controllers             # Business logic (Auth, Exams, PYQs)
 ┃ ┣ 📂 models                  # MongoDB Schemas (Mongoose)
 ┃ ┣ 📂 routes                  # API Endpoint definitions
 ┃ ┣ 📂 workers                 # BullMQ Background Job Workers
 ┃ ┗ 📜 server.js               # Application Entry Point
 ┃
 ┗ 📂 reappear-portal-frontend  # Next.js Application
   ┣ 📂 public                  # Static images/icons
   ┣ 📂 src                     # Next.js Pages & Components
   ┗ 📜 package.json            # Frontend Dependencies
```

---

## 🌐 Deployment

The Reappear Portal is deployed and live:

**[👉 Reappear Portal - Live Demo](https://reappear.vercel.app/)**

- **Frontend (Next.js):** Hosted on Vercel
- **Backend (Node.js/Express):** Hosted on Render (with BullMQ background workers)

---

<div align="center">
  <p>Crafted with ❤️ for a better academic experience.</p>
</div>
