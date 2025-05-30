# MindLyfe Auth Service

The `auth-service` is the central identity and user management service for the MindLyfe platform. It handles user registration, login, plan and consent enforcement, guardian-minor relationships, organization linkage, therapist onboarding, and role-based access control.

---

## 📁 Supported User Roles

| Role        | Description                                                            |
| ----------- | ---------------------------------------------------------------------- |
| `USER`      | A standalone user or user under an organization                        |
| `GUARDIAN`  | A user 18+ who manages minors and consents to their account activation |
| `MINOR`     | A user under 18, requires guardian consent and independent plan        |
| `THERAPIST` | A licensed professional who must be verified by MindLyfe support        |
| `ORG_ADMIN` | Admin of a registered organization                                     |
| `ADMIN`     | Platform-level admin                                                   |
| `SUPPORT`   | MindLyfe support staff managing therapists and org registrations        |

---

## 📝 Key Features

* User registration for solo and organization-linked users
* Guardian consent workflow for minors
* Plan and feature access enforcement
* Therapist application and document verification
* Organization registration (by support only)
* Role-based access control
* GDPR/PDPO compliant data exports

---

## 📊 Database Structure

### `users`

```sql
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  dob DATE,
  is_minor BOOLEAN GENERATED ALWAYS AS (date_part('year', age(current_date, dob)) < 18) STORED,
  guardian_id UUID NULL,
  org_id UUID NULL,
  role ENUM(...),
  joined_as ENUM(...),
  status ENUM(...),
  consent_status ENUM(...),
  plan_id UUID NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### `therapists`

```sql
therapists (
  id UUID PRIMARY KEY,
  user_id UUID,
  license_documents TEXT[],
  education_documents TEXT[],
  status ENUM('SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED'),
  reviewed_by UUID NULL,
  review_notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### `organizations`, `org_plans`, `user_plans`, `consent_logs`

(See schema definitions in documentation.)

---

## 🚀 User Flows

### User Registration

* Age 18+: Full access
* Under 18: Account locked until guardian grants consent

### Guardian Flow

* Any user ≥18 can:

  * Receive consent requests from minors
  * Add minors directly
  * Must approve consent before minor can access the platform

### Therapist Flow

* Must apply and upload documents
* Status visible on dashboard
* MindLyfe support team verifies

### Organization Flow

* Only MindLyfe `SUPPORT` can create organizations
* Users join orgs via invite

---

## 🔒 Access & Feature Gating

* Central method: `canAccessFeature(userId, featureName)`
* Checks role, status, plan usage, and consent where required
* Minors require valid plan + guardian consent

---

## 👀 API Endpoints

```http
POST   /auth/register
POST   /auth/register-minor
POST   /auth/guardian-consent
POST   /auth/add-minor
POST   /auth/therapist/apply
POST   /auth/therapist/status/update
POST   /auth/org/create           (SUPPORT only)
POST   /auth/org/invite-user
POST   /auth/org/assign-plan
GET    /auth/me
GET    /auth/user/:id/export
GET    /auth/check-feature-access
```

---

## 🔧 Integration Points

* `assessment-service`: Optional at registration, used by AI to recommend therapists
* `ai-service`: Matches users to therapists, courses, and nudges over time

---

## ⛔ Restrictions

* Guardians cannot access minor content
* Org Admins cannot manage therapists
* Therapists are global, not scoped to orgs
* Assessment is optional at onboarding
* Consent and verification must be securely logged

---

## ✅ Dev Notes

* Framework: **NestJS**
* Use `@Roles()` decorators for RBAC
* Add guards for `status`, `plan`, `consent`
* Fully Dockerized
* Secrets managed via AWS Secrets Manager
* Secure all data at rest and in transit

---

This service powers critical identity and access control for all MindLyfe features including LyfeBot, journaling, therapy sessions, and more.
