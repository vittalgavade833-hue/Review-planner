# KnowledgeTrack

> **“Keep Internal Knowledge Accurate, Current, and Review-Ready.”**

KnowledgeTrack is an enterprise-grade full-stack MERN web application built to solve documentation rot. In fast-evolving organizations, internal operating procedures, security guidelines, and runbooks quickly become outdated as products and processes change. KnowledgeTrack establishes explicit article ownership, tracks review cadences, and automatically computes real-time review statuses with visual countdowns and alerts.

---

## 📌 Problem Statement & Solution

* **The Problem:** Internal instructions can become outdated as products and processes change, exposing teams to compliance violations, operational downtime, and security incidents.
* **The Solution:** A unified knowledge register with designated owners, recorded last-reviewed dates, configurable review intervals, and an automated recalculation engine that categorizes articles as **Current**, **Due Soon**, or **Overdue**.

---

## 🌟 Key Features

1. **Automatic Review Status Engine (Core Differentiator)**
   * **Formula:** $\text{Next Review Date} = \text{Last Reviewed Date} + \text{Review Interval}$
   * **Dynamic Thresholds:**
     * 🟢 **CURRENT:** More than 30 days remaining ($> 30\text{d}$)
     * 🟡 **DUE SOON:** 30 days or fewer remaining ($\le 30\text{d}$ and $\ge 0\text{d}$)
     * 🔴 **OVERDUE:** Review deadline has elapsed ($< 0\text{d}$)
   * Dynamic countdown badges (e.g., *"12 days remaining"* or *"Overdue by 8 days"*).

2. **One-Click "Mark as Reviewed"**
   * Sets **Last Reviewed Date** = Today.
   * Dynamically projects the new **Next Review Date**.
   * Transitions status to **CURRENT**.
   * Appends an entry to the article's immutable audit history and logs an event.
   * Emits a real-time notification:
     > *"Article reviewed successfully. Next review is due on [formatted date]."*

3. **Knowledge Overview Dashboard**
   * Live metric cards: **Total Articles**, **Current**, **Due Soon**, **Overdue**.
   * **Knowledge Health Score:** Dynamically calculated percentage ($\frac{\text{Current}}{\text{Total}} \times 100$) showing documentation readiness.
   * **Recharts Visualizations:** Status distribution donut chart and articles-by-category bar chart.
   * **Urgent Attention Queue:** Quick-action cards for overdue articles prioritized by days overdue.
   * **Recent Activity Feed:** Real-time stream of audits, creations, and owner reassignments.

4. **Article Register & Smart Search/Filtering**
   * Professional enterprise data table and responsive grid view toggle.
   * Multi-field search across title, description, content, tags, category, and owner.
   * Granular filters by Status, Category, Owner, and Sort criteria.

5. **Review Calendar & Timeline**
   * Monthly cadence projection with scheduled review dates.
   * Prominent Overdue Backlog warning banner for immediate remediation.

6. **In-App Notifications & Alerts**
   * Proactive alerts for overdue items (⚠️), upcoming deadlines (🔔), and verified reviews (✅).
   * Mark individual or all notifications as read.

7. **Role-Based Access Control (RBAC)**
   * **Admin:** Full CRUD, user provisioning, role adjustments, account toggle, and article deletions.
   * **Knowledge Owner:** Create articles, edit/review assigned articles, and manage domain content.
   * **Viewer:** Read-only access with search and filter capabilities.

---

## 🏗️ Technology Stack

| Tier | Technologies |
| :--- | :--- |
| **Frontend** | React 19, React Router v7, Tailwind CSS v4, Axios, Lucide React, Recharts |
| **Backend** | Node.js, Express.js, MongoDB / Mongoose ODM, JWT, bcryptjs, Morgan |
| **Embedded DB** | Zero-friction embedded `mongodb-memory-server` fallback + Atlas URI support |

---

## 📁 Project Structure

```text
├── client/
│   ├── src/
│   │   ├── components/      # StatusBadge, StatCard, Sidebar, Navbar, Modals
│   │   ├── pages/           # Landing, Login, Register, Dashboard, Articles, etc.
│   │   ├── layouts/         # AppLayout, AuthLayout
│   │   ├── services/        # api.js, authService, articleService, etc.
│   │   ├── hooks/           # useAuth context and permission hooks
│   │   └── utils/           # dateUtils, constants
│   ├── vite.config.js       # Vite + Tailwind v4 + Proxy configuration
│   └── package.json
│
├── server/
│   ├── config/              # db.js (Atlas + MongoMemoryServer auto-fallback)
│   ├── controllers/         # auth, article, dashboard, user, notification
│   ├── middleware/          # auth, role, validation, error handling
│   ├── models/              # User, Article, Activity, Notification
│   ├── routes/              # Express REST API routes
│   ├── utils/               # reviewCalculator, reviewStatus
│   ├── seed.js              # 18 realistic demo articles & 6 demo accounts
│   ├── server.js            # Express app entrypoint with auto-seeding
│   └── package.json
└── README.md
```

---

## ⚡ Quick Start & Installation

### Prerequisites
* Node.js v18+ (tested on Node v20/v26)
* npm v9+

### 1. Server Setup

```bash
cd server
npm install

# (Optional) Create .env or use defaults
cp .env.example .env

# Run the server
npm run dev
# The backend auto-connects to MongoDB and automatically seeds demo data on port 5000!
```

### 2. Client Setup

```bash
cd client
npm install
npm run dev
# The frontend launches on http://localhost:5173/
```

---

## 🔑 Demo Login Credentials

The database auto-seeds with 6 realistic demo accounts representing all roles:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@knowledgetrack.io` | `Admin@123` | Full system control, user management, CRUD all articles |
| **Knowledge Owner** | `rahul.sharma@knowledgetrack.io` | `Owner@123` | HR articles owner; edit & review assigned articles |
| **Knowledge Owner** | `priya.sharma@knowledgetrack.io` | `Owner@123` | Finance & Compliance articles owner |
| **Knowledge Owner** | `amit.kumar@knowledgetrack.io` | `Owner@123` | Cybersecurity & Infrastructure owner |
| **Viewer** | `viewer@knowledgetrack.io` | `Viewer@123` | Read-only viewing and searching across all articles |

> **Tip:** You can also click the **"Quick Demo Logins"** buttons on the Login page or Landing page for instant 1-click authentication!

---

## 📡 REST API Reference

### Authentication
* `POST /api/auth/register` — Register a new account
* `POST /api/auth/login` — Sign in and receive JWT token
* `GET /api/auth/me` — Retrieve current authenticated user profile
* `PUT /api/auth/profile` — Update name, department, or password

### Knowledge Articles
* `GET /api/articles` — Search, filter by status/category/owner, and sort
* `GET /api/articles/:id` — Retrieve single article with review history
* `POST /api/articles` — Create new article (Admin & Knowledge Owner)
* `PUT /api/articles/:id` — Update article content, interval, or owner
* `DELETE /api/articles/:id` — Delete article (Admin only)
* `POST /api/articles/:id/review` — Mark article as reviewed (updates last review to today)
* `GET /api/articles/calendar` — Retrieve upcoming review dates

### Dashboard & Analytics
* `GET /api/dashboard/stats` — Live counts, status distribution, health score
* `GET /api/dashboard/recent-activity` — Audit events feed

### User Administration
* `GET /api/users` — List users with article counts
* `POST /api/users` — Provision new user (Admin only)
* `PUT /api/users/:id` — Modify role or toggle active/disabled (Admin only)
* `DELETE /api/users/:id` — Remove user (Admin only)

### In-App Notifications
* `GET /api/notifications` — Fetch user alerts and reminders
* `PUT /api/notifications/:id/read` — Mark notification as acknowledged
* `PUT /api/notifications/read-all` — Mark all notifications as read

---

## 🤖 Future AI Features (AI-Ready Architecture)

KnowledgeTrack's database schemas, REST endpoints, and UI were structured with clean extension points for subsequent AI capabilities without fake mock responses:

1. **Semantic Knowledge Search & Q&A:**
   * Vector embeddings generated via Gemini / OpenAI (`text-embedding-004`) stored in MongoDB Vector Search to allow users to ask natural questions like *"How do I authorize wire transfers over $50k?"*
2. **Automated Stale Content & Drift Detection:**
   * LLM review agents triggered on GitHub pull requests to flag operational instructions that reference deprecated CLI flags or changed endpoints.
3. **Adaptive Cadence Optimization:**
   * Machine learning analysis of article edit frequencies to recommend shorter review cycles for volatile microservice runbooks and longer cadences for fixed corporate charters.
4. **Duplicate & Conflicting Rule Identification:**
   * Cross-document semantic checks that alert compliance officers when two independent team articles provide contradictory guidelines.
5. **Auto-Generated Executive Summaries:**
   * One-click article summaries and actionable step-by-step checklists distilled from long policy texts.

---

## 🔒 Security Best Practices

* **Passwords:** Salted and hashed using `bcryptjs` with 10 rounds.
* **Authentication:** Signed stateless JSON Web Tokens (JWT) verified on protected endpoints.
* **Authorization:** Granular middleware validating role capabilities and document ownership before mutations.
* **Database Sanitization:** Mongoose schemas enforce types, required fields, and enum validity.
* **Environment Isolation:** Zero credentials hardcoded; fallback configuration cleanly managed via `.env`.

---

## 📄 License
MIT © 2026 KnowledgeTrack. Built for robust enterprise documentation governance.
