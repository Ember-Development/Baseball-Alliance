# Baseball Alliance API (backend)

## College match & programs (V1)

Endpoints:

- `GET /api/health` — API health JSON
- `GET /health` — process health (root router)
- `GET /api/programs` — paginated list (`page` ≥ 1 default 1, `limit` 1–100 default 20, optional `division`, `conference`, `state`, `schoolType`, `search`)
- `GET /api/programs/filters` — distinct `divisions`, `conferences`, `states`, `schoolTypes`
- `GET /api/programs/:id` — program detail or `404`
- `POST /api/match` — body `matchRequestV1Schema`; query `limit` (1–200, default 50), `offset` (≥ 0, default 0)

## Prerequisites

- Node 20+ (recommended)
- PostgreSQL

## Environment

Copy `.env.example` to `.env` and set at least:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — required for `/api/auth/*` (any non-empty string in dev)
- `PORT` — optional; defaults to **3000** (aligned with the Vite dev proxy in `baseball-alliance-frontend`)

## Database: migrate, seed, import

```bash
npm install
npx prisma migrate deploy   # or: npm run db:migrate (dev)
npx prisma generate
npm run db:seed
```

`CollegeProgram` rows for the match service are created in `prisma/seed.ts` (six sample schools). **CI or an empty database:** run migrations, then seed (or import programs your own way). Integration tests use prefixed rows `INT_TEST_*` and clean them up; one test temporarily clears **all** programs and restores from a full-table backup—run tests only against a dev database you are comfortable mutating.

## Run the API

```bash
npm run dev
```

Server listens on `http://localhost:${PORT}` (default `http://localhost:3000`).

## Run tests

Requires `DATABASE_URL` and applied migrations (`CollegeProgram` table present).

```bash
npm test
```

Vitest + supertest exercise programs pagination/filters/search, program detail 404/200, match validation (body + query), full/minimal match bodies, pagination on match results, and empty database behavior.

## Frontend dev harness

The React app includes a **dev-only style** route (not linked in marketing nav by default): open `/dev/api` with Vite dev server and API running. It submits the full match payload surface and drives all programs query parameters against the same contract.
