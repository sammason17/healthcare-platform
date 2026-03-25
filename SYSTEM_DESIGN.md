# Healthcare Platform – System Design

## 1. Architecture Overview

The system uses a three-tier architecture with a React SPA frontend, a FastAPI REST API backend, and a SQLite database (swappable for PostgreSQL in production).

```
┌─────────────────────────────────────────────────────────┐
│                      Client Browser                     │
│                                                         │
│   React SPA (Vite)                                      │
│   ├── React Router (client-side routing)                │
│   ├── TanStack Query (server state / caching)           │
│   ├── React Hook Form + Zod (form validation)           │
│   └── Axios (HTTP client with JWT interceptor)          │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTPS / REST (JSON)
                          │ /api/* proxied by Vite in dev
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  FastAPI Backend (Python)                │
│                                                         │
│   ┌──────────────┐  ┌────────────┐  ┌────────────────┐ │
│   │  Auth Router │  │  Patients  │  │  Prescriptions │ │
│   │  /auth/*     │  │  /patients │  │  /prescriptions│ │
│   └──────────────┘  └────────────┘  └────────────────┘ │
│                                                         │
│   JWT Middleware ──► Role-Based Access Control (RBAC)   │
│   SQLAlchemy (async) ──► Services ──► Pydantic Schemas  │
└─────────────────────────┬───────────────────────────────┘
                          │ SQLAlchemy ORM (async)
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   SQLite (dev) / PostgreSQL (prod)       │
│   Tables: users, patients, prescriptions, medical_reports│
└─────────────────────────────────────────────────────────┘
```

**Key interactions:**
- The frontend authenticates via `POST /auth/login`, receives a JWT, and stores it in `localStorage`.
- Every subsequent request attaches the JWT as a `Bearer` token via an Axios request interceptor.
- The FastAPI `get_current_user` dependency decodes and validates the JWT on every protected route.
- Role checks (`require_role`) are enforced at the router level before any business logic runs.

**Why this stack:**
- **FastAPI** was chosen over Django/Flask for its async-native design, automatic OpenAPI docs generation, and Pydantic v2 integration for request/response validation — all of which reduce boilerplate in a healthcare API where data contracts matter.
- **React + Vite** gives a fast development cycle with HMR. The component-per-concern structure (filters, list, detail, forms as separate components) reflects how a real team would split ownership and test in isolation.
- **TanStack Query** handles server state (loading, caching, invalidation) so components stay focused on presentation — a deliberate separation that scales well as the frontend grows.
- **Zod + React Hook Form** mirrors backend Pydantic schemas on the frontend, meaning field names and validation rules are consistent across the stack and errors map cleanly between layers.

---

## 2. Data Model

### User
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| email | VARCHAR(255) | Unique, indexed |
| password_hash | VARCHAR(255) | bcrypt, never stored plaintext |
| role | ENUM | Doctor, Pharmacist, Admin |
| first_name | VARCHAR(100) | |
| last_name | VARCHAR(100) | |
| is_active | BOOLEAN | Soft-disable accounts |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### Patient
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| first_name | VARCHAR(100) | NOT NULL |
| last_name | VARCHAR(100) | NOT NULL, indexed |
| date_of_birth | DATE | NOT NULL |
| gender | ENUM | Male, Female, Other |
| email | VARCHAR(255) | Unique, nullable |
| phone | VARCHAR(20) | |
| address | TEXT | |
| created_by | UUID (FK → User) | Audit trail |
| created_at / updated_at | TIMESTAMP | |

### Prescription
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| patient_id | UUID (FK → Patient) | Indexed |
| prescribed_by | UUID (FK → User) | Doctor who wrote it |
| medication_name | VARCHAR(255) | NOT NULL |
| dosage | VARCHAR(100) | |
| instructions | TEXT | |
| status | ENUM | Pending → Approved → Dispensed |
| created_at / updated_at | TIMESTAMP | |

### MedicalReport
| Field | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| patient_id | UUID (FK → Patient) | Indexed |
| recorded_by | UUID (FK → User) | |
| blood_pressure | VARCHAR(20) | e.g. "120/80" |
| heart_rate | INTEGER | bpm |
| temperature | FLOAT | °C |
| weight_kg / height_cm | FLOAT | |
| notes | TEXT | |
| recorded_at | TIMESTAMP | |

**Relationships:**
- `Patient` 1→N `Prescription`
- `Patient` 1→N `MedicalReport`
- `User` (Doctor) 1→N `Prescription` (as prescriber)
- `User` 1→N `Patient` (as creator)

**Why a relational model:**
The data is highly normalised — patients, prescriptions, and reports have clear foreign key relationships with no ambiguous ownership. A relational model enforces referential integrity at the database level (e.g. a prescription cannot exist without a valid patient), which is important in a healthcare context where orphaned or inconsistent records have real consequences.

---

## 3. Design Notes

**Authentication & Authorisation**
- Users authenticate via `POST /auth/login` with email + password; a signed JWT is returned containing `sub` (user ID) and `role`.
- All protected endpoints validate the JWT via a FastAPI `Depends(get_current_user)` dependency — no session state is held server-side.
- Role-Based Access Control (RBAC) is enforced per-endpoint using a `require_role(...)` dependency factory. Doctors can create/update prescriptions and medical reports; Pharmacists can view and update prescription statuses only; Admins have full access.
- Passwords are hashed with bcrypt (cost factor ≥ 12) and never logged or stored in plaintext.

**Handling Sensitive Health Data**
- All client–server communication uses HTTPS in production; the development proxy eliminates mixed-content issues.
- The `created_by` / `recorded_by` / `prescribed_by` foreign keys on every record provide implicit audit trails — every write is attributable to a specific user.
- In production, a dedicated append-only audit log table would capture every write event (`user_id`, `action`, `resource_type`, `resource_id`, `timestamp`) for compliance and forensic traceability.
- The application enforces access at the service layer (e.g. Pharmacists cannot read medical reports), so even internal callers cannot bypass RBAC.

**Scalability & Performance**
- The FastAPI service is stateless (JWT carries all identity context); horizontal scaling requires only a load balancer — no session affinity needed.
- Indexes are placed on high-cardinality filter columns: `patients.last_name`, `prescriptions.status`, `prescriptions.patient_id`, `medical_reports.patient_id`, and all foreign keys.
- Pagination is offset-based with configurable `page_size`; the service layer uses `.offset()` + `.limit()` plus a `COUNT(*)` subquery to return total record counts, keeping query cost bounded.
- On the frontend, TanStack Query caches paginated responses and uses `placeholderData: keepPreviousData` to prevent table blanking during page transitions.

**Database choice — SQLite (dev) and the production trade-off:**
SQLite is used here purely for convenience in a take-home context — it requires zero infrastructure, ships with Python, and the async SQLAlchemy engine is fully database-agnostic, so swapping it out is a one-line config change.

In a real production system I would not use SQLite. The two realistic options are:

- **MySQL with horizontal sharding:** The schema normalises cleanly into relational tables and the relationships are well-defined, making MySQL a natural fit. At scale, patient records could be sharded by a partition key (e.g. patient ID range or region) so that each shard handles a subset of records and the system scales horizontally without any single database becoming a bottleneck. This approach works well when the data shape is stable and query patterns are predictable.

- **NoSQL (e.g. MongoDB):** A document store gives significantly more flexibility — patient records, prescriptions, and medical reports could be embedded in a single document or referenced loosely, and the schema can evolve without migrations. In a fast-moving healthcare product where requirements change frequently (new fields, new record types, regional regulatory differences), this freedom is valuable. MongoDB also scales horizontally via native sharding and replica sets. The trade-off is looser referential integrity, which requires more discipline at the application layer.

**My preference for this domain would be MongoDB in production.** Healthcare data models change — new report types get added, new fields appear due to regulation, different clinical workflows need different schemas. A document store absorbs those changes more gracefully than a rigid relational schema. For this task, SQLite with SQLAlchemy was the pragmatic choice: it demonstrates the same ORM patterns, the same async query structure, and the same data relationships without requiring a running database server to evaluate the submission.
