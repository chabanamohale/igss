# Integrated Government Services System (IGSS)

A working Flask prototype of the system described in the Software Design / HCI
documentation: one verified citizen profile, anchored by Home Affairs and reused by
Police, Traffic and Transport, Finance, Pensions and Passport Services.

---

## Running it in Visual Studio Code

Open the `igss` folder in VS Code, then in the integrated terminal:

```bash
# 1. Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# 2. Install the dependencies
pip install -r requirements.txt

# 3. Build the database and load demonstration data
python seed.py

# 4. Start the server
python run.py
```

Then open **http://127.0.0.1:5000**.

Press `F5` in VS Code to run it under the debugger instead — a launch configuration is
included in `.vscode/launch.json`.

### Sign-in details after seeding

| Role | Username | Password |
|---|---|---|
| System administrator | `admin` | `Admin@2026` |
| Home Affairs officer | `ha.officer` | `Staff@2026` |
| Home Affairs registrar | `ha.manager` | `Staff@2026` |
| Police officer | `pol.officer` | `Staff@2026` |
| Traffic officer | `trf.officer` | `Staff@2026` |
| Finance officer | `fin.officer` | `Staff@2026` |
| Pensions officer | `pen.officer` | `Staff@2026` |
| Passport officer | `pas.officer` | `Staff@2026` |
| Citizen | `thabo` | `Citizen@2026` |

Sign in as different officers to see the access matrix in action: the same citizen
profile shows different record areas depending on which department you are in.

---

## Project structure

```
igss/
├── run.py                     Entry point — python run.py
├── app.py                     Application factory, error handlers, Jinja filters
├── config.py                  Development and production configuration classes
├── extensions.py              SQLAlchemy, Flask-Login, Bcrypt instances
├── models.py                  All 17 entities from the ERD
├── seed.py                    Demonstration data
├── smoke_test.py              Walks every route as every role
├── requirements.txt
│
├── blueprints/                APPLICATION LAYER
│   ├── main.py                Public pages, service catalogue, status lookup
│   ├── auth.py                Registration, sign-in, password management
│   ├── citizen.py             Citizen portal
│   ├── employee.py            Staff workspace, queue, citizen lookup, reports
│   ├── departments.py         The six departmental modules
│   └── admin.py               Accounts, catalogue, access matrix, audit log
│
├── utils/
│   ├── security.py            ACCESS_MATRIX and the role/area decorators
│   └── helpers.py             Audit writing, uploads, status transitions
│
├── templates/                 PRESENTATION LAYER
│   ├── base.html              Signed-in shell with sidebar
│   ├── public.html            Public shell
│   ├── partials/              nav.html, macros.html
│   ├── main/ auth/ citizen/ employee/ departments/ admin/ errors/
│
├── static/
│   ├── css/style.css          Design tokens and every component
│   ├── js/main.js             Progressive enhancement only
│   └── uploads/               Uploaded supporting documents
│
└── instance/igss.db           DATA LAYER — SQLite, created by seed.py
```

This is the three-tier architecture from section 4.1 of the documentation:
presentation in `templates/` and `static/`, application logic in `blueprints/` and
`utils/`, data in `models.py` and `instance/igss.db`.

---

## What the system does

### Citizens
Register with a national ID, then wait for Home Affairs to verify it. Once verified:
browse and apply for any of 18 services, reuse verified documents from the document
wallet instead of re-uploading them, pay fees and print receipts, track each
application through its full status history, see every record the six departments hold,
and receive a notification on each status change.

### Government employees
A departmental dashboard with queue counts, a 14-day intake sparkline and a status
breakdown. A filterable work queue with claim and reassign. Citizen lookup and
counter-side identity verification. A case file with documents, internal notes, status
transitions and a decision record. Cross-department data-sharing requests. Performance
reporting by status, service, district and month.

### The six departmental modules
- **Home Affairs** — verification queue and civil registration (birth, marriage, death)
- **Passport Services** — passport register, application queue, issuance with a ten-year expiry
- **Police** — clearance files, fingerprint tracking, clear/flag decisions with six-month validity
- **Traffic and Transport** — driver licensing by class, vehicle registration and annual renewal
- **Finance** — revenue by department, transaction ledger, reversals, taxpayer accounts
- **Pensions** — beneficiary register, payroll total, and an eligibility list built by comparing
  dates of birth in the civil register against the age-70 condition

### System administration
Account creation and role changes, suspension and password reset, department and
service catalogue management, a read-only view of the access matrix, and the full
audit log with filters.

---

## Security model

Three things are worth pointing out in a demonstration:

**The access matrix.** `ACCESS_MATRIX` in `utils/security.py` maps each department code
to the record areas it may read. Routes are guarded with `@area_required` and
`@department_required`; templates check `can_access()` before rendering an area. Because
both read the same dictionary, the interface and the routes can never disagree.

**The audit trail.** `record_audit()` is called on every citizen search, profile view,
document open, status change and payment. Each entry stores the officer's name,
department, IP address and timestamp. Officers see their own trail under *My activity*;
administrators see everything.

**Business rules enforced server-side, not just in the form.** A passport cannot be
issued against an unverified identity. An application cannot be approved while a fee is
outstanding. An Old Age Pension enrolment is refused if the date of birth in the civil
register puts the applicant under 70. A rejection requires a written reason.

Passwords are hashed with bcrypt. Sessions are HttpOnly, SameSite=Lax, and use
Flask-Login's strong session protection. Uploads are capped at 8 MB, extension-filtered,
and stored under timestamped names so a malicious filename cannot overwrite anything.

---

## Checking that it works

```bash
python smoke_test.py
```

This signs in as every role, visits every page, checks the write operations succeed, and
asserts the permission boundaries hold — for example that a Traffic officer opening a
citizen profile sees the driver licence area but not the tax account or police records,
and is refused a Finance case file outright.

---

## Notes for the report

- Technologies match section 4.2 exactly: Python, Flask, SQLite, HTML5, CSS3,
  JavaScript, Git.
- The interface is built on custom CSS rather than stock Bootstrap. If the marking
  criteria specifically require Bootstrap, add the CDN link in `templates/base.html`;
  the class names used here do not collide with Bootstrap's.
- The department key colours and the 4px record stripe are a deliberate usability
  decision, not decoration: a clerk scanning a long queue reads record ownership before
  reading any text.
- JavaScript is progressive enhancement only. Every page, form and workflow functions
  with JavaScript disabled, which matters for the accessibility requirement in
  section 2.5.

This is a student prototype for coursework, not a live government service.
