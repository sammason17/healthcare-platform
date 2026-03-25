# Healthcare Platform – Solution Summary

## What is this?

This is a web application for managing patient health records and prescriptions in a clinical environment. It allows healthcare professionals to register patients, record prescriptions and medical reports, and track the progress of prescriptions from creation through to dispensing — all through a secure, role-based interface.

---

## Who is it for?

The platform supports three types of users:

- **Doctors** — can register and update patients, write prescriptions, and record medical reports (vitals such as blood pressure, heart rate, and temperature).
- **Pharmacists** — can view active prescriptions and update their status as they are processed.
- **Admins** — have full access to all records and operations.

Each user type only sees and can do what is appropriate for their role. A Pharmacist, for example, cannot create prescriptions or view detailed medical reports.

---

## What can it do?

**Patient Management**
- Register new patients with personal and contact details
- Search and filter the patient list by name, age, and gender
- View a full patient profile including their prescription history and medical reports
- Update patient information at any time

**Prescription Tracking**
- Doctors create prescriptions for specific patients, including medication name, dosage, and instructions
- Prescriptions follow a clear workflow: **Pending → Approved → Dispensed**
- The Active Prescriptions view shows all in-progress prescriptions (Pending and Approved) so nothing falls through the cracks
- Once dispensed, a prescription is removed from the active queue

**Medical Reports**
- Doctors can record patient vitals (blood pressure, heart rate, temperature, weight, height) alongside free-text notes
- Reports are visible on the patient's detail page in chronological order

---

## How does it work (non-technical)?

Think of the application in three parts:

1. **The interface** — a web app you open in a browser. It looks and behaves like a modern web application with forms, tables, search, and filters.

2. **The server** — a backend application that handles all the logic: checking who you are, what you're allowed to do, and reading/writing data securely.

3. **The database** — where all patient, prescription, and report data is stored persistently.

When a user logs in, they receive a secure digital token (like a temporary ID badge) that is attached to every action they take. The server checks this token on every request to confirm identity and role before doing anything.

---

## How to run it

The entire application is containerised with Docker. You do not need to install Python, Node.js, or any other dependencies manually.

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

```bash
# Clone or unzip the project, then:
docker compose up --build
```

That's it. Docker will:
- Build and start the backend API (Python/FastAPI) on port 8000
- Build and start the frontend (React) on port 5173
- Create a persistent database volume so data survives restarts

Once running:
- **App:** http://localhost:5173
- **API docs:** http://localhost:8000/docs

**First time:** go to http://localhost:5173/register and create a staff account to get started.

To stop:
```bash
docker compose down
```

To reset the database (wipe all data):
```bash
docker compose down -v
```

---

## Data validation

Ensuring only clean, correctly-typed data enters the system is especially important in a healthcare context. The application enforces this at three independent layers — so invalid data has to get past all three before it can reach the database.

**Layer 1 — Browser (Zod + React Hook Form)**

Validation runs immediately when the user submits a form, before any network request is made. Errors appear inline under each field. Rules include:

- Required fields (name, date of birth, email on login) must not be empty
- Email addresses must match a valid format
- Passwords must not be empty (login) or must meet a minimum length (registration)
- Gender and role selections must be one of the defined options
- Optional fields (phone, address, patient email) are only validated if a value is provided

**Layer 2 — Server (Pydantic)**

FastAPI validates every incoming request body against a Pydantic schema before the route handler runs. If validation fails, a `422 Unprocessable Entity` is returned automatically. Rules include:

- Email fields use Pydantic's `EmailStr` — a proper RFC-compliant check, not just "contains @"
- Date of birth is typed as Python's `date` — the string is parsed and rejected if it isn't a real calendar date (e.g. `"2024-13-45"` fails)
- Role, gender, and prescription status are Python `Enum` types — any value not in the defined list is rejected
- Password has a custom validator enforcing a minimum of 6 characters

**Layer 3 — Database (SQLAlchemy + SQLite)**

The database itself enforces structural integrity as a final safety net:

- `NOT NULL` constraints on required fields — a row cannot be written without them
- `UNIQUE` constraints on email in both the users and patients tables — duplicate emails are rejected at the database level
- `ENUM` column types for role, gender, and prescription status — only valid values can be stored
- String length limits on columns (e.g. names max 100 characters, emails max 255) — enforced at the column level
- Foreign key constraints on prescriptions — a prescription cannot reference a patient or prescriber that does not exist

---

## Technical overview (for developers)

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18, TypeScript, Vite | Fast development, strong typing, component-based UI |
| Styling | Tailwind CSS | Utility-first, consistent design without custom CSS |
| State / data fetching | TanStack Query | Caching, pagination, and loading states out of the box |
| Form validation | React Hook Form + Zod | Schema-driven validation consistent with backend contracts |
| Backend | Python, FastAPI | Async-native, automatic API docs, Pydantic validation |
| Auth | JWT (HS256) | Stateless, scales horizontally without session storage |
| Database | SQLite (dev) | Zero-infrastructure for evaluation; swappable for MongoDB or MySQL in production |
| Containerisation | Docker + Docker Compose | Single-command setup, consistent environment across machines |

For a full explanation of architectural decisions, data model, and production trade-offs (including the database choice), see [`SYSTEM_DESIGN.md`](./SYSTEM_DESIGN.md).
