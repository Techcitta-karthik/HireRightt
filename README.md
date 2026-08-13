# HireRight

React candidate experience and recruiter ATS with a multi-tenant Python/FastAPI backend.

## Run locally

```powershell
npm install
pip install -r backend\requirements-dev.txt
cd backend
python -m alembic upgrade head
python run.py
```

In a second terminal:

```powershell
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:8787`
- API docs: `http://localhost:8787/docs`

For the backend architecture, configuration, security model, endpoints, migrations, Docker/PostgreSQL setup, and tests, see [backend/README.md](./backend/README.md).
