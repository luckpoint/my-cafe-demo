# Auth0 Authentication Integration Design Document

## Overview

This document describes the Auth0 integration for the My Cafe Demo application using `express-openid-connect` on an Express.js backend. Authentication is handled server-side with session cookies.

## Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Browser                                    │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐   │
│  │   main.js    │───>│   auth.js    │───>│  fetch('/api/user')  │   │
│  └──────────────┘    └──────────────┘    └──────────────────────┘   │
│         │                   │                       │               │
│         v                   v                       v               │
│  ┌──────────────┐    ┌──────────────┐         ┌─────────┐          │
│  │  Header.js   │<───│ Cached State │         │ Express │          │
│  └──────────────┘    └──────────────┘         │ Server  │          │
│                                               └─────────┘          │
└─────────────────────────────────────────────────────────────────────┘
                                                     │
                                                     v
                                            ┌───────────────┐
                                            │  Auth0 Tenant │
                                            │  (OpenID)     │
                                            └───────────────┘
```

### Request Flow

```
Development Mode:
┌────────────┐  /api/*, /login, /logout  ┌────────────────┐
│   Vite     │ ─────────────────────────>│    Express     │
│   :5173    │         proxy             │    :3000       │
└────────────┘                           └────────────────┘

Production Mode:
┌────────────────────────────────────────────────────────┐
│                    Express :3000                        │
│  - Serves static files (built Vite output)             │
│  - Handles /login, /logout, /callback                  │
│  - Provides /api/user endpoint                         │
└────────────────────────────────────────────────────────┘
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH0_ISSUER_BASE_URL` | Yes | Auth0 tenant URL (e.g., `https://dev-xxxxx.us.auth0.com`) |
| `AUTH0_CLIENT_ID` | Yes | Auth0 Application Client ID |
| `AUTH0_SECRET` | Yes | Random string for session encryption (min 32 chars) |
| `AUTH0_BASE_URL` | Yes | Application base URL (e.g., `http://localhost:3000`) |
| `PORT` | No | Server port (default: 3000) |

### Auth0 Dashboard Settings

| Setting | Value |
|---------|-------|
| Application Type | Regular Web Application |
| Allowed Callback URLs | `http://localhost:3000/callback`, `https://your-domain.com/callback` |
| Allowed Logout URLs | `http://localhost:3000`, `https://your-domain.com` |
| Allowed Web Origins | `http://localhost:3000`, `https://your-domain.com` |

## Server Implementation

### Express Server (`server/server.js`)

```javascript
const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const path = require('path');
require('dotenv').config();

const app = express();

// Auth0 OpenID Connect middleware
app.use(auth({
    authRequired: false,
    auth0Logout: true,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    baseURL: process.env.AUTH0_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    secret: process.env.AUTH0_SECRET
}));

// API endpoint: Get current user
app.get('/api/user', (req, res) => {
    if (req.oidc.isAuthenticated()) {
        res.json({
            isAuthenticated: true,
            user: {
                name: req.oidc.user.name,
                email: req.oidc.user.email,
                picture: req.oidc.user.picture
            }
        });
    } else {
        res.json({ isAuthenticated: false, user: null });
    }
});

// Serve static files
app.use(express.static(path.join(__dirname, '../')));

// SPA fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### Built-in Routes (provided by express-openid-connect)

| Route | Description |
|-------|-------------|
| `/login` | Initiates OpenID Connect login flow, redirects to Auth0 |
| `/logout` | Clears session, redirects to Auth0 logout |
| `/callback` | Handles Auth0 redirect after authentication |

## Frontend API Reference

### auth.init()

Fetch authentication state from server. Must be called before rendering UI.

```javascript
await auth.init();
```

**Behavior:**
- Calls `GET /api/user` to get current auth state
- Caches user and authentication status for synchronous access

---

### auth.login()

Redirect to login page.

```javascript
auth.login();
```

**Behavior:**
- Redirects browser to `/login`
- Express middleware redirects to Auth0 Universal Login

---

### auth.logout()

Redirect to logout.

```javascript
auth.logout();
```

**Behavior:**
- Redirects browser to `/logout`
- Express clears session and redirects to Auth0 logout

---

### auth.isAuthenticated()

Check if user is authenticated (synchronous, uses cached state).

```javascript
const isLoggedIn = auth.isAuthenticated();
```

**Returns:** `boolean`

---

### auth.getUser()

Get current user (synchronous, uses cached state).

```javascript
const user = auth.getUser();
```

**Returns:** User object or `null`

```javascript
{
    name: string,      // Display name
    email: string,     // Email address
    picture: string    // Avatar URL
}
```

## Authentication Flow

### Login Flow

```
User                    Browser                 Express                 Auth0
 │                         │                       │                      │
 │  Click "Sign in"        │                       │                      │
 │────────────────────────>│                       │                      │
 │                         │  GET /login           │                      │
 │                         │──────────────────────>│                      │
 │                         │                       │  Redirect to Auth0   │
 │                         │                       │─────────────────────>│
 │                         │                       │                      │
 │<─────────────────────────────────────────────────────────────────────│
 │                    Auth0 Universal Login page                        │
 │                         │                       │                      │
 │  Enter credentials      │                       │                      │
 │─────────────────────────────────────────────────────────────────────>│
 │                         │                       │                      │
 │<─────────────────────────────────────────────────────────────────────│
 │            Redirect to /callback with code                           │
 │                         │                       │                      │
 │                         │  GET /callback        │                      │
 │                         │──────────────────────>│                      │
 │                         │                       │  Exchange code       │
 │                         │                       │─────────────────────>│
 │                         │                       │<─────────────────────│
 │                         │                       │  Tokens received     │
 │                         │                       │                      │
 │                         │  Set session cookie   │                      │
 │                         │<──────────────────────│                      │
 │                         │  Redirect to /        │                      │
 │                         │                       │                      │
 │<────────────────────────│                       │                      │
 │     Home page with      │                       │                      │
 │     session cookie      │                       │                      │
```

### Logout Flow

```
User                    Browser                 Express                 Auth0
 │                         │                       │                      │
 │  Click "Sign out"       │                       │                      │
 │────────────────────────>│                       │                      │
 │                         │  GET /logout          │                      │
 │                         │──────────────────────>│                      │
 │                         │                       │                      │
 │                         │  Clear session        │                      │
 │                         │                       │  Redirect to logout  │
 │                         │                       │─────────────────────>│
 │                         │                       │                      │
 │<─────────────────────────────────────────────────────────────────────│
 │                    Redirect to baseURL                               │
 │                         │                       │                      │
 │     Home page (logged out)                      │                      │
```

## Files Modified

| File | Changes |
|------|---------|
| `server/server.js` | New - Express server with express-openid-connect |
| `package.json` | Add express, express-openid-connect, dotenv |
| `.env.example` | New - Environment variable template |
| `vite.config.js` | Add proxy configuration for dev |
| `src/utils/auth.js` | Rewrite - Fetch user from server API |
| `src/components/Header.js` | Update for async auth init |
| `src/main.js` | Add async auth initialization |

## Development Workflow

```bash
# Terminal 1: Start Express server
npm run server

# Terminal 2: Start Vite dev server
npm run dev

# Or with concurrently
npm run dev:full
```

## Testing Checklist

**Authentication Flow:**
- [ ] Click "Sign in" redirects to Auth0
- [ ] Complete Auth0 login returns to app
- [ ] User info displayed in header
- [ ] Refresh page maintains login state
- [ ] Click "Sign out" clears session
- [ ] Refresh after logout shows logged-out state

**API Endpoint:**
- [ ] `/api/user` returns `isAuthenticated: false` when logged out
- [ ] `/api/user` returns user object when logged in

## Security Considerations

1. **Session Cookie**: express-openid-connect uses encrypted, signed cookies
2. **CSRF Protection**: Built into the OpenID Connect flow via state parameter
3. **Secret Key**: `AUTH0_SECRET` must be at least 32 characters, kept secret
4. **HTTPS**: Use HTTPS in production for secure cookie transmission
5. **Environment Variables**: Never commit `.env` file, use `.env.example` as template

## References

- [express-openid-connect GitHub](https://github.com/auth0/express-openid-connect)
- [Auth0 Express Quickstart](https://auth0.com/docs/quickstart/webapp/express)
- [OpenID Connect Specification](https://openid.net/connect/)
