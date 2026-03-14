# Chirpy — Project Description

A TypeScript HTTP server that implements a Twitter-like microblogging API ("Chirpy"). Built for the [Boot.dev "Learn HTTP Servers in TypeScript"](https://www.boot.dev/courses/learn-http-servers-typescript) course.

---

## Project Overview

Chirpy exposes RESTful JSON APIs for:

- **Users** – Register, login, update profile; password hashing with Argon2
- **Chirps** – Short messages (140 chars); create (auth required), list, get, delete (author-only)
- **Auth** – JWT access tokens (1h) + refresh tokens (60 days); refresh and revoke endpoints
- **Chirpy Red** – Membership flag; upgraded via Polka payment webhooks
- **Static app** – Served at `/app`; metrics and reset for development

---

## Tech Stack

| Layer     | Tech       | Purpose                      |
| --------- | ---------- | ---------------------------- |
| Runtime   | Node.js    | Server runtime               |
| Language  | TypeScript | Type safety                  |
| Framework | Express.js | HTTP routing and middleware  |
| Database  | PostgreSQL | Persistent storage           |
| ORM       | Drizzle    | Migrations, queries, schema  |
| Auth      | JWT        | Access tokens; refresh in DB |
| Passwords | Argon2     | Secure password hashing      |

---

## Course Chapters (10)

1. **Servers** – Web server basics, why TypeScript fits
2. **Routing** – HTTP routing, Express routing
3. **Architecture** – Web architectures and how to pick one
4. **JSON** – Parsing and sending JSON
5. **Error Handling** – Handling errors in a TypeScript server
6. **Storage** – PostgreSQL, migrations, data storage
7. **Authentication** – JWT-based auth
8. **Authorization** – Implementing authorization
9. **Webhooks** – HTTP webhooks in apps
10. **Documentation** – API docs and tooling

---

## Workspace File Map

| Path                   | Purpose                                                 |
| ---------------------- | ------------------------------------------------------- |
| `src/`                 | Application source                                      |
| `src/index.ts`         | Entry point; migrations, app setup                      |
| `src/config.ts`        | Env vars (DB_URL, JWT_SECRET, PORT, etc)                |
| `src/auth.ts`          | JWT, refresh tokens, Argon2, Bearer/API key helpers     |
| `src/api/`             | Route handlers, middleware, errors                      |
| `src/db/`              | Drizzle schema, queries (users, chirps, refresh_tokens) |
| `src/app/`             | Static files (index.html) served at `/app`              |
| `drizzle/`             | Migration files                                         |
| `docs/`                | Project documentation                                   |
| `docs/PROJECT_DESC.md` | Project overview                                        |
| `docs/API.md`          | API reference (request/response schemas)                |
| `package.json`         | Dependencies, scripts                                   |
| `.nvmrc`               | Node version (21.7.0)                                   |
| `README.md`            | Setup and quick start                                   |

---

## API Endpoints Summary

| Method | Path                  | Auth             | Description                       |
| ------ | --------------------- | ---------------- | --------------------------------- |
| GET    | `/app`                | —                | Static app; metrics inc           |
| GET    | `/api/healthz`        | —                | Readiness check                   |
| GET    | `/admin/metrics`      | —                | Visit count (HTML)                |
| POST   | `/admin/reset`        | PLATFORM=dev     | Reset DB and metrics              |
| POST   | `/api/users`          | —                | Register user                     |
| PUT    | `/api/users`          | Bearer JWT       | Update profile                    |
| POST   | `/api/login`          | —                | Login; returns JWT + refresh      |
| POST   | `/api/refresh`        | Bearer refresh   | New access token                  |
| POST   | `/api/revoke`         | Bearer refresh   | Revoke refresh token              |
| GET    | `/api/chirps`         | —                | List chirps; ?sort, ?authorId     |
| GET    | `/api/chirps/:id`     | —                | Get single chirp                  |
| POST   | `/api/chirps`         | Bearer JWT       | Create chirp                      |
| DELETE | `/api/chirps/:id`     | Bearer JWT       | Delete own chirp (author-only)    |
| POST   | `/api/polka/webhooks` | ApiKey POLKA_KEY | Polka payment events (Chirpy Red) |

---

## Environment Variables

| Variable     | Purpose                                                 |
| ------------ | ------------------------------------------------------- |
| `DB_URL`     | PostgreSQL connection string                            |
| `JWT_SECRET` | Signing/verifying JWTs (e.g. `openssl rand -base64 64`) |
| `POLKA_KEY`  | API key for Polka webhook verification                  |
| `PORT`       | HTTP server port                                        |
| `PLATFORM`   | `dev` for local; required for reset endpoint            |

---

_Last updated: March 2025_
