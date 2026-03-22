---
description: How to deploy the Reappear Portal application (Next.js + Express)
---

# Deploying Your Reappear Portal

Since your project uses a divided architecture (Next.js for the Frontend and Node/Express for the Backend), you will need to deploy them separately. 

The industry standard for this stack is **Vercel** for the Frontend and **Render** (or Railway) for the Backend.

---

## Part 1: Deploying the Backend (Render)

1. **Push to GitHub**: Make sure your entire `reappear-portal-backend` folder is pushed to a Github repository.
2. **Create a Render Web Service**:
   - Go to [Render.com](https://render.com) and sign up using GitHub.
   - Click **New +** and select **Web Service**.
   - Connect your GitHub repository containing the backend code.
3. **Configure Settings**:
   - **Root Directory**: `reappear-portal-backend` (if it's inside a monorepo, otherwise leave blank if it's the root of the repo).
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. **Environment Variables**:
   - Scroll down to **Advanced** -> **Environment Variables**. You must add exactly what is in your `.env` file:
     - `MONGO_URI` = `<Your MongoDB Atlas Connection String>`
     - `JWT_SECRET` = `<Your Secret Key>`
     - `EMAIL_USER` & `EMAIL_PASS` = `<Your Admin Email Credentials>`
5. **Deploy**: Hit **Create Web Service**. Wait a few minutes. Render will give you a live URL (e.g., `https://reappear-backend.onrender.com`). COPY THIS URL.

---

## Part 2: Deploying the Frontend (Vercel)

1. **Push to GitHub**: Ensure your `reappear-portal-frontend` is pushed.
2. **Setup Vercel**:
   - Go to [Vercel.com](https://vercel.com) and log in with GitHub.
   - Click **Add New** -> **Project**.
   - Import your Frontend repository.
3. **Configure Settings**:
   - **Root Directory**: `reappear-portal-frontend`
   - **Framework Preset**: Vercel automatically detects `Next.js`.
4. **Environment Variables**:
   - Add your environment variables before clicking deploy:
     - `NEXT_PUBLIC_API_URL` = `<The Render Backend URL you copied earlier>`
     - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = `<Your Google Client ID>`
5. **Deploy**: Click **Deploy**. Vercel will build and launch your site globally in seconds!

---

## Part 3: Final Security Tweaks
1. Once both are live, go to your deployed Backend's GitHub code and update `cors()` in `server.js` to ONLY allow your new Vercel Frontend URL instead of `*` (for maximum security).
2. Go to your **Google Cloud Console**, open your OAuth Credentials, and add your new Vercel URL to the **Authorized JavaScript origins** and **Authorized redirect URIs** so Google Login works on the live site!
