# HireRight candidate frontend

React/Vite frontend for the HireRight candidate journey. It connects to the FastAPI backend for registration, login, candidate profile persistence, résumé uploads, interview availability, bookings and cancellation.

## Requirements

- Node.js 20 or newer
- The FastAPI backend running on `http://localhost:8000`

## Start the backend

From the backend directory:

```powershell
.\.venv\Scripts\Activate.ps1
alembic upgrade head
python -m app.scripts.seed_demo
uvicorn app.main:app --reload
```

The seeder creates demo interview slots and is safe to run repeatedly.

## Start the frontend

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Open `http://localhost:5173`. Use `localhost`, rather than `127.0.0.1`, because the backend's development CORS configuration permits `http://localhost:5173`.

The default frontend environment is:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Connected features

- `/register` creates a candidate and stores the returned bearer token.
- `/login` restores an existing candidate session.
- `/onboarding` is protected and loads the signed-in profile.
- Step 1 saves supported profile fields and uploads a selected résumé.
- Steps 2 and 3 are retained as a local browser draft until backend tables are added for them.
- Step 4 loads real interview slots and supports booking and cancellation.
- The top-right menu signs the candidate out.

## Verification

```powershell
npm run build
npm run lint
```

