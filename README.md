# Baseball Alliance Platform

> **An invite-only platform for elite youth baseball organizations.**  
> Provides events (tournaments, showcases, combines), player/coach/parent accounts, media, and team management — built with **React, Express, Prisma, and PostgreSQL**.

---

## Features

- **Authentication & Roles**  
  Secure login with JWT. Role-based access control (`ADMIN`, `COACH`, `PLAYER`, `PARENT`, `FAN`, `SCOUT`, `MEMBER`).

- **BAMS (Playbook → site members)**  
  Members sign up and pay on Playbook; admins export CSV and import at `/admin/users`. Imported users get the `MEMBER` role and sign in at `/bams` via email magic link (no password).

- **BAMS event matching**  
  Authenticated members upload a Baseball Alliance event export CSV at `/bams`. The BA API parses and stores rows, maps each athlete to `MatchRequestV1`, and proxies `POST` to the external BAMS service (`BAMS_API_URL`). Explore Programs tab is unchanged.

- **Events System**  
  - Create, update, and publish/unpublish events (`TOURNAMENT`, `SHOWCASE`, `COMBINE`).  
  - Registration flows for individuals and teams.  
  - Countdown display for upcoming events.

- **User Profiles**  
  - Players: recruiting details, team info, measurables.  
  - Parents: linked children accounts.  
  - Coaches, Scouts, Admins, Fans.  

- **Team Management**  
  Teams, rosters, staff, alumni.

- **Media Hub**  
  Videos, highlights, podcasts

- **CMS / Site Config**  
  Featured events, membership tiers, CTAs, and org pages.

---

## 🛠 Tech Stack

**Frontend**
- [React + Vite](https://vitejs.dev/)  
- [TailwindCSS](https://tailwindcss.com/)  
- [React Router](https://reactrouter.com/)  

**Backend**
- [Express](https://expressjs.com/)  
- [Prisma ORM](https://www.prisma.io/) with PostgreSQL  
- [Zod](https://zod.dev/) for input validation  
- JWT-based authentication & role middleware  

**Database**
- PostgreSQL with Prisma migrations

---

## Project Structure

baseball-alliance/
├── frontend/
│ └── web/ # React frontend
│
├── backend/src (Express + Prisma)
│ ├── routes/ # API routes (auth, events, users, etc.)
│ ├── middleware/ # Auth & role guards
│ ├── db.ts # Prisma client
│ └── types.ts # Shared zod schemas & TS types
│
├── prisma/
│ ├── schema.prisma # Data models (users, roles, events, etc.)
│ └── migrations/ # Auto-generated migrations
│
├── package.json
├── README.md
└── ...

---

## Setup & Installation

### Prerequisites
- Node.js 18+  
- PostgreSQL 14+  
- npm 

### 1. Clone & Install
```bash
git clone https://github.com/<your-org>/baseball-alliance.git
cd baseball-alliance
npm install
2. Environment Variables
Create a .env file in the project root:

env - Example
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/baseball_alliance"
# Auth
JWT_SECRET="your-secret-key"
# API
PORT=4000
# Frontend
VITE_API_URL="http://localhost:4000/api"

4. Run Backend
npm run dev
Backend runs at: http://localhost:4000

5. Run Frontend
npm run dev
Frontend runs at: http://localhost:5173

Development Notes
Prisma Studio:
npx prisma studio
Role-based UI — use useAuth() hook in React to check user.roles.

Create feature branch:
git checkout -b feature/my-feature
Commit changes:

git commit -m "Add my feature"
Push branch:

git push origin feature/my-feature
Open Pull Request
