# CSA Attendance

A full-stack attendance management system for the Civil Service Agency (CSA).

This repository contains a Next.js TypeScript client and a Node/Express-style server using Sequelize + PostgreSQL. The app provides authentication, attendance CRUD, reporting, and CSV export functionality.

## Table of contents

- Project overview
- Tech stack
- Features
- Repository structure
- Getting started (dev)
- Environment variables
- Build & deploy
- Developer notes & troubleshooting
- Next steps / recommendations

## Project overview

The project is split into two main parts:

- `client/` — Next.js (App Router) front-end written in TypeScript. It uses Redux Toolkit + RTK Query for API communication, TailwindCSS for styling, and react-hot-toast for notifications. The Next app contains small proxy routes that forward requests to the backend API.
- `server/` — Node backend using Sequelize ORM connected to PostgreSQL. It exposes endpoints for authentication, employees, attendance CRUD, reports, and CSV export. Routes are protected by JWT-based auth middleware.

Core flows:

- User authentication (login/logout) via JWT stored in the client (localStorage). RTK Query injects Authorization headers for protected requests.
- Dashboard for adding attendance records, viewing reports, and managing employees.
- CSV export endpoint that streams/downloads report data.

## Tech stack

- Frontend: Next.js (App Router), React, TypeScript, Redux Toolkit + RTK Query, TailwindCSS, react-hot-toast, framer-motion.
- Backend: Node.js, Express-like controllers, Sequelize ORM, PostgreSQL, JWT authentication.
- Dev tooling: pnpm/npm, ESLint/Prettier (if configured in your environment).

## Features

- Authentication with JWT
- Attendance CRUD (add, view, delete)
- Attendance report with pagination and CSV export
- Employees listing and search
- Dashboard with tabbed navigation and Toaster notifications

## Repository structure

Top-level folders and important files:

- `client/` — Next.js front-end

  - `src/app/` — app routes, layouts, pages, client proxy routes under `api/` for forwarding to backend
  - `src/components/` — React components used in the dashboard and UI
  - `src/components/ui/button.tsx` — shared Button component (brand color is `#DC3C22`)
  - `store/` — Redux store and API slices (RTK Query)

- `server/` — backend API

  - `controllers/` — route handlers (attendance, auth, employees, stats)
  - `routes/` — express-style route definitions
  - `models/` — Sequelize models
  - `config/` — DB / environment config

- `README.md` — this file

## Getting started (development)

Prerequisites

- Node.js (16+ recommended)
- PostgreSQL (or a compatible database)
- pnpm/npm/yarn (choose your package manager)

Environment variables (examples)

Create a `.env` (or set environment variables in your environment) for both server and client. Typical variables:

- Server (`server/.env`)

  - `DATABASE_URL` — Postgres connection string
  - `JWT_SECRET` — secret used to sign JWT tokens
  - `PORT` — server port (optional)

- Client (`client/.env.local`)
  - `NEXT_PUBLIC_API_URL` — URL of the backend API (e.g. `http://localhost:5000`)

Start server

```bash
cd server
npm install
# run the server; script name may vary (check server/package.json)
npm run dev
```

Start client

```bash
cd client
npm install
# start Next dev server
npm run dev
```

Open your browser at `http://localhost:3000` (default Next dev port) and the server at the configured server port (commonly `http://localhost:5000`).

Notes about auth & proxy

- The client uses small Next App Route proxy endpoints (e.g. `client/src/app/api/attendance/report/route.ts` and `client/src/app/api/attendance/export/route.ts`) to forward requests to the real backend at `NEXT_PUBLIC_API_URL`. These proxies forward cookies and Authorization headers — ensure the env var is correct.
- Tokens are stored client-side in `localStorage` and RTK Query `prepareHeaders` reads the token and injects the `Authorization: Bearer <token>` header for API requests.

## Build & deploy

Build the client and server according to your deploy target. Typical flow for client (Next):

```bash
cd client
npm run build
npm run start
```

For the server, build/packaging depends on your deployment platform. Ensure environment variables are set and the database is accessible.

## Developer notes & troubleshooting

- If you see 401 Unauthorized when the client hits the proxied endpoints, verify:
  - `NEXT_PUBLIC_API_URL` is correct and the backend is reachable
  - The client has a valid token in localStorage (key used by the app)
  - Proxy route is forwarding Authorization and cookies (check `client/src/app/api/*/route.ts` files)
- If CSV export returns HTML (Next 404), confirm the client proxy route exists at `/api/attendance/export` and backend has `/attendance/export`.
- React Hooks order warnings: avoid returning early from client components before hooks are defined — review `RootLayoutClient.tsx` if you encounter such warnings.

## Recommended next steps

- Move brand color `#DC3C22` into `tailwind.config.js` and replace inline styles with Tailwind classes for consistent theming.
- Add server-side streaming (DB cursor) for very large CSV exports if you expect huge reports.
- Add unit/integration tests for auth and CSV export flows.

## Contributing

Contributions are welcome. Fork, create a branch, and open a PR with your changes. Please include tests for non-trivial logic.

## License

This repository currently does not include a license file. Add a LICENSE.md if you want to specify licensing.

---

If you want, I can also add a short quick-start script, move the brand color into Tailwind, or generate a `.env.example` file next — tell me which you'd like prioritized.
