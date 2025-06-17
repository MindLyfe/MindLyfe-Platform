# Therapist Approval System

This document outlines the therapist approval system implemented in the Mindlyf auth service, ensuring that therapists must be approved by support team or admin before they can provide services.

## Overview

The system implements a comprehensive therapist management workflow with proper role-based access control (RBAC) to ensure only authorized personnel can approve, reject, or manage therapist accounts.

## User Roles & Permissions

### Roles Defined
- **ADMIN**: Full system access, can manage all therapists
- **ORGANIZATION_ADMIN**: Organization-level admin, can manage therapists within their scope
- **THERAPIST**: Licensed therapists who need approval to provide services
- **USER**: Regular users/clients

### Permission Matrix

| Action | ADMIN | ORGANIZATION_ADMIN | THERAPIST | USER |
|--------|-------|-------------------|-----------|------|
| View pending therapists | ✅ | ✅ | ❌ | ❌ |
| View all therapists | ✅ | ✅ | ❌ | ❌ |
| Approve therapist | ✅ | ✅ | ❌ | ❌ |
| Reject therapist | ✅ | ✅ | ❌ | ❌ |
| Suspend therapist | ✅ | ✅ | ❌ | ❌ |
| Reactivate therapist | ✅ | ✅ | ❌ | ❌ |
| View own profile | ✅ | ✅ | ✅ | ✅ |
| Update therapist status | ✅ | ✅ | ❌ | ❌ |

## Therapist Status Flow

```
Registration → PENDING_VERIFICATION → VERIFIED (Active)
                     ↓                    ↓
                 REJECTED              SUSPENDED
                                          ↓
                                    VERIFIED (Reactivated)
```

### Status Definitions
- **PENDING_VERIFICATION**: Initial status after registration, awaiting admin approval
- **VERIFIED**: Approved by admin, can accept clients and provide services
- **REJECTED**: Application rejected, cannot provide services
- **SUSPENDED**: Temporarily suspended, cannot provide services

## API Endpoints

### Therapist Management Endpoints

#### Get Pending Therapists
```http
GET /therapists/pending
Authorization: Bearer <jwt_token>
Roles: ADMIN, ORGANIZATION_ADMIN
```

#### Get All Therapists
```http
GET /therapists
Authorization: Bearer <jwt_token>
Roles: ADMIN, ORGANIZATION_ADMIN
```

#### Get Therapist by ID
```http
GET /therapists/:id
Authorization: Bearer <jwt_token>
Roles: ADMIN, ORGANIZATION_ADMIN, THERAPIST (own profile only)
```

#### Approve Therapist
```http
POST /therapists/:id/approve
Authorization: Bearer <jwt_token>
Roles: ADMIN, ORGANIZATION_ADMIN

Body:
{
  "approvalNotes": "string (optional)",
  "licenseState": "string (optional)",
  "licenseStatus": "ACTIVE | EXPIRED | SUSPENDED (optional)"
}
```

#### Reject Therapist
```http
POST /therapists/:id/reject
Authorization: Bearer <jwt_token>
Roles: ADMIN, ORGANIZATION_ADMIN

Body:
{
  "reason": "string (required)",
  "notes": "string (optional)"
}
```

#### Suspend Therapist
```http
POST /therapists/:id/suspend
Authorization: Bearer <jwt_token>
Roles: ADMIN, ORGANIZATION_ADMIN

Body:
{
  "reason": "string (required)",
  "notes": "string (optional)"
}
```

#### Reactivate Therapist
```http
POST /therapists/:id/reactivate
Authorization: Bearer <jwt_token>
Roles: ADMIN, ORGANIZATION_ADMIN
```

#### Update Therapist Status
```http
PATCH /therapists/:id/status
Authorization: Bearer <jwt_token>
Roles: ADMIN, ORGANIZATION_ADMIN

Body:
{
  "status": "PENDING_VERIFICATION | VERIFIED | REJECTED | SUSPENDED",
  "licenseStatus": "ACTIVE | EXPIRED | SUSPENDED (optional)"
}
```

#### Get Current Therapist Profile
```http
GET /therapists/me
Authorization: Bearer <jwt_token>
Roles: THERAPIST
```

## Security Implementation

### Guards & Decorators
- **JwtAuthGuard**: Ensures user is authenticated
- **RolesGuard**: Enforces role-based access control
- **@Roles()**: Decorator to specify required roles for endpoints

### Example Usage
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN)
@Post(':id/approve')
async approveTherapist(
  @Param('id') id: string,
  @Body() approveDto: ApproveTherapistDto,
  @Request() req,
) {
  return this.therapistService.approveTherapist(id, approveDto, req.user.id);
}
```

## Email Notifications

The system sends automated email notifications for:
- **Therapist Approval**: Welcome email with approval notes
- **Therapist Rejection**: Rejection email with reason and notes
- **Therapist Suspension**: Suspension notification with reason
- **Therapist Reactivation**: Reactivation confirmation

### Email Service Methods
- `sendTherapistApprovalEmail(email, name, notes?)`
- `sendTherapistRejectionEmail(email, name, reason, notes?)`
- `sendTherapistSuspensionEmail(email, name, reason, notes?)`
- `sendTherapistReactivationEmail(email, name)`

## Database Schema

### Therapist Entity
```typescript
@Entity('therapists')
export class Therapist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'enum', enum: TherapistStatus, default: TherapistStatus.PENDING_VERIFICATION })
  status: TherapistStatus;

  @Column({ name: 'license_number' })
  licenseNumber: string;

  @Column({ name: 'license_state', default: 'PENDING' })
  licenseState: string;

  @Column({ type: 'enum', enum: LicenseStatus, default: LicenseStatus.ACTIVE })
  licenseStatus: LicenseStatus;

  @Column({ name: 'is_accepting_new_clients', default: false })
  isAcceptingNewClients: boolean;

  // ... other fields
}
```

### User Entity (Role Field)
```typescript
@Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
role: UserRole;

@Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
status: UserStatus;
```

## Registration Flow

1. **Therapist Registration**: User registers as therapist via `/auth/register/therapist`
2. **Initial Status**: Therapist created with `PENDING_VERIFICATION` status
3. **User Status**: User account set to `PENDING` status
4. **Admin Review**: Admin/Support reviews application via management endpoints
5. **Approval/Rejection**: Admin approves or rejects with reason
6. **Status Update**: Therapist and user statuses updated accordingly
7. **Email Notification**: Automated email sent to therapist
8. **Service Access**: Approved therapists can accept clients and provide services

## Audit & Logging

All therapist management actions are logged with:
- Action performed (approve, reject, suspend, reactivate)
- Admin user ID who performed the action
- Therapist ID affected
- Timestamp
- Reason/notes provided

## Files Created/Modified

### New Files
- `src/therapist/therapist.controller.ts` - Therapist management endpoints
- `src/therapist/therapist.service.ts` - Business logic for therapist operations
- `src/therapist/dto/therapist.dto.ts` - Data transfer objects for API requests

### Modified Files
- `src/auth/auth.module.ts` - Added therapist controller and service
- `src/shared/services/email.service.ts` - Added therapist notification methods
- `src/auth/auth.service.ts` - Fixed therapist registration logic

## Usage Examples

### Approving a Therapist
```bash
curl -X POST http://localhost:3000/therapists/123e4567-e89b-12d3-a456-426614174000/approve \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "approvalNotes": "License verified, credentials approved",
    "licenseState": "CA",
    "licenseStatus": "ACTIVE"
  }'
```

### Getting Pending Therapists
```bash
curl -X GET "http://localhost:3000/therapists/pending?page=1&limit=10" \
  -H "Authorization: Bearer <admin_jwt_token>"
```

## Security Considerations

1. **Role Verification**: All endpoints verify user roles before allowing access
2. **JWT Authentication**: All endpoints require valid JWT tokens
3. **Input Validation**: All DTOs include proper validation rules
4. **Audit Trail**: All actions are logged for compliance and security
5. **Email Security**: Email notifications don't expose sensitive data
6. **Database Security**: Proper entity relationships and constraints

## Future Enhancements

1. **Document Upload**: Allow therapists to upload license documents
2. **Approval Workflow**: Multi-step approval process with different reviewer levels
3. **Automated Verification**: Integration with license verification services
4. **Notification Preferences**: Allow admins to configure notification settings
5. **Bulk Operations**: Approve/reject multiple therapists at once
6. **Advanced Filtering**: More sophisticated search and filter options