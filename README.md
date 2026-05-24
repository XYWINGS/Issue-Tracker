# Issue Tracker

A full-stack issue tracker built for the CRUD assignment. The app includes email/password authentication, JWT cookies, issue management, search and filters, pagination, status counts, owner-only mutations, and CSV/JSON export.

The frontend and backend are intentionally independent projects. Each folder has its own `package.json`, lockfile, dependencies, and local TypeScript types so it can be installed and deployed without relying on the repo root.

## Tech Stack

- Frontend: Next.js, React, TypeScript, Material UI, MUI X DataGrid, Redux Toolkit, RTK Query
- Backend: Express, TypeScript, MongoDB, Mongoose
- Auth: bcrypt password hashing with HTTP-only JWT cookies
- Package manager: pnpm

## Repository Layout

```text
frontend/  Next.js web app for Vercel
backend/   Express API for a Node host
```

## Prerequisites

- Node.js 22+
- Corepack enabled, or pnpm available on PATH
- MongoDB Atlas URI, or Docker for the included local MongoDB service

## Local Setup

Install dependencies separately:

```bash
cd frontend
corepack pnpm install

cd ../backend
corepack pnpm install
```

Create environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Start local MongoDB with Docker from the backend folder:

```bash
cd backend
docker compose up -d mongodb
```

Run the apps in separate terminals:

```bash
cd backend
corepack pnpm dev
```

```bash
cd frontend
corepack pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:4000
- Health check: http://localhost:4000/health

Use `dev` while editing code. The `start` scripts run production builds and do not hot-reload source changes.

To stop the local MongoDB container:

```bash
cd backend
docker compose down
```

## Environment Variables

Backend, in `backend/.env`:

```text
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/issue-tracker
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:3000
COOKIE_SECURE=false
```

Frontend, in `frontend/.env.local`:

```text
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

For deployment, set `MONGODB_URI` to MongoDB Atlas, use a strong `JWT_SECRET`, set `CLIENT_ORIGIN` to the deployed frontend URL, and set `COOKIE_SECURE=true` when the API is served over HTTPS.

## Scripts

Frontend:

```bash
cd frontend
corepack pnpm dev
corepack pnpm build
corepack pnpm lint
corepack pnpm typecheck
```

Backend:

```bash
cd backend
docker compose up -d mongodb
corepack pnpm dev
corepack pnpm build
corepack pnpm test
corepack pnpm typecheck
corepack pnpm start
```

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/issues`
- `POST /api/issues`
- `GET /api/issues/:id`
- `PATCH /api/issues/:id`
- `PATCH /api/issues/:id/status`
- `DELETE /api/issues/:id`
- `GET /api/issues/stats`
- `GET /api/issues/export?format=csv|json`

All issue routes require authentication. All authenticated users can view all issues; only the creator can edit, delete, resolve, or close an issue.

## Deployment Notes

- Deploy the frontend to Vercel with root directory set to `frontend`.
- Set `NEXT_PUBLIC_API_URL` in Vercel to the deployed backend API URL ending in `/api`.
- Deploy the backend to Vercel with root directory set to `backend`.
- The backend includes `backend/vercel.json` and `backend/api/index.js` so Express runs as a Vercel serverless function.
- Use MongoDB Atlas for production data.
- Configure backend environment variables in Vercel:
  - `MONGODB_URI`: MongoDB Atlas connection string
  - `JWT_SECRET`: long random secret
  - `CLIENT_ORIGIN`: deployed frontend URL, for example `https://your-frontend.vercel.app`
  - `COOKIE_SECURE`: `true`
- `CLIENT_ORIGIN` supports comma-separated exact origins and `*` wildcards. For Vercel preview URLs, use a value like:

```text
CLIENT_ORIGIN=https://issue-tracker-*-xywingss-projects.vercel.app
```

For the currently deployed frontend, this exact value also works:

```text
CLIENT_ORIGIN=https://issue-tracker-gvvvv4szd-xywingss-projects.vercel.app
```

- Use the backend deployment URL plus `/api` as the frontend `NEXT_PUBLIC_API_URL`.
- `backend/docker-compose.yml` is for local MongoDB only; production should use Atlas or the database service provided by your backend host.
