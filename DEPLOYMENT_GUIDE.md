# SafeRoute — Production Cloud Deployment Guide

This guide provides end-to-end instructions for deploying the **SafeRoute** platform to production using modern, free-tier cloud services:
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) (Managed Cloud NoSQL)
- **Backend API**: [Render](https://render.com/) (Node.js Web Service)
- **Frontend SPA**: [Vercel](https://vercel.com/) (Global Edge CDN)

---

## 🏗️ Deployment Architecture Overview

```
┌─────────────────────────────────┐
│     Client: Vercel (Edge)       │
│   React 18 + Vite + Tailwind    │
│    https://saferoute.vercel.app │
└────────────────┬────────────────┘
                 │
                 │ HTTPS REST Calls
                 │ (CORS Restricted)
                 ▼
┌─────────────────────────────────┐
│     Backend: Render Web Service │
│   Node.js + Express + Helmet    │
│  https://saferoute-api.render...│
└────────────────┬────────────────┘
                 │
                 │ Encrypted TLS Connection
                 │ (MONGODB_URI)
                 ▼
┌─────────────────────────────────┐
│    Database: MongoDB Atlas      │
│  Managed Replica Set (Cluster)  │
└─────────────────────────────────┘
```

---

## 🗄️ Step 1: MongoDB Atlas Database Provisioning

1. **Sign Up / Log In**: Visit [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free account.
2. **Create a Free Cluster**:
   - Choose **M0 Free Tier** (Shared).
   - Select the cloud provider and region closest to your users (e.g., AWS / `ap-south-1` Mumbai).
   - Name your cluster (e.g., `SafeRouteCluster`).
3. **Configure Database Access (User Credentials)**:
   - Navigate to **Security** → **Database Access**.
   - Click **Add New Database User**.
   - Authentication Method: **Password**.
   - Username: `saferoute_admin`
   - Password: Click **Autogenerate Secure Password** (save this securely!).
   - Database User Privileges: **Read and write to any database**.
4. **Configure Network Access (IP Whitelist)**:
   - Navigate to **Security** → **Network Access**.
   - Click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`) since cloud hosts (Render) use dynamic egress IP addresses.
5. **Obtain Connection String**:
   - Go to **Database Deployments** → Click **Connect**.
   - Select **Drivers** (Node.js, Version 5.5 or later).
   - Copy the SRV connection string:
     ```text
     mongodb+srv://saferoute_admin:<password>@saferoutecluster.xxxx.mongodb.net/saferoute?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual database user password.

---

## ⚙️ Step 2: Backend API Deployment on Render

1. **Sign Up / Log In**: Go to [render.com](https://render.com/) and connect your GitHub account.
2. **Create New Web Service**:
   - Click **New +** → **Web Service**.
   - Connect your `SafeRoute` GitHub repository.
3. **Configure Service Settings**:
   - **Name**: `saferoute-api`
   - **Region**: Choose closest region (e.g., Singapore or Frankfurt).
   - **Branch**: `master` (or `main`)
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
4. **Configure Environment Variables**:
   Under **Environment Variables**, add the following key-value pairs:

   | Variable Key | Recommended Value / Description |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` *(Render sets this automatically)* |
   | `MONGODB_URI` | `mongodb+srv://saferoute_admin:<password>@cluster.mongodb.net/saferoute?retryWrites=true&w=majority` |
   | `JWT_SECRET` | *(64-character random string, see generator below)* |
   | `JWT_EXPIRE` | `30d` |
   | `CLIENT_URL` | `https://saferoute.vercel.app` *(Your Vercel URL from Step 3)* |

   > **Generating a Secure JWT Secret**:
   > Run this in your terminal to generate a production-grade secret:
   > ```bash
   > node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   > ```

5. **Deploy & Verify**:
   - Click **Create Web Service**.
   - Once deployment completes (status: *Live*), test the health check in your browser or curl:
     ```bash
     curl https://saferoute-api.onrender.com/api/health
     ```
   - Expected JSON response:
     ```json
     {
       "status": "online",
       "platform": "SafeRoute API",
       "version": "1.0.0",
       "environment": "production"
     }
     ```

---

## 🌐 Step 3: Frontend Deployment on Vercel

1. **Sign Up / Log In**: Visit [vercel.com](https://vercel.com/) and link your GitHub account.
2. **Import Project**:
   - Click **Add New...** → **Project**.
   - Select your `SafeRoute` repository.
3. **Configure Build & Output Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `client`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Configure Environment Variables**:
   Under **Environment Variables**, set:

   | Variable Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://saferoute-api.onrender.com/api` *(Your Render backend URL)* |

5. **SPA Route Rewrites (`vercel.json`)**:
   Verify that `client/vercel.json` exists in your repository:
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
   *Why this is needed*: In a React Single Page Application (SPA), routes like `/incident-history`, `/safety-map`, and `/profile` are handled on the client. Without rewrites, reloading on a sub-route triggers a Vercel 404 error. The rewrite instructs Vercel to route all requests back to `/index.html`.

6. **Deploy & Verify**:
   - Click **Deploy**.
   - Once deployed, visit your assigned URL (e.g., `https://saferoute.vercel.app`).
   - Register a user, log in, trigger a demo SOS, and navigate through all routes to verify end-to-end functionality.

---

## 🔄 Step 4: Post-Deployment CORS Sync

After your frontend is live:
1. Copy your final Vercel production domain (e.g., `https://saferoute.vercel.app`).
2. Go to your **Render Web Service** → **Environment**.
3. Update `CLIENT_URL` to match your exact Vercel domain.
4. Render will automatically redeploy with the updated CORS whitelist.

---

## 🛠️ Production Monitoring & Troubleshooting

| Symptom | Cause | Solution |
|---|---|---|
| **CORS Error in Browser Console** | `CLIENT_URL` does not match frontend origin | Check Render `CLIENT_URL`. Ensure no trailing slash (`https://domain.vercel.app`, not `https://domain.vercel.app/`). |
| **API Returns 429 Too Many Requests** | Rate limiter triggered | Rate limiting window is 15 minutes. Wait or review `rateLimiter.js` thresholds. |
| **Render Web Service Sleeps (Cold Start)** | Free-tier spin-down after 15 min of inactivity | Allow 30–50 seconds on initial wake-up request. |
| **404 on Page Refresh on Vercel** | Missing rewrite rule | Ensure `client/vercel.json` is committed with `{"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]}`. |
| **MongoDB MongooseServerSelectionError** | IP address not whitelisted or incorrect URI | Ensure MongoDB Atlas has `0.0.0.0/0` in Network Access whitelist and database credentials are correct. |
