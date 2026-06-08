# gym-helper

A personal web-based gym performance tracker.

## Architecture

Microservices behind a gateway, all containerized with Docker Compose.

```
browser → Traefik (prod) / Vite proxy (dev) → gateway → services → postgres
```

### Services

| Service   | Port (internal) | Database     | Description                        |
|-----------|-----------------|--------------|------------------------------------|
| gateway   | 8000 (exposed)  | —            | Reverse proxy, JWT validation      |
| auth      | 8000            | auth_db      | Login, register                    |
| gym       | 8000            | gym_db       | Gym CRUD                           |
| workout   | 8000            | workout_db   | Workouts + sets                    |
| exercise  | 8000            | exercise_db  | Per-user exercise catalog          |
| postgres  | 5432 (exposed)  | —            | Single postgres instance, 4 DBs    |

### Gateway

- All traffic enters through the gateway
- `/auth/*` routes are public (no token required)
- All other routes require a valid JWT cookie — `get_current_user` dependency decodes it locally using `JWT_SECRET` (no network call to auth)
- Injects `X-User-Id` and `X-Username` headers for downstream services
- Downstream services trust these headers — they are only reachable on the internal Docker network

### Auth

- `POST /auth/login` — verifies credentials, sets httpOnly `token` cookie, returns `{ username }`
- `POST /auth/register` — requires `X-Register-Key` header, same response as login
- `POST /auth/logout` — clears the cookie
- JWT: HS256, 24h expiry, payload: `{ sub: user_id, username, exp }`
- Passwords hashed with `bcrypt` directly (not passlib — compatibility issues)

### Per-service pattern

Each service follows the same structure:

```
service/
  database.py   — engine, SessionLocal, Base, get_db
  models.py     — SQLAlchemy ORM models
  schemas.py    — Pydantic request/response models
  service.py    — business logic / DB queries
  main.py       — FastAPI app, lifespan, thin route handlers
  Dockerfile
  requirements.txt
```

Each service creates its own database on startup via `_ensure_database()` (connects to `postgres` db, creates target db if missing, then runs `create_all`).

User scoping: all queries filter by `user_id` extracted from the `X-User-Id` header (injected by gateway).

### Cross-service references

No foreign keys across service boundaries. References are by convention:
- `workouts.gym_id` → gym service's `gyms.id`
- `sets.exercise_id` → exercise service's `exercises.id`

### Soft delete

Only `gym` uses soft delete (`deleted_at` timestamp). Workouts are hard deleted (cascades to sets via FK within `workout_db`).

## Environment variables

| Variable        | Used by  | Description                          |
|-----------------|----------|--------------------------------------|
| `JWT_SECRET`    | auth, gateway | Shared secret for signing/verifying JWTs |
| `REGISTER_KEY`  | auth     | Header secret required to register   |
| `SECURE_COOKIE` | auth     | `false` in dev (HTTP), `true` in prod (HTTPS) |

Copy `.env.example` to `.env` and fill in values.

## Running locally

```bash
# Start backend services only (frontend runs separately)
docker-compose up --build gateway auth exercise gym workout postgres

# Start frontend dev server
cd frontend/gym-helper-frontend
bun dev
```

Vite proxies `/api/*` → `localhost:8000` (gateway), stripping the `/api` prefix to match what Traefik does in production.

## Registering a user

Registration is not exposed in the UI — use curl:

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Register-Key: <REGISTER_KEY>" \
  -d '{"username": "yon", "password": "yourpassword"}'
```
