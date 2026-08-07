# HIRERIGHT Python Backend

FastAPI + SQLite API for auth, profiles, resume-aware interviews, and applications.

## Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI app + CORS + error shape
│   ├── config.py               # Settings from .env
│   ├── database.py             # SQLAlchemy engine/session
│   ├── dependencies.py         # Auth dependency + JSON helpers
│   ├── schemas.py              # Pydantic request/response models
│   ├── models/                 # SQLAlchemy tables
│   ├── routers/
│   │   ├── health.py
│   │   ├── auth.py
│   │   ├── profile.py
│   │   ├── interview.py
│   │   └── applications.py
│   ├── services/
│   │   └── interview_agent.py  # Resume question + scoring engine
│   └── utils/
│       └── security.py         # Password hashing + tokens
├── data/                       # SQLite DB lives here
├── requirements.txt
├── .env.example
└── run.py
```

## Setup

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # or: cp .env.example .env
```

## Run

```bash
python run.py
# API:  http://localhost:8787
# Docs: http://localhost:8787/docs
```

Or:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8787
```

## Main endpoints

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/health` | no |
| POST | `/api/signup` | no |
| POST | `/api/login` | no |
| POST | `/api/logout` | yes |
| GET | `/api/me` | yes |
| PUT | `/api/profile` | yes |
| POST | `/api/interview` | yes |
| POST | `/api/interview/start` | yes |
| POST | `/api/interview/integrity` | yes |
| POST | `/api/interview/score` | yes |
| GET | `/api/interview/latest` | yes |
| POST | `/api/applications` | yes |
| GET | `/api/applications` | yes |

Frontend default: `VITE_API_URL=http://localhost:8787`
