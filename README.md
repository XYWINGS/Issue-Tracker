# Issue Tracker

A full-stack issue tracker built for the CRUD assignment. The app includes email/password authentication, JWT cookies, issue management, search and filters, pagination, status counts, owner-only mutations, and CSV/JSON export.

## Tech Stack

- Frontend: Next.js, React, TypeScript, Material UI, MUI X DataGrid, Redux Toolkit, RTK Query
- Backend: Express, TypeScript, MongoDB, Mongoose
- Auth: bcrypt password hashing with HTTP-only JWT cookies
- Workspace: pnpm monorepo

## Repository Layout

```text
apps/
  api/       Express API
  web/       Next.js frontend
packages/
  shared/    Shared TypeScript issue/auth types and constants
```

## Prerequisites

- Node.js 22+
- Corepack enabled, or pnpm available on PATH
- MongoDB Atlas URI, or Docker for the included local MongoDB service

## Local Setup

```bash
corepack enable
corepack pnpm install
```

Create environment files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Start local MongoDB with Docker:

```bash
docker compose up -d mongodb
```

Run the apps:

```bash
corepack pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:4000
- Health check: http://localhost:4000/health

## Environment Variables

Backend, in `apps/api/.env`:

```text
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/issue-tracker
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:3000
COOKIE_SECURE=false
```

Frontend, in `apps/web/.env.local`:

```text
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

For deployment, set `MONGODB_URI` to MongoDB Atlas, use a strong `JWT_SECRET`, set `CLIENT_ORIGIN` to the deployed frontend URL, and set `COOKIE_SECURE=true` when the API is served over HTTPS.

## Scripts

```bash
corepack pnpm build
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
```

Target a single workspace:

```bash
corepack pnpm --filter @issue-tracker/api test
corepack pnpm --filter @issue-tracker/web build
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

- Deploy `apps/web` to Vercel and set `NEXT_PUBLIC_API_URL` to the production API URL.
- Deploy `apps/api` to Render, Railway, Fly.io, or a similar Node host.
- Use MongoDB Atlas for production data.
- Configure CORS with `CLIENT_ORIGIN`.
- Use HTTPS and `COOKIE_SECURE=true` for production cookies.
