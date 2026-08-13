# HireRight API

Production-oriented FastAPI backend for the HireRight candidate platform and recruiter ATS.

## What is included

- Multi-tenant organizations with strict `organization_id` scoping
- Owner, admin, recruiter, and member RBAC
- Password authentication with hashed, revocable sessions
- Short-lived access tokens and rotating refresh tokens; tokens are hashed at rest
- Candidate profiles and account preferences
- Resume-aware interview sessions, integrity events, scoring, history, and retry-safe completion
- Jobs, candidate applications, recruiter pipeline updates, and admin reporting
- Workspace invitations and member management
- Immutable audit log for security-sensitive and recruiter actions
- PostgreSQL production configuration, SQLite local/test configuration
- Alembic migrations, Docker packaging, health probes, request IDs, CORS, trusted hosts, payload limits, and security headers
- Automated API tests for authentication, tenant isolation, RBAC, profile, application, and interview flows

## Local setup

From the repository root:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r backend\requirements-dev.txt
Copy-Item backend\.env.example backend\.env
cd backend
python -m alembic upgrade head
python run.py
```

API: `http://localhost:8787`

OpenAPI: `http://localhost:8787/docs`

Readiness: `http://localhost:8787/api/health`

Liveness: `http://localhost:8787/api/health/live`

The frontend expects `VITE_API_URL=http://localhost:8787`.

## PostgreSQL with Docker

From the repository root:

```powershell
docker compose up --build
```

This starts PostgreSQL 17 and the API, waits for the database health check, applies Alembic migrations, and exposes the API on port 8787.

## Configuration

All settings use environment variables. See [`.env.example`](./.env.example).

For staging and production:

- Set `ENVIRONMENT=staging` or `production`.
- Use a `postgresql+psycopg://...` `DATABASE_URL`.
- Generate a unique `SECRET_KEY` with at least 32 characters.
- Set explicit `CORS_ORIGINS` and `TRUSTED_HOSTS`.
- Put TLS, distributed rate limiting, and request logging at the load balancer/API gateway.
- Set `DOCS_ENABLED=false` if public API documentation is not desired.
- Run `alembic upgrade head` as a release step before starting new application instances.

The app refuses to boot in staging/production with SQLite, a weak secret, or wildcard CORS.

## API groups

| Group | Main endpoints |
|---|---|
| Auth | `POST /api/signup`, `/api/login`, `/api/auth/refresh`, `/api/logout`, `/api/logout-all` |
| Account | `GET /api/me`, `PATCH /api/account`, `GET/PUT /api/account/preferences` |
| Profile | `PUT /api/profile` |
| Interviews | `POST /api/interview/start`, `/integrity`, `/score`; `GET /api/interview/latest`, `/api/interviews` |
| Applications | `POST/GET /api/applications`, `PATCH /api/applications/{id}/status` |
| Jobs | `GET/POST /api/jobs`, `GET/PUT/DELETE /api/jobs/{id}` |
| Organization | `GET /api/organizations`, member and invitation endpoints under `/api/organizations/...` |
| Recruiter admin | `GET /api/admin/overview`, `/api/admin/candidates` |

All business endpoints require `Authorization: Bearer <access token>`. Recruiter and admin mutations enforce workspace roles. A session is bound to one organization, preventing a caller from selecting a different tenant through request data.

## Database workflow

```powershell
cd backend
python -m alembic upgrade head
python -m alembic revision --autogenerate -m "describe change"
python -m alembic check
```

Review generated migrations before committing them. Application startup never creates tables; Alembic is the only schema migration mechanism. Tests may create an isolated temporary schema directly.

## Verification

```powershell
cd backend
python -m ruff check app tests migrations
python -m pytest --cov=app
cd ..
npm run build
```

## Source layout

```text
backend/
  app/
    models/          SQLAlchemy tenant-aware domain models
    routers/         API route modules
    services/        Interview question/scoring engine
    utils/           Password and token security
    config.py        Validated environment settings
    database.py      Engine and request-scoped sessions
    dependencies.py  Authentication, tenant context, RBAC, audit helper
    main.py          Application and middleware
  migrations/        Alembic schema history
  tests/             Integration-level API tests
  Dockerfile
```
