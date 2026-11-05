# SafeRoute — Women Safety & Emergency Assistance Platform

A modern, full-stack MERN (MongoDB, Express, React, Node.js) web application engineered to provide women and vulnerable commuters with rapid emergency assistance, trusted contact network coordination, consent-based geolocation broadcasting, and interactive safety mapping.

---

## 🌟 Key Features Overview

- **🚨 One-Tap Emergency SOS**: Broadcast real-time distress signals with geolocation coordinates and immediate delivery confirmation.
- **👥 Trusted Guardian Circle**: Secure CRUD management for designated family members, roommates, and mentors.
- **🗺️ Interactive Safety Map**: OpenStreetMap & Leaflet integration highlighting verified safe havens, police stations, 24/7 medical centers, and women help desks.
- **🔒 Privacy-First Architecture**: Strictly consent-driven geolocation; no background tracking without explicit user authorization.
- **📋 Auditable Incident Logs**: Timestamped emergency history with delivery statuses and coordinates for post-event review.
- **⚖️ Ethical Emergency Disclosure**: Transparent differentiation between simulated college demo mode and live external dispatch (e.g., Twilio SMS).

---

## 🏗️ Architecture & Technology Stack

### Frontend (`/client`)
- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with a custom Dark Navy, Rich Purple, and Vibrant Pink palette
- **Routing**: [React Router DOM v6](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/) with centralized interceptors and environment variable injection
- **Mapping**: [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/) with OpenStreetMap tiles

### Backend (`/server`)
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose](https://mongoosejs.com/) ODM
- **Authentication**: JSON Web Tokens (JWT) & `bcryptjs` password hashing
- **Security & Utilities**: `cors`, `dotenv`

---

## 📁 Repository Structure

```text
SafeRoute/
├── client/                     # Frontend Vite + React application
│   ├── public/                 # Static assets & favicons
│   ├── src/
│   │   ├── assets/             # Images, vector icons, media
│   │   ├── components/         # Reusable UI components (Navbar, Footer, Modals)
│   │   ├── context/            # React Context providers (AuthContext, SocketContext)
│   │   ├── hooks/              # Custom React hooks (useGeolocation, useAuth)
│   │   ├── layouts/            # Layout wrappers (MainLayout, DashboardLayout)
│   │   ├── pages/              # Routed views (LandingPage, Login, Register, Dashboard)
│   │   ├── services/           # API instances and backend endpoints
│   │   ├── utils/              # Client-side helper functions & formatters
│   │   ├── App.jsx             # Route definitions
│   │   ├── index.css           # Tailwind directives and base styles
│   │   └── main.jsx            # React root mount
│   ├── .env.example            # Client environment template
│   ├── package.json            # Client dependencies
│   ├── tailwind.config.js      # Custom theme colors and shadows
│   └── vite.config.js          # Vite build configuration
│
├── server/                     # Backend Node.js + Express REST API
│   ├── config/                 # DB connection and third-party configs
│   ├── controllers/            # Route controllers for auth, contacts, SOS
│   ├── middleware/             # Auth verification, error handlers, input validators
│   ├── models/                 # Mongoose schemas (User, Contact, EmergencyEvent)
│   ├── routes/                 # Express route definitions
│   ├── services/               # External services (SMS notifications, Geocoding)
│   ├── utils/                  # Server helper functions
│   ├── .env.example            # Server environment template
│   ├── package.json            # Server dependencies
│   └── server.js               # Express entrypoint & health checks
│
├── .gitignore                  # Git exclusions for dependencies and secrets
├── package.json                # Root package manager orchestration scripts
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18+ installed
- **Git** installed
- **MongoDB** running locally or a free [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI

### 2. Clone & Setup
```bash
git clone <repository-url>
cd SafeRoute
```

### 3. Backend Setup
```bash
cd server
cp .env.example .env
# Edit .env and supply your MONGO_URI and JWT_SECRET
npm install
npm run dev
```
The server will boot on `http://localhost:5000`. Test the health check endpoint at:
`http://localhost:5000/api/health`

### 4. Frontend Setup
In a new terminal window:
```bash
cd client
cp .env.example .env
npm install
npm run dev
```
The frontend will start at `http://localhost:5173`.

---

## 🛡️ Development Roadmap

- [x] **Phase 1: Project Foundation & Responsive Landing UI**
  - Project architecture & directory structure initialization
  - Express server with health check route & centralized error handling
  - React + Vite + Tailwind CSS setup with custom brand palette
  - Live API connection indicator on landing page
  - Emergency hotline quick-dial reference and ethical safety disclosure
- [x] **Phase 2: Authentication & User Management**
  - Mongoose User schema with bcrypt password hashing
  - JWT generation and cookie/authorization header verification middleware
  - Register & Login UI with validation, loading states, and error alerts
  - AuthContext state management with token verification
  - Protected routes and authenticated User Dashboard
- [x] **Phase 3: Trusted Contacts Management**
  - TrustedContact Mongoose model (linked to user ObjectId)
  - Full CRUD REST API with ownership authorization and phone format validation
  - Strict cross-user data isolation enforcement (403 Forbidden on cross-user access)
  - Responsive Contact Circle management UI with Add/Edit modal, empty states, search filtering, and quick dial/SMS actions
- [x] **Phase 4: Emergency SOS & Geolocation Broadcast**
  - EmergencyEvent Mongoose model with coordinates, accuracy, and audit log
  - Browser Geolocation API hook with strict consent-first triggering and error handling
  - Full SOS lifecycle API (create, get history, get active, resolve, cancel)
  - Clear Academic Demo Mode enforcement with zero false delivery claims
  - Live Emergency SOS Hub UI with pulsing radar trigger, location status, and resolve/cancel actions
- [x] **Phase 5: Interactive Safety Map & Resource Finder**
  - Leaflet & React Leaflet integration with OpenStreetMap tiles
  - Consent-first user GPS location marker with accuracy circle
  - SafetyResource Mongoose model with proximity calculations (Haversine formula)
  - Category filters (Police Outposts, Hospitals, Community Safe Havens)
  - Interactive resource markers, dark popups, search filtering, and call shortcuts
- [x] **Phase 6: Incident History, Safety Guides & User Profile**
  - **Module 1: Emergency Incident Log**: Full timeline with status filtering (Active, Resolved, Cancelled), date range picker, sorting, detailed audit inspection modal, and OpenStreetMap pin links.
  - **Module 2: Comprehensive Safety Guides**: Categorized actionable repositories (Commute Safety, Cyber Safety, Crisis Response, and Constitutional/Legal Rights including Zero FIR & Free Legal Aid) with real-time keyword search and `localStorage` bookmark persistence.
  - **Module 3: User Profile & Security Settings**: Protected `PATCH /api/auth/profile` endpoint with server-side validation, field immutability guards (email, password, `_id` protected against tampering), account metrics, and security checklists.
  - **Full Automated Testing**: 22 dedicated automated test cases verifying profile updates, tamper resistance, and cross-user incident history data isolation (76 total passing tests across the project).
- [ ] **Phase 7: Testing, Hardening & Deployment**
  - Frontend deployment on Vercel
  - Backend deployment on Render
  - MongoDB Atlas production configuration

---

## ⚠️ Academic Disclaimer

SafeRoute is developed as a computer engineering college project. In life-threatening emergencies, never rely solely on an academic web application—call official local emergency dispatch services directly:
- **India**: 112 (National Emergency), 1091 (Women Safety Helpline), 181 (Women in Distress)
- **International**: 911 (USA/Canada), 999 (UK), 112 (European Union)

