# Simple HTTP Server

An HTTP server built in TypeScript with Express.js. This project is part of the [Boot.dev "Learn HTTP Servers in TypeScript"](https://www.boot.dev/courses/learn-http-servers-typescript) course.

---

## Tech Stack

- **TypeScript** – Type-safe JavaScript
- **Node.js** – Runtime
- **Express.js** – Web framework
- **PostgreSQL** – (Later chapters) Database
- **Drizzle ORM** – (Later chapters) Type-safe database access

---

## Features

- **Static Fileserver** – Serves `index.html` and static assets from project root at `http://localhost:8080`
- **Servers** – Basic web server setup
- **Routing** – HTTP routing with Express
- **Architecture** – Structured server design
- **JSON** – Parsing and sending JSON data
- **Error Handling** – Error handling in TypeScript servers
- **Storage** – (Later) PostgreSQL and migrations
- **Authentication** – (Later) JWT-based auth
- **Authorization** – (Later) Access control
- **Webhooks** – (Later) HTTP webhooks
- **Documentation** – API documentation

---

## Getting Started

### Prerequisites

- Node.js (see [.nvmrc](.nvmrc) for recommended version)
- PostgreSQL (for later chapters)

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
```

The server runs on port 8080 by default and serves `index.html` at `/`.

---

## Documentation

For full project description, architecture, and course outline, see **[PROJECT_DESC.md](PROJECT_DESC.md)**.
