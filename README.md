# Reviewdibo — Full-Stack Product Review Platform

Browse products, read reviews, and post your own. A responsive review platform with star ratings, search, rating filters, JWT authentication, and an admin panel.

## Live Demo

- **Frontend:** https://reviewdibo.vercel.app
- **Backend API:** https://reviewdibo.onrender.com
- **API Docs (Swagger):** https://reviewdibo.onrender.com/docs

> Note: the backend runs on Render's free tier, so the first request after a period of inactivity may take 20–30 seconds to wake up.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| **Backend** | FastAPI, async SQLAlchemy, Alembic, PostgreSQL |
| **Auth** | JWT (python-jose), bcrypt password hashing (passlib) |

The repository contains two backend implementations:
1. **FastAPI + SQLAlchemy** in [`/backend`](./backend) — the primary backend used in production, with Alembic migrations, Pydantic schemas, JWT auth, and Swagger docs.
2. **Next.js + Drizzle** at the repo root — a self-contained alternative using built-in Next.js API routes against the same database, included for flexibility.

```
.
├── backend/        # FastAPI + SQLAlchemy + Alembic (primary backend)
├── src/            # Next.js app (pages, components, built-in API routes)
│   ├── app/        #   Pages and /api/* route handlers
│   │   ├── admin/  #   Admin panel (product/review management)
│   │   └── login/  #   Login / register page
│   ├── components/ #   ProductCard, StarRating, ReviewForm, ReviewList, Navbar
│   ├── lib/        #   api.ts (typed fetch client), auth.ts (JWT utilities)
│   ├── middleware.ts # Route protection for /admin and admin-only API calls
│   └── db/          #  Drizzle schema + client
└── README.md
```

## Features

- Responsive product grid with star ratings, average rating, and review counts.
- Client-side search bar and minimum-rating filter (All / 4+ / 3+).
- Product detail page with full review list and submission form.
- User registration and login with JWT-based authentication.
- Admin panel: add/remove products, delete inappropriate reviews.
- Loading skeletons, error states, and validation throughout.
- TypeScript strict mode, Tailwind-only styling.

## Quick Start (FastAPI Backend — Production Setup)

Requirements: Python 3.11+, Node.js 18+, PostgreSQL.

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env           # set DATABASE_URL and JWT_SECRET
alembic upgrade head
python seed.py
uvicorn app.main:app --reload --port 8000
```

Swagger docs at `http://localhost:8000/docs`.

### Frontend

```bash
# from repo root, in another terminal
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

Open `http://localhost:3000`.

## Alternative: Built-in Next.js API Routes

If you'd rather run everything inside Next.js without the separate FastAPI service:

```bash
npm install
cp .env.example .env          # set DATABASE_URL, leave NEXT_PUBLIC_API_URL empty
npx drizzle-kit push          # create tables
npm run dev
curl -X POST http://localhost:3000/api/seed
```

## Demo Access

| Role | Email | Password |
|---|---|---|
| Admin | admin@reviewdibo.com | admin123 |

## API Endpoints

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/api/products` | List products with `average_rating` & `review_count` | — |
| GET | `/api/products/{id}` | Product detail with reviews | — |
| POST | `/api/products` | Create product | Admin |
| DELETE | `/api/products/{id}` | Delete product | Admin |
| POST | `/api/reviews` | Create review | — |
| GET | `/api/reviews` | List all reviews | Admin |
| PUT | `/api/reviews/{id}` | Update review | — |
| DELETE | `/api/reviews/{id}` | Delete review | Admin |
| POST | `/api/users` | Create or reuse user by email | — |
| POST | `/api/auth/register` | Register new account | — |
| POST | `/api/auth/login` | Login (returns JWT) | — |
| POST | `/api/auth/logout` | Clear auth session | — |
| GET | `/api/auth/me` | Get current user | Session |

## Environment Variables

| Variable | Used In | Purpose |
|---|---|---|
| `DATABASE_URL` | Both | PostgreSQL connection string |
| `NEXT_PUBLIC_API_URL` | Frontend | FastAPI backend URL (empty = use built-in Next.js routes instead) |
| `JWT_SECRET` | Both | Secret for signing auth tokens |

## Notes

Built using a modern AI-assisted development workflow (Cursor + Claude) for scaffolding and iteration — happy to walk through any part of the architecture or implementation in detail.
