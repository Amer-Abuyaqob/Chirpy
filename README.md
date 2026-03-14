# Simple HTTP Server

An HTTP server built in TypeScript with Express.js. This project is part of the [Boot.dev "Learn HTTP Servers in TypeScript"](https://www.boot.dev/courses/learn-http-servers-typescript) course.

---

## Tech Stack

- **TypeScript** – Type-safe JavaScript
- **Node.js** – Runtime
- **Express.js** – Web framework
- **PostgreSQL** – Database
- **Drizzle ORM** – Type-safe database access and migrations

---

## Features

- **Static Fileserver** – Serves `index.html` and static assets from `./src/app` at `http://localhost:8080/app`
- **API Metrics** – Hit counter for `/app` requests; `GET /admin/metrics` returns HTML with visit count, `POST /admin/reset` resets the counter
- **Readiness Endpoint** – `GET /api/healthz` returns `OK` for health checks
- **Users API** – `POST /api/users` accepts JSON `{ "email": "<string>", "password": "<string>" }`, hashes password, creates user; returns 201 with id, email, `isChirpyRed`, timestamps (no password); invalid/missing email or password → 400, duplicate email → 409. `POST /api/login` accepts `{ "email", "password" }`, authenticates; returns 200 with user resource plus `token` (JWT, 1h expiry) and `refreshToken` (60-day expiry); 401 on failure. `POST /api/refresh` requires `Authorization: Bearer <refresh-token>`; returns 200 with new `token` (JWT); 401 if token invalid/expired/revoked. `POST /api/revoke` requires `Authorization: Bearer <refresh-token>`; revokes the token and returns 204
- **Chirps API** – `POST /api/chirps` requires `Authorization: Bearer <JWT>`, accepts JSON `{ "body": "<chirp text>" }` (no `userId`; user from JWT), validates body (max 140 chars, profanity cleaned), creates chirp; returns 201; missing/invalid JWT → 401, invalid body → 400, user not found → 404. `DELETE /api/chirps/:chirpId` requires `Authorization: Bearer <JWT>`, deletes chirp; only the author may delete; returns 204 on success; chirp not found → 404, not author → 403. `GET /api/chirps` and `GET /api/chirps/:chirpId` are public. `GET /api/chirps` accepts optional `?sort=asc|desc` (default asc) and `?authorId=<uuid>` to sort by `createdAt` and filter by author
- **Response Logging** – Middleware logs non-OK responses (4xx, 5xx) as `[NON-OK] <method> <url> - Status: <code>`
- **Error-Handling Middleware** – Catches thrown errors, maps custom errors (`BadRequestError`→400, `UserNotAuthenticatedError`→401, `UserForbiddenError`→403, `NotFoundError`→404, `ConflictError`→409) to correct status and `err.message`; unknown errors→500 with generic message; logs only 5xx to stderr
- **Servers** – Basic web server setup
- **Routing** – HTTP routing with Express
- **Architecture** – Structured server design
- **JSON** – Parsing and sending JSON data
- **Error Handling** – Error handling in TypeScript servers
- **Storage** – PostgreSQL with Drizzle ORM; auto-migrations run at startup; `refresh_tokens` table for token rotation
- **Authentication** – Password hashing (Argon2); login returns JWT + refresh token; `getBearerToken`, `getAPIKey`, `makeJWT`, `makeRefreshToken`, `validateJWT`; `POST /api/refresh` and `POST /api/revoke` for refresh token rotation; `JWT_SECRET` in env for signing/verifying; `POLKA_KEY` for Polka webhook API key verification
- **Authorization** – Chirp deletion restricted to author (403 when not author)
- **Webhooks** – `POST /api/polka/webhooks` receives Polka payment events; requires `Authorization: ApiKey <POLKA_KEY>`; processes `user.upgraded` to set Chirpy Red membership; 401 if API key missing/invalid
- **Documentation** – API documentation

---

## Getting Started

### Prerequisites

- Node.js (see [.nvmrc](.nvmrc) for recommended version)
- PostgreSQL (required; set `DB_URL` and `PORT` in `.env`)

### Install & run

```bash
# Clone the repo
git clone https://github.com/Amer-Abuyaqob/Chirpy.git
cd Chirpy

# Install dependencies
npm install

# Build
npm run build

# Run
npm start

# Dev (build + run)
npm run dev

# Run tests
npm run test

# DB migrations (CLI; app also runs migrations at startup)
npm run db.generate   # Generate migration from schema changes
npm run db.migrate    # Apply migrations via drizzle-kit
```

**Environment variables:** `DB_URL` (PostgreSQL connection string), `JWT_SECRET` (secret for signing/verifying JWTs; generate with `openssl rand -base64 64`), `POLKA_KEY` (API key for Polka webhook verification), `PORT` (HTTP port), and `PLATFORM` (e.g. `dev` for local; required for reset to run) are required. Set them in `.env` or your environment. **Do not commit `.env`** — it is gitignored.

The server runs migrations at startup, then listens on `PORT`, serves static files at `/app`, exposes readiness at `GET /api/healthz`, metrics at `GET /admin/metrics`, reset at `POST /admin/reset`, users at `POST /api/users`, login at `POST /api/login`, refresh at `POST /api/refresh`, revoke at `POST /api/revoke`, chirps at `GET /api/chirps`, `GET /api/chirps/:chirpId`, `POST /api/chirps`, and `DELETE /api/chirps/:chirpId`, and Polka webhooks at `POST /api/polka/webhooks`.

---

## Documentation

For full project description, architecture, and course outline, see **[PROJECT_DESC.md](PROJECT_DESC.md)**.

---

_Last updated: March 2025 — GET /api/chirps supports `sort` (asc|desc) and `authorId`; Chirpy Red; Polka webhooks; DELETE /api/chirps/:chirpId (author-only; 404/403/204)._
