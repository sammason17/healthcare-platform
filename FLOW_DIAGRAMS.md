# Healthcare Platform – System Flow Diagrams

Sequence diagrams covering the three core workflows. Each can be rendered by pasting into [https://mermaid.live](https://mermaid.live).

---

## Scenario 1: User Authentication (Login)

A healthcare professional signs in and gains access to protected resources.

```mermaid
sequenceDiagram
    actor User as User (Doctor / Pharmacist / Admin)
    participant FE as React Frontend
    participant API as FastAPI Backend
    participant DB as Database

    User->>FE: Enter email + password, submit form
    FE->>FE: Zod validates fields client-side
    FE->>API: POST /auth/login { email, password }
    API->>DB: SELECT user WHERE email = ?
    DB-->>API: User record (with password_hash)
    API->>API: bcrypt.verify(password, hash)

    alt Credentials valid
        API->>API: Create JWT { sub: user_id, role, exp }
        API-->>FE: 200 { access_token, role, user_id }
        FE->>FE: Store token in localStorage
        FE->>User: Redirect to /patients
    else Invalid credentials
        API-->>FE: 401 Unauthorized
        FE->>User: Show error message
    end
```

---

## Scenario 2: Patient Registration

A Doctor or Admin registers a new patient in the system.

```mermaid
sequenceDiagram
    actor Doctor
    participant FE as React Frontend
    participant API as FastAPI Backend
    participant MW as JWT Middleware
    participant DB as Database

    Doctor->>FE: Fill in patient form, submit
    FE->>FE: Zod validates all fields (required, email format, DOB)

    alt Validation fails
        FE->>Doctor: Show field-level error messages
    else Validation passes
        FE->>API: POST /patients { first_name, last_name, dob, ... }\n  Authorization: Bearer <token>
        API->>MW: Decode + verify JWT
        MW->>DB: SELECT user WHERE id = sub
        DB-->>MW: User record
        MW->>MW: Check role in [Doctor, Admin]

        alt Unauthorised role (e.g. Pharmacist)
            MW-->>FE: 403 Forbidden
            FE->>Doctor: Show permission error
        else Authorised
            API->>DB: INSERT INTO patients (...)
            DB-->>API: New patient record
            API-->>FE: 201 { patient }
            FE->>Doctor: Redirect to patient detail page
        end
    end
```

---

## Scenario 3: Prescription Lifecycle (Create → Approve → Dispense)

A Doctor creates a prescription; a Pharmacist processes it through to dispensing.

```mermaid
sequenceDiagram
    actor Doctor
    actor Pharmacist
    participant FE as React Frontend
    participant API as FastAPI Backend
    participant MW as JWT Middleware
    participant DB as Database

    %% Step 1: Doctor creates prescription
    Doctor->>FE: Open patient detail, click Add Prescription
    FE->>Doctor: Show prescription form
    Doctor->>FE: Enter medication, dosage, instructions, submit
    FE->>API: POST /prescriptions { patient_id, medication_name, ... }\n  Authorization: Bearer <doctor_token>
    API->>MW: Verify JWT, check role = Doctor
    MW-->>API: Authorised
    API->>DB: INSERT INTO prescriptions (status = Pending)
    DB-->>API: Prescription record
    API-->>FE: 201 { prescription, status: "Pending" }
    FE->>Doctor: Prescription appears on patient profile

    %% Step 2: Pharmacist views and approves
    Pharmacist->>FE: Navigate to Active Prescriptions
    FE->>API: GET /prescriptions/active\n  Authorization: Bearer <pharmacist_token>
    API->>MW: Verify JWT, check role in [Doctor, Pharmacist, Admin]
    MW-->>API: Authorised
    API->>DB: SELECT prescriptions WHERE status IN (Pending, Approved)
    DB-->>API: List of prescriptions
    API-->>FE: 200 [{ id, medication, status: "Pending", ... }]
    FE->>Pharmacist: Show prescriptions table with status dropdown

    Pharmacist->>FE: Change status dropdown to "Approved"
    FE->>API: PATCH /prescriptions/{id}/status { status: "Approved" }\n  Authorization: Bearer <pharmacist_token>
    API->>DB: Validate transition Pending → Approved ✓
    API->>DB: UPDATE prescriptions SET status = Approved
    DB-->>API: Updated record
    API-->>FE: 200 { status: "Approved" }
    FE->>Pharmacist: Row updates in place (stays visible)

    %% Step 3: Dispense
    Pharmacist->>FE: Change status dropdown to "Dispensed"
    FE->>API: PATCH /prescriptions/{id}/status { status: "Dispensed" }\n  Authorization: Bearer <pharmacist_token>
    API->>DB: Validate transition Approved → Dispensed ✓
    API->>DB: UPDATE prescriptions SET status = Dispensed
    DB-->>API: Updated record
    API-->>FE: 200 { status: "Dispensed" }
    FE->>Pharmacist: Row disappears from active list (complete)
```

---

## Scenario 4: Fetch Patients with Search and Filters

A user searches the patient list by name, gender, and age range.

```mermaid
sequenceDiagram
    actor User
    participant FE as React Frontend
    participant TQ as TanStack Query Cache
    participant API as FastAPI Backend
    participant DB as Database

    User->>FE: Types "Smith" in name search
    FE->>FE: Debounce 300ms
    FE->>TQ: Query key changes: ['patients', { name: "Smith", page: 1 }]

    alt Response cached
        TQ-->>FE: Return cached data immediately
    else Not cached
        TQ->>API: GET /patients?name=Smith&page=1&page_size=20\n  Authorization: Bearer <token>
        API->>MW: Verify JWT
        MW-->>API: Authorised
        API->>DB: SELECT * FROM patients\n  WHERE first_name ILIKE '%Smith%'\n  OR last_name ILIKE '%Smith%'\n  LIMIT 20 OFFSET 0
        DB-->>API: Matching rows + total count
        API-->>TQ: 200 { items: [...], total: 4, pages: 1 }
        TQ->>TQ: Cache response
        TQ-->>FE: Deliver data
    end

    FE->>User: Render filtered patient table (previous data shown during refetch)

    User->>FE: Also selects gender = "Female"
    FE->>TQ: Query key changes: ['patients', { name: "Smith", gender: "Female", page: 1 }]
    TQ->>API: GET /patients?name=Smith&gender=Female&page=1&page_size=20
    API->>DB: SELECT * FROM patients\n  WHERE (first_name ILIKE '%Smith%' OR last_name ILIKE '%Smith%')\n  AND gender = 'Female'
    DB-->>API: Narrowed result set
    API-->>FE: 200 { items: [...], total: 1, pages: 1 }
    FE->>User: Table updates with combined filters applied
```
