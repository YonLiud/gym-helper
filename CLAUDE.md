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
| gateway   | 8000            | —            | Reverse proxy, JWT validation      |
| auth      | 8000            | auth_db      | Login, register                    |
| gym       | 8000            | gym_db       | Gym CRUD                           |
| workout   | 8000            | workout_db   | Workouts + sets                    |
| exercise  | 8000            | exercise_db  | Per-user exercise catalog          |
| postgres  | 5432            | —            | Single postgres instance, 4 DBs    |

In prod no ports are exposed on the host — Traefik handles all ingress via the `proxy` Docker network. In dev, `docker-compose.override.yml` binds gateway:8000, frontend:5173, and postgres:5432 to localhost.

### Gateway

- All traffic enters through the gateway
- `/auth/*` routes are public (no token required)
- All other routes require a valid JWT cookie — `get_current_user` dependency decodes it locally using `JWT_SECRET` (no network call to auth)
- Injects `X-User-Id` and `X-Username` headers for downstream services
- Downstream services trust these headers — they are only reachable on the internal Docker network
- Handles `ClientDisconnect` gracefully (returns 499) so aborted requests don't produce error logs

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

## Frontend

React + TypeScript + Vite, using TanStack Router for routing and TanStack Query for data fetching/caching.

### Stack

| Library | Purpose |
|---|---|
| `@tanstack/react-router` | File-based routing (`src/routes/`) |
| `@tanstack/react-query` | Server state, caching, background revalidation |
| `tailwindcss` | Styling |
| `lucide-react` | Icons |

### Data fetching

All data fetching goes through hooks in `src/hooks/`:

- `useGyms()` — gym list + mutations
- `useExercises(muscleGroup?)` — exercise catalog + mutations
- `useWorkouts(gymId?)` — workout list + mutations
- `useWorkout(id)` — single workout with sets + mutations

Each hook uses `useQuery` with a `staleTime` (5 min for lists, 2 min for single workout), so navigating back to a page serves cached data instantly and only revalidates in the background. Mutations call `queryClient.invalidateQueries` on success to keep caches consistent.

The `api` client in `src/lib/api.ts` wraps `fetch` with cookie credentials and maps 401s to a redirect to `/login`. `api.get` accepts an optional `AbortSignal` — TanStack Query passes this automatically to cancel in-flight requests when a component unmounts.

### Routing

Routes live in `src/routes/` and are auto-generated into `src/routeTree.gen.ts` by the TanStack Router Vite plugin. The root layout (`__root.tsx`) renders `AppLayout` for authenticated routes and a bare `Outlet` for public paths (`/`, `/login`).

Page transitions use `key={pathname}` on the outlet wrapper in `AppLayout`, which forces a full remount on navigation to replay the CSS animation.

### API base path

In dev: Vite proxies `/api/*` → `localhost:8000`, stripping the prefix.
In prod: Traefik routes `Host(gym.yxnliu.net) && PathPrefix(/api)` to the gateway via the `strip-api` middleware, which strips the prefix.
The frontend always uses `/api` as the base — no environment switching needed.

## Environment variables

| Variable          | Used by        | Description                                                  |
|-------------------|----------------|--------------------------------------------------------------|
| `JWT_SECRET`      | auth, gateway  | Shared secret for signing/verifying JWTs                     |
| `REGISTER_KEY`    | auth           | Header secret required to register new users                 |
| `SECURE_COOKIE`   | auth           | `false` in dev (HTTP), `true` in prod (behind HTTPS/Cloudflare) |
| `FRONTEND_DOMAIN` | gateway        | Allowed CORS origin — set to what the browser sees (e.g. `https://gym.yxnliu.net`) |

Copy `.env.example` to `.env` and fill in values.

## Running locally

```bash
# Start all backend services (override.yml adds port bindings automatically)
docker-compose up --build gateway auth exercise gym workout postgres

# Start frontend dev server
cd frontend/gym-helper-frontend
bun dev
```

## Running in production

```bash
# Uses only docker-compose.yml — override.yml is ignored, no ports exposed on host
docker-compose -f docker-compose.yml up -d --build
```

Requires:
- Traefik running on the host and attached to the `proxy` external Docker network
- `proxy` network created: `docker network create proxy`
- `.env` file with all variables set (see above)

## Registering a user

Registration is not exposed in the UI. On Linux/Mac:

```bash
curl -X POST https://gym.yxnliu.net/api/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Register-Key: <REGISTER_KEY>" \
  -d '{"username": "yon", "password": "yourpassword"}'
```

On Windows (PowerShell):

```powershell
Invoke-WebRequest -Uri "https://gym.yxnliu.net/api/auth/register" -Method POST `
  -Headers @{ "Content-Type" = "application/json"; "X-Register-Key" = "<REGISTER_KEY>" } `
  -Body '{"username": "yon", "password": "yourpassword"}'
```
