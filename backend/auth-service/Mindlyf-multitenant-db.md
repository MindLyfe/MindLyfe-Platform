# MindLyf Platform: Multi-Tenant Database Architecture

This document outlines the multi-tenant database structure and best practices for storing and managing user data across individuals, guardians, minors, and organizations within the MindLyf platform.

---

## 📊 Architecture Overview

MindLyf operates as a multi-tenant system with the following characteristics:

* Single PostgreSQL instance shared across services
* Each service (e.g., auth, chat, journal, AI) may use its own schema or logical database
* Data is scoped by `tenant_id`, representing either an organization or an individual user
* Role-based and tenant-level access control is enforced at query level

---

## 📄 Core Tables and Fields

### `users`

```sql
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  dob DATE,
  is_minor BOOLEAN,
  guardian_id UUID NULL,
  org_id UUID NULL,
  tenant_id UUID NOT NULL,
  role ENUM('USER', 'GUARDIAN', 'MINOR', 'THERAPIST', 'ORG_ADMIN', 'ADMIN', 'SUPPORT'),
  status ENUM('ACTIVE', 'PENDING_GUARDIAN', 'SUSPENDED'),
  consent_status ENUM('NONE', 'AWAITING', 'GRANTED', 'REVOKED'),
  plan_id UUID NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

* `tenant_id` is either the user's own ID (solo users) or the organization's ID (org users).

### `organizations`

```sql
organizations (
  id UUID PRIMARY KEY,
  name TEXT,
  registered_by UUID,
  created_at TIMESTAMP
)
```

### `org_plans`

```sql
org_plans (
  id UUID,
  org_id UUID,
  tier TEXT,
  features JSONB,
  usage JSONB,
  created_at TIMESTAMP
)
```

### `user_plans`

```sql
user_plans (
  id UUID,
  user_id UUID,
  tier TEXT,
  features JSONB,
  usage JSONB,
  status ENUM('ACTIVE', 'EXPIRED'),
  billing_reference TEXT,
  created_at TIMESTAMP
)
```

### `consent_logs`

```sql
consent_logs (
  id UUID,
  user_id UUID,
  guardian_id UUID,
  action ENUM('REQUESTED', 'GRANTED', 'REVOKED'),
  timestamp TIMESTAMP
)
```

---

## 📆 Tenant Isolation Strategy

* All tenant-aware tables include a `tenant_id` column.
* Services must scope queries to enforce tenant-level isolation.
* For extra safety, implement PostgreSQL Row-Level Security (RLS):

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON users FOR SELECT USING (tenant_id = current_setting('app.tenant_id')::UUID);
```

---

## 🚨 Data Privacy and Access Control

| Actor         | Data Access Scope                        |
| ------------- | ---------------------------------------- |
| User          | Own data only                            |
| Guardian      | Can consent for minors, not view content |
| Minor         | Scoped to their own `tenant_id`          |
| Org Admin     | Sees usage stats, no PII                 |
| Therapist     | Sees only assigned users                 |
| Support/Admin | Full platform access (audited)           |

---

## 💡 Use Cases Enabled

* Export data per user or organization
* Comply with GDPR "Right to Be Forgotten"
* Track minor-guardian linkage securely
* Prevent cross-tenant data access
* Scale tenant onboarding with shared infrastructure

---

## ⛔ What Not to Do

* Do not store minors under the org ID directly
* Do not allow guardian access to minor content
* Do not duplicate tenants across services — use shared ID model

---

## ✅ Summary

* Use `tenant_id` consistently to enforce multi-tenancy
* Separate org and solo users via `org_id` and `joined_as`
* Isolate minors, guardians, therapists, and orgs clearly
* Enable GDPR/PDPO compliance through structured design

This structure ensures secure, scalable, and compliant multi-tenant architecture for all MindLyf services.
