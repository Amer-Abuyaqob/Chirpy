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
- **Users API** – `POST /api/users` accepts JSON `{ "email": "<string>", "password": "<string>" }`, hashes password, creates user; returns 201 with id, email, timestamps (no password); invalid/missing email or password → 400, duplicate email → 409. `POST /api/login` accepts `{ "email", "password" }`, authenticates; returns 200 with user resource on success; 401 with "incorrect email or password" on failure
- **Chirps API** – `POST /api/chirps` accepts JSON `{ "body": "<chirp text>", "userId": "<user uuid>" }`, validates body (max 140 chars, profanity cleaned), ensures user exists, creates chirp; returns 201 with created chirp; invalid body/userId → 400, user not found → 404. `GET /api/chirps` returns all chirps (200, ascending by createdAt). `GET /api/chirps/:chirpId` returns a single chirp by ID (200); invalid/missing ID → 400, not found → 404
- **Response Logging** – Middleware logs non-OK responses (4xx, 5xx) as `[NON-OK] <method> <url> - Status: <code>`
- **Error-Handling Middleware** – Catches thrown errors, maps custom errors (`BadRequestError`→400, `UserNotAuthenticatedError`→401, `UserForbiddenError`→403, `NotFoundError`→404, `ConflictError`→409) to correct status and `err.message`; unknown errors→500 with generic message; logs only 5xx to stderr
- **Servers** – Basic web server setup
- **Routing** – HTTP routing with Express
- **Architecture** – Structured server design
- **JSON** – Parsing and sending JSON data
- **Error Handling** – Error handling in TypeScript servers
- **Storage** – PostgreSQL with Drizzle ORM; auto-migrations run at startup
- **Authentication** – Password hashing (Argon2), login (`POST /api/login`); JWT tokens (Later)
- **Authorization** – (Later) Access control
- **Webhooks** – (Later) HTTP webhooks
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

# DB migrations (CLI; app also runs migrations at startup)
npm run db.generate   # Generate migration from schema changes
npm run db.migrate    # Apply migrations via drizzle-kit
```

**Environment variables:** `DB_URL` (PostgreSQL connection string), `PORT` (HTTP port), and `PLATFORM` (e.g. `dev` for local; required for reset to run) are required. Set them in `.env` or your environment.

The server runs migrations at startup, then listens on `PORT`, serves static files at `/app`, exposes readiness at `GET /api/healthz`, metrics at `GET /admin/metrics`, reset at `POST /admin/reset`, users at `POST /api/users`, login at `POST /api/login`, and chirps at `GET /api/chirps`, `GET /api/chirps/:chirpId`, and `POST /api/chirps`.

---

## Documentation

For full project description, architecture, and course outline, see **[PROJECT_DESC.md](PROJECT_DESC.md)**.
