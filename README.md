# Reviewdibo — Full-Stack Product Review Platform

Browse products, read reviews, and post your own. A responsive review platform with star ratings, search, and rating filters.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| **Built-in Backend** | Next.js API Routes, Drizzle ORM, PostgreSQL |
| **Standalone Backend** | FastAPI, async SQLAlchemy, Alembic, PostgreSQL |

The repository contains two complete backend implementations:
1. **Next.js + Drizzle** at the repo root — a self-contained fullstack app with built-in API routes.
2. **FastAPI + SQLAlchemy** in [`/backend`](./backend) — a fully separate Python API with Alembic migrations, Pydantic schemas, and Swagger docs.

```
.
├── backend/        # FastAPI + SQLAlchemy + Alembic
├── frontend/       # Frontend documentation
├── src/            # Next.js app (pages, components, API routes)
│   ├── app/        #   Pages and /api/* route handlers
│   ├── components/ #   ProductCard, StarRating, ReviewForm, ReviewList
│   ├── lib/api.ts  #   Typed fetch client
│   └── db/         #   Drizzle schema + client
└── README.md
```

## Features

- Responsive product grid with star ratings, average rating, and review counts.
- Client-side search bar and minimum-rating filter (All / 4+ / 3+).
- Product detail page with full review list and submission form.
- Loading skeletons, error states, and validation throughout.
- TypeScript strict mode, Tailwind-only styling.

## Quick Start (Next.js — Recommended)

Requirements: Node.js 18+, PostgreSQL.

```bash
npm install
cp .env.example .env          # edit DATABASE_URL
npx drizzle-kit push          # create tables
npm run dev
```

Open `http://localhost:3000`. Load sample data:

```bash
curl -X POST http://localhost:3000/api/seed
```

## Running with FastAPI Backend

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env           # set DATABASE_URL
alembic upgrade head
python seed.py
uvicorn app.main:app --reload --port 8000
```

Swagger docs at `http://localhost:8000/docs`.

### Frontend

```bash
# from repo root, in another terminal
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

## Running Both Together

```bash
npm run dev:all
```

This starts Next.js on port 3000 and FastAPI on port 8000 concurrently.

## Demo Access

| Role | Email | Password |
|---|---|---|
| Admin | admin@reviewdibo.com | admin123 |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/products` | List products with `averageRating` & `reviewCount` |
| GET | `/api/products/{id}` | Product detail with reviews |
| POST | `/api/products` | Create product |
| POST | `/api/reviews` | Create review |
| PUT | `/api/reviews/{id}` | Update review |
| DELETE | `/api/reviews/{id}` | Delete review |
| POST | `/api/users` | Create or reuse user by email |
| POST | `/api/auth/register` | Register new account |
| POST | `/api/auth/login` | Login (returns JWT via cookie) |
| POST | `/api/auth/logout` | Clear auth cookie |
| GET | `/api/auth/me` | Get current user |

## Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | Both | PostgreSQL connection string |
| `NEXT_PUBLIC_API_URL` | Frontend | Backend base URL (empty = built-in routes) |
| `JWT_SECRET` | Both | Secret for signing auth tokens |
