# SafeRoute — College Project Demonstration & Evaluation Script

This document is a step-by-step presentation script designed for 3rd-year engineering college project reviews, viva voce, and external examiner demonstrations.

---

## 🎯 Project Objective Statement (Opening Pitch)

> *"Respected Examiners, SafeRoute is a modern, full-stack MERN web platform engineered to address women commuter safety and rapid crisis assistance. It features an interactive safety map with real-time proximity calculations, a consent-first emergency SOS beacon, a trusted guardian circle, legal rights safety guides, and auditable incident logs. The system is designed with strict data isolation, privacy guards, and transparent academic demo disclaimers."*

---

## 📋 Step-by-Step Demonstration Walkthrough

### Step 1: Landing Page & Architectural Overview
1. **Navigate to**: `http://localhost:5173/` (or your production Vercel URL).
2. **Key Talking Points**:
   - Highlight the **Live API Status Badge** in the hero section (real-time communication with backend health endpoint `/api/health`).
   - Point out the **National Emergency Helplines (112, 1091)** prominently visible in the header.
   - Explain the **Ethical Safety Protocol Notice**: as a college engineering project, the platform operates in a transparent academic simulation mode to avoid creating false panic or illegal false alarms.

---

### Step 2: User Authentication & JWT Session Security
1. **Navigate to**: Sign In (`/login`) → Click **Create Account** (`/register`).
2. **Action**: Register a new student commuter account (e.g., `ananya@college.edu`, Name: *Ananya Sen*, Password: `Password123!`).
3. **Key Talking Points**:
   - Passwords are salt-hashed using **bcrypt** before touching MongoDB Atlas.
   - On successful registration, a signed **JSON Web Token (JWT)** is issued with an expiration window of 30 days.
   - Password hashes are strictly omitted from all client-facing responses.

---

### Step 3: Guardian Circle Management (CRUD Operations)
1. **Navigate to**: **Trusted Circle** (`/contacts`).
2. **Action**:
   - Click **Add Guardian Contact**.
   - Add Contact 1: *Mother* (`+91 98765 43210`, Relationship: *Parent*).
   - Add Contact 2: *Campus Roommate* (`+91 91234 56789`, Relationship: *Peer*).
   - Use the **Search Filter** to instantly find contacts by name or relationship.
   - Demonstrate the **Call** and **SMS** deep-link shortcuts (`tel:` and `sms:` URI schemes).
3. **Key Talking Points**:
   - Full CRUD functionality backed by Mongoose with strict multi-user scoping.
   - User B cannot view, edit, or delete User A's contacts (enforced by 403 Forbidden checks).

---

### Step 4: Consent-First Emergency SOS Activation
1. **Navigate to**: **Emergency SOS** (`/sos`).
2. **Action**:
   - Click **Trigger Emergency SOS**.
   - Note the browser prompt requesting GPS geolocation permission.
   - Once acquired, show the real-time latitude, longitude, and accuracy radius (e.g., ±15 meters).
   - Show the live **Emergency Event Card** with pulsing alert animation.
   - Inspect the **Delivery Audit Log**: show that contacts are logged in the database under simulated demo mode.
   - Click **Mark Incident Resolved** (or Cancel) to conclude the emergency cycle.
3. **Key Talking Points**:
   - **Consent-First Architecture**: SafeRoute never monitors user location in the background without explicit user authorization.
   - **Academic Transparency**: The delivery status explicitly confirms `"demo_logged"` so examiners verify that zero false claims of police or SMS dispatch are made.

---

### Step 5: Interactive Safety Map & Proximity Engine
1. **Navigate to**: **Safety Map** (`/safety-map`).
2. **Action**:
   - Click **Acquire Current GPS** to center the map on the user's location with an accuracy circle.
   - Toggle Category Filters: **Police Stations**, **Hospitals**, and **Community Safe Havens**.
   - Adjust the **Proximity Radius Filter** (e.g., *Within 3 km* or *Within 5 km*).
   - Click any marker to open the custom dark popup displaying address, operating hours, emergency contact, and calculated distance (e.g., *0.8 km away*).
3. **Key Talking Points**:
   - Powered by **Leaflet** and **OpenStreetMap** without expensive proprietary API keys.
   - Real-time distance calculation using the mathematical **Haversine formula** implemented on both client and backend.
   - All demo resources are seeded idempotently with explicit `isDemo: true` flags.

---

### Step 6: Incident Audit History & Log Review
1. **Navigate to**: **Incident History** (`/incident-history`).
2. **Action**:
   - Filter incidents by status (**Active**, **Resolved**, **Cancelled**).
   - Filter by date range or sort order.
   - Click **View Audit Details** on any past incident.
   - Show the shortened event ID, coordinates, delivery details, and the one-click link to view the exact GPS pin on **OpenStreetMap**.
3. **Key Talking Points**:
   - Comprehensive audit trail for post-incident review and accountability.
   - Clear fallbacks when GPS was unavailable during emergency trigger.

---

### Step 7: Actionable Safety Guides & Legal Rights
1. **Navigate to**: **Safety Guides** (`/safety-guides`).
2. **Action**:
   - Filter by categories: *Commute Safety*, *Cyber Safety*, *Crisis Response*, and *Constitutional & Legal Rights*.
   - Search for *"Zero FIR"* or *"Free Legal Aid"*.
   - Click the bookmark icon to save a guide for offline quick reference (persisted in `localStorage`).
   - Open a guide to view actionable checklists and legal rights under Indian law (CrPC / BNSS Section 154, Article 39A, POSH Act).
3. **Key Talking Points**:
   - Empowers users with knowledge of their constitutional protections and emergency protocols.

---

### Step 8: User Profile & Security Settings
1. **Navigate to**: **My Profile** (`/profile`).
2. **Action**:
   - Show personal statistics (contacts count, incidents count, bookmark count).
   - Update user name or phone number.
   - Highlight the disabled, read-only email field with its explanation tooltip.
   - Review the security checklist (active JWT session, password encryption status).
3. **Key Talking Points**:
   - Protected endpoint `PATCH /api/auth/profile` with server-side validation and field immutability guards.

---

## ❓ Frequently Asked Examiner Questions & Model Answers

### Q1: *"How do you prevent User A from accessing User B's contacts or SOS logs?"*
> **Answer**: *"Every protected endpoint extracts the user's verified MongoDB ObjectId directly from the cryptographic JWT token via our `protect` auth middleware. In our controllers, we verify that the resource's `user` field strictly matches `req.user._id`. If a user attempts to query or mutate an ID belonging to another user, the server rejects the request with HTTP 403 Forbidden. This was validated across 96 automated tests."*

### Q2: *"Why are you using Leaflet and OpenStreetMap instead of Google Maps?"*
> **Answer**: *"OpenStreetMap paired with React Leaflet is fully open-source, highly customizable, and requires no proprietary API keys or billing quotas. It gives us complete control over tile rendering, custom SVG marker styling, and offline suitability while adhering to open web standards."*

### Q3: *"Does the SOS feature send real SMS messages to the police?"*
> **Answer**: *"In this academic college prototype, the SOS engine operates in an auditable Demo Simulation Mode. It records GPS coordinates, timestamps, and contact logs transparently into MongoDB Atlas. In accordance with ethical engineering guidelines, we do not claim external dispatch unless an actual enterprise SMS gateway (such as Twilio or AWS SNS) is integrated and authenticated with emergency authorities."*

### Q4: *"What happens if a user's phone has GPS disabled during an emergency?"*
> **Answer**: *"SafeRoute uses a graceful degradation strategy. If geolocation permissions are denied or GPS hardware is unavailable, the emergency alert is still dispatched and recorded with a null coordinate payload. The incident log and trusted contacts clearly indicate that coordinates were unavailable, ensuring the distress alert is never blocked."*
