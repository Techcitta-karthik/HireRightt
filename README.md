# HireRighttt

End-to-end AI hiring product: candidate onboarding, live AI video interview, ranked job matches, employer ATS, and admin pipeline.

## Demo accounts

| Role | Email | Password |
|------|--------|----------|
| Job seeker | `demo@hireright.com` | `password123` |
| Employer | `employer@hireright.com` | `password123` |

## Run (submission)

```bash
npm install
npm run dev:all
```

- App: http://localhost:5173
- API: http://localhost:8787/api/health

`dev:all` starts the Vite UI and the Node API together. The UI still works offline via localStorage if the API is down.

## Product loop

1. **Candidate** signs up → builds profile → takes Ava’s AI interview → unlocks ranked jobs → applies.
2. **Employer** signs up → creates a private job → copies `/apply/{code}` → reviews AI scores, shortlists/rejects.
3. **Admin ATS** (`/admin`, employer login) → pipeline, matcher, analytics.

Private apply links work without a prior account: submitting the form creates a candidate session and opens the interview studio.

## Stack

- React 19 + TypeScript + Vite
- Node API (`server/index.mjs`) for auth/profile/interview persistence
- Optional FastAPI backend in `backend/` (`npm run server:py`)
