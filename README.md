# Healthcare Platform

Full-stack healthcare records and prescription management system.

**Stack:** FastAPI (Python) · SQLite · React · TypeScript · Tailwind CSS · Docker

---

## Quickstart (Docker — recommended)

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

```bash
docker compose up --build
```

That's it. Both services will start:

| Service | URL |
|---|---|
| Frontend (React) | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Interactive API docs | http://localhost:8000/docs |

**First time:** go to http://localhost:5173/register to create a staff account (Doctor, Pharmacist, or Admin), then log in.

### Useful commands

```bash
# Start in background
docker compose up --build -d

# Stop
docker compose down

# Reset database (wipes all data)
docker compose down -v

# View logs
docker compose logs -f
```

---

## Database

Data is stored in a SQLite file inside a named Docker volume (`db_data`). It **persists between restarts** — stopping and restarting containers does not wipe your data.

To reset to a clean state:
```bash
docker compose down -v
```

---

## Running tests

Tests run inside Docker — no local Python or Node setup required.

### Backend tests (pytest)

```bash
# Run all tests
docker compose run --rm backend pytest

# With coverage report
docker compose run --rm backend pytest --cov=app --cov-report=term-missing

# Specific test file
docker compose run --rm backend pytest tests/test_patients.py -v
```

### Frontend tests (Vitest)

```bash
# Run all tests
docker compose run --rm frontend npm test

# With coverage report
docker compose run --rm frontend npm run test:coverage
```

> The app does not need to be running (`docker compose up`) to run tests — each command spins up a temporary container and exits when done.

### Test coverage summary

| Suite | Passed | Skipped | Failed |
|---|---|---|---|
| Backend (pytest) | 40 | 0 | 0 |
| Frontend (Vitest) | 30 | 2 | 0 |

The 2 skipped frontend tests cover form submission with a date-of-birth field. jsdom (the test environment) does not support `type="date"` inputs in a way that works with react-hook-form's internal state tracking, so these cannot be made to pass without changing the component. The feature works correctly in the running app.

---

## Running without Docker

If you prefer to run locally without Docker:

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Project structure

```
healthcare-platform/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── app/
│   │   ├── main.py           # App entry point, CORS, router registration
│   │   ├── config.py         # Settings from environment
│   │   ├── database.py       # SQLAlchemy async engine
│   │   ├── models/           # ORM models (User, Patient, Prescription, MedicalReport)
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── routers/          # Route handlers
│   │   ├── services/         # Business logic / DB queries
│   │   └── dependencies/     # Auth middleware, DB session
│   └── requirements.txt
│
├── frontend/
│   ├── Dockerfile
│   └── src/
│       ├── api/              # Axios API clients
│       ├── context/          # Auth context (JWT storage)
│       ├── components/       # Reusable UI components
│       └── pages/            # Route-level page components
│
├── SUMMARY.md                          # Non-technical solution overview
├── SYSTEM_DESIGN.md                    # Architecture, data model, design decisions
├── FLOW_DIAGRAMS.md                    # Sequence diagrams for core workflows
└── ARCHITECTURE_DIAGRAM_INSTRUCTIONS.md
```

---

## API endpoints

| Method | Path | Description | Auth required |
|---|---|---|---|
| POST | /auth/register | Register new staff account | None |
| POST | /auth/login | Login, receive JWT | None |
| POST | /patients | Register patient | Doctor, Admin |
| GET | /patients | List patients (paginated, filtered) | Any role |
| GET | /patients/{id} | Patient detail + prescriptions + reports | Any role |
| PUT | /patients/{id} | Update patient | Doctor, Admin |
| POST | /prescriptions | Create prescription | Doctor |
| GET | /prescriptions/active | List Pending + Approved prescriptions | Any role |
| PATCH | /prescriptions/{id}/status | Update prescription status | Any role |
| POST | /medical-reports | Record vitals report | Doctor, Admin |
