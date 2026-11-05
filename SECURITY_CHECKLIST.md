# SafeRoute — Security Audit & Hardening Checklist

This document details the security posture, threat mitigation strategies, architectural trade-offs, and compliance checks implemented across the **SafeRoute** MERN platform.

---

## 🛡️ Security Controls Matrix

| Domain | Control Implemented | Status | Implementation Details |
|---|---|:---:|---|
| **Transport Security** | TLS/HTTPS Enforcement | Verified | Enforced at Render & Vercel edge reverse proxies. |
| **HTTP Security Headers** | Helmet Middleware | Active | `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, CORP, HSTS. |
| **Fingerprint Suppression** | `x-powered-by` Disabled | Active | Suppressed via `app.disable('x-powered-by')`. |
| **Origin Isolation** | Strict CORS Policy | Active | Whitelist matches `CLIENT_URL`. Blocks unapproved external origins with 403. |
| **DoS Mitigation** | Request Size Throttling | Active | `express.json({ limit: '100kb' })` prevents memory exhaustion attacks. |
| **Brute Force Protection** | Rate Limiting | Active | 15 attempts / 15 min on `/api/auth/login` and `/api/auth/register`. |
| **SOS Flood Protection** | Emergency Rate Limiting | Active | 15 triggers / min on `/api/sos` mitigates loop attacks. |
| **Password Storage** | One-Way Salted Hash | Active | `bcryptjs` with salt rounds = 10; passwords never stored plaintext. |
| **Credential Masking** | Projection Suppression | Active | Password field excluded via `select: '-password'` and controller sanitization. |
| **Authorization** | JWT Bearer Middleware | Active | `protect` middleware verifies signature, expiration, and user persistence. |
| **Data Isolation** | Multi-Tenant Scoping | Active | Strict user ownership checks on Contacts, SOS events, and Profile. Cross-user access returns 403. |
| **Input Validation** | Schema & Format Rules | Active | Email normalization, phone regex, coordinate range checks (-90 to 90, -180 to 180). |
| **Sensitive Field Guard** | Immutability Enforcement | Active | `PATCH /api/auth/profile` ignores `email`, `password`, `_id`, and `role`. |
| **Error Masking** | Stack Trace Suppression | Active | Production error handler omits stack traces and internal DB messages. |

---

## 🔍 In-Depth Architectural Audits

### 1. JWT Storage: `localStorage` vs. `HttpOnly` Cookies

#### Current Implementation
- SafeRoute stores the JWT Bearer token in the client browser's `localStorage` under the key `saferoute_token`.
- The token is automatically attached to outgoing HTTP requests via Axios request interceptors (`Authorization: Bearer <token>`).

#### Security Limitations & Trade-Offs
- **XSS Vulnerability**: Any JavaScript code running on the domain (via a Cross-Site Scripting vulnerability or compromised third-party npm package) can read `localStorage.getItem('saferoute_token')` and exfiltrate the session token.
- **Why It Was Chosen for This Stage**:
  - Stateless architecture: avoids cross-domain cookie partition complexities (`SameSite=None; Secure`) between separate deployment domains (e.g., `saferoute.vercel.app` frontend communicating with `saferoute-api.onrender.com` backend).
  - Eliminates CSRF (Cross-Site Request Forgery) attacks on modern browsers because Bearer tokens must be explicitly injected via JavaScript headers rather than sent automatically by the browser.
- **Production Recommendation for Enterprise Deployment**:
  - Transition to `HttpOnly`, `Secure`, `SameSite=Strict` cookies issued from a custom unified domain (e.g., `api.saferoute.org` and `app.saferoute.org`), coupled with CSRF Double Submit Cookie tokens.

---

### 2. Multi-User Isolation & Privilege Escalation Defenses

SafeRoute implements strict object-level authorization across all private endpoints:

1. **Trusted Contacts (`/api/contacts`)**:
   ```javascript
   // Contact ownership verification
   if (contact.user.toString() !== req.user._id.toString()) {
     return res.status(403).json({
       success: false,
       message: 'Forbidden: You do not have permission to access this contact',
     });
   }
   ```
2. **Emergency Events (`/api/sos`)**:
   ```javascript
   // Emergency incident ownership verification
   if (event.user.toString() !== req.user._id.toString()) {
     return res.status(403).json({
       success: false,
       message: 'Forbidden: You do not have permission to view this emergency event',
     });
   }
   ```
3. **Profile Modification (`/api/auth/profile`)**:
   - Only updates `name` and `phone`.
   - Modifying `email`, `role`, or `password` via this endpoint is completely ignored, ensuring accounts cannot be hijacked or elevated to administrator roles.

---

### 3. Rate Limiting Specifications

| Route | Window | Max Hits | Failure Response |
|---|---|---|---|
| `/api/*` (General API) | 15 minutes | 200 | HTTP 429 Too Many Requests |
| `/api/auth/login` | 15 minutes | 15 | HTTP 429 (Brute-Force Throttle) |
| `/api/auth/register` | 15 minutes | 15 | HTTP 429 (Account Creation Flood) |
| `/api/sos` (POST) | 1 minute | 15 | HTTP 429 (Emergency Alert Throttle) |

---

### 4. Database Security & Injection Prevention

- **Mongoose Schema Typing**: All queries use typed Mongoose schemas, preventing type-juggling NoSQL injection payloads (e.g. `{ "email": { "$gt": "" } }`).
- **CastError Mapping**: Unformatted ObjectIds (e.g. `invalid-id`) are caught by centralized middleware and returned as `404 Not Found` rather than crashing the Node.js process.
- **URI Password Masking**: Connection loggers mask database credentials (`mongodb+srv://admin:****@cluster...`) to prevent credential leakage into server log streams.

