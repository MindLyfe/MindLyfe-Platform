# Support Team System Documentation

## Overview

The Support Team System is a comprehensive solution for managing customer support operations with automated shift scheduling, intelligent request routing, and multi-channel notifications. This system ensures 24/7 coverage with four distinct shifts and provides seamless handoffs between support team members.

## Table of Contents

1. [User Roles and Permissions](#user-roles-and-permissions)
2. [Shift Management](#shift-management)
3. [Auto-Routing System](#auto-routing-system)
4. [Notification System](#notification-system)
5. [API Endpoints](#api-endpoints)
6. [Database Schema](#database-schema)
7. [Setup and Configuration](#setup-and-configuration)
8. [Usage Examples](#usage-examples)
9. [Security Considerations](#security-considerations)
10. [Monitoring and Analytics](#monitoring-and-analytics)

## User Roles and Permissions

### Role Hierarchy

```
SUPER_ADMIN
├── Full system access
├── Manage all roles and permissions
├── System configuration
└── Override all restrictions

ADMIN
├── Manage support team members
├── Create and modify shifts
├── View all support requests
├── Access analytics and reports
└── Configure auto-routing

SUPPORT_TEAM
├── Handle assigned support requests
├── Start/end shifts (check-in/out)
├── Take unassigned requests
├── Escalate requests
└── View personal dashboard

Other Roles (USER, THERAPIST, ORGANIZATION_ADMIN)
├── Create support requests
├── View own support requests
└── Receive support assistance
```

### Key Differences

- **SUPER_ADMIN**: System-wide control, can manage all aspects including other admins
- **ADMIN**: Operational control over support team and requests, cannot modify super admin settings
- **SUPPORT_TEAM**: Frontline support staff with shift-based responsibilities

## Shift Management

### Shift Schedule

The system operates on a 24/7 schedule with four distinct shifts:

| Shift Type | Time Range | Duration | Description |
|------------|------------|----------|-------------|
| **Morning** | 8:00 AM - 1:00 PM | 5 hours | Peak business hours |
| **Afternoon** | 1:00 PM - 6:00 PM | 5 hours | Continued business support |
| **Evening** | 6:00 PM - 11:00 PM | 5 hours | After-hours support |
| **Night** | 11:00 PM - 8:00 AM | 9 hours | Overnight coverage |

### Shift Features

- **Automated Scheduling**: Create recurring shifts using templates
- **Check-in/Check-out**: Support staff must start and end shifts
- **Overlap Handling**: Smooth transitions between shifts
- **No-show Detection**: Automatic detection and escalation of missed shifts
- **Backup Assignment**: Automatic notification of available staff for coverage

### Shift Status Flow

```
SCHEDULED → IN_PROGRESS → COMPLETED
    ↓           ↓
  MISSED    CANCELLED
```

## Auto-Routing System

### Routing Logic

1. **Priority-Based Assignment**
   - URGENT: Immediate assignment to on-duty staff
   - HIGH: Assignment within 5 minutes
   - MEDIUM: Assignment within 15 minutes
   - LOW: Assignment within 1 hour

2. **Load Balancing**
   - Round-robin assignment among available staff
   - Workload consideration (current active requests)
   - Skill-based routing (future enhancement)

3. **Escalation Rules**
   - Automatic escalation after response time thresholds
   - Priority elevation for overdue requests
   - Admin notification for critical issues

### Request Types

- **TECHNICAL_ISSUE**: Platform or app-related problems
- **ACCOUNT_SUPPORT**: User account and billing issues
- **THERAPY_RELATED**: Session or therapist-related queries
- **BILLING_INQUIRY**: Payment and subscription questions
- **GENERAL_INQUIRY**: General questions and feedback
- **EMERGENCY**: Critical issues requiring immediate attention

## Notification System

### Multi-Channel Notifications

#### SMS Notifications
- **30-minute shift reminder**: Sent 30 minutes before shift start
- **Support request assignment**: Immediate notification for new assignments
- **Urgent alerts**: Critical system notifications
- **Shift changes**: Notifications for schedule modifications

#### Email Notifications
- **10-minute shift reminder**: Sent 10 minutes before shift start
- **Detailed request information**: Comprehensive request details
- **Escalation notices**: Formal escalation documentation
- **Daily/weekly reports**: Performance and activity summaries

### Notification Timing

```
Shift Start Time: 8:00 AM
├── 7:30 AM: SMS Reminder (30 min before)
├── 7:50 AM: Email Reminder (10 min before)
├── 8:00 AM: Shift starts
└── 8:15 AM: No-show detection (if not checked in)
```

## API Endpoints

### Support Team Management

```http
# Register new support team member
POST /support/team/register
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "support@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "password": "securePassword123"
}

# Get all support team members
GET /support/team
Authorization: Bearer <token>

# Update team member status
PUT /support/team/{id}/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "isActive": false
}
```

### Shift Management

```http
# Create new shift
POST /support/shifts
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "assignedUserId": "user-uuid",
  "shiftType": "MORNING",
  "date": "2024-01-15",
  "startTime": "2024-01-15T08:00:00Z",
  "endTime": "2024-01-15T13:00:00Z"
}

# Get shifts with filtering
GET /support/shifts?status=SCHEDULED&date=2024-01-15
Authorization: Bearer <token>

# Start shift (check-in)
POST /support/shifts/{id}/start
Authorization: Bearer <support_token>

# End shift (check-out)
POST /support/shifts/{id}/end
Authorization: Bearer <support_token>
```

### Support Request Management

```http
# Create support request
POST /support/requests
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "requestType": "TECHNICAL_ISSUE",
  "priority": "HIGH",
  "subject": "Unable to join therapy session",
  "description": "Getting connection error when trying to join my scheduled session",
  "metadata": {
    "sessionId": "session-123",
    "errorCode": "CONN_FAILED"
  }
}

# Get assigned requests (for support team)
GET /support/requests/assigned
Authorization: Bearer <support_token>

# Take unassigned request
POST /support/requests/{id}/take
Authorization: Bearer <support_token>

# Update request status
PUT /support/requests/{id}
Authorization: Bearer <support_token>
Content-Type: application/json

{
  "status": "IN_PROGRESS",
  "internalNotes": "Investigating connection issue"
}
```

### Dashboard and Analytics

```http
# Get support dashboard
GET /support/dashboard
Authorization: Bearer <admin_token>

# Get personal dashboard (for support team)
GET /support/dashboard/my
Authorization: Bearer <support_token>

# Get routing status
GET /support/routing/status
Authorization: Bearer <admin_token>
```

## Database Schema

### Support Shift Entity

```typescript
@Entity('support_shifts')
export class SupportShift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  assignedUser: User;

  @Column({ type: 'enum', enum: ShiftType })
  shiftType: ShiftType;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({ type: 'enum', enum: ShiftStatus, default: ShiftStatus.SCHEDULED })
  status: ShiftStatus;

  @Column({ type: 'boolean', default: false })
  smsReminderSent: boolean;

  @Column({ type: 'boolean', default: false })
  emailReminderSent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  actualStartTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualEndTime: Date;
}
```

### Support Routing Entity

```typescript
@Entity('support_routing')
export class SupportRouting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  requestedBy: User;

  @ManyToOne(() => User, { nullable: true })
  assignedTo: User;

  @ManyToOne(() => SupportShift, { nullable: true })
  assignedShift: SupportShift;

  @Column({ type: 'enum', enum: RequestType })
  requestType: RequestType;

  @Column({ type: 'enum', enum: Priority })
  priority: Priority;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: RoutingStatus, default: RoutingStatus.PENDING })
  status: RoutingStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ type: 'timestamp', nullable: true })
  assignedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  firstResponseAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;
}
```

## Setup and Configuration

### Environment Variables

```bash
# SMS Configuration (Twilio example)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Email Configuration
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_api_key
FROM_EMAIL=support@mindlyf.com

# Support System Configuration
SUPPORT_AUTO_ROUTING_ENABLED=true
SUPPORT_MAX_CONCURRENT_REQUESTS=5
SUPPORT_ESCALATION_TIMEOUT_MINUTES=30
```

### Database Migration

```bash
# Run migrations to create support tables
npm run migration:run

# Generate new migration if schema changes
npm run migration:generate -- -n AddSupportTables
```

### Initial Setup

1. **Create Super Admin**
   ```bash
   npm run seed:super-admin
   ```

2. **Register Support Team Members**
   ```bash
   curl -X POST http://localhost:3000/support/team/register \
     -H "Authorization: Bearer <admin_token>" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "support1@mindlyf.com",
       "firstName": "Support",
       "lastName": "Agent",
       "phoneNumber": "+1234567890",
       "password": "SecurePass123!"
     }'
   ```

3. **Create Shift Templates**
   ```bash
   # Create recurring daily shifts
   curl -X POST http://localhost:3000/support/shifts/templates \
     -H "Authorization: Bearer <admin_token>" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Daily Morning Shift",
       "shiftType": "MORNING",
       "startTime": "08:00",
       "endTime": "13:00",
       "recurring": true,
       "daysOfWeek": [1,2,3,4,5]
     }'
   ```

## Usage Examples

### Typical Support Flow

1. **User Creates Request**
   ```javascript
   const response = await fetch('/support/requests', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${userToken}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       requestType: 'TECHNICAL_ISSUE',
       priority: 'HIGH',
       subject: 'Cannot access my account',
       description: 'Getting 500 error when trying to log in'
     })
   });
   ```

2. **Auto-Routing Assignment**
   - System automatically assigns to available support team member
   - SMS and email notifications sent to assigned agent
   - Request appears in agent's dashboard

3. **Support Agent Response**
   ```javascript
   // Agent takes the request
   await fetch(`/support/requests/${requestId}/take`, {
     method: 'POST',
     headers: { 'Authorization': `Bearer ${supportToken}` }
   });

   // Update with progress
   await fetch(`/support/requests/${requestId}`, {
     method: 'PUT',
     headers: {
       'Authorization': `Bearer ${supportToken}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       status: 'IN_PROGRESS',
       internalNotes: 'Checking user account status'
     })
   });
   ```

### Shift Management Example

```javascript
// Support agent starts their shift
const startShift = async (shiftId) => {
  try {
    const response = await fetch(`/support/shifts/${shiftId}/start`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${supportToken}` }
    });
    
    if (response.ok) {
      console.log('Shift started successfully');
      // Agent is now available for request assignment
    }
  } catch (error) {
    console.error('Failed to start shift:', error);
  }
};

// Admin creates weekly shifts
const createWeeklyShifts = async () => {
  const shifts = [
    { type: 'MORNING', userId: 'agent1-id' },
    { type: 'AFTERNOON', userId: 'agent2-id' },
    { type: 'EVENING', userId: 'agent3-id' },
    { type: 'NIGHT', userId: 'agent4-id' }
  ];

  for (let day = 0; day < 7; day++) {
    const date = new Date();
    date.setDate(date.getDate() + day);
    
    for (const shift of shifts) {
      await createShift({
        assignedUserId: shift.userId,
        shiftType: shift.type,
        date: date.toISOString().split('T')[0]
      });
    }
  }
};
```

## Security Considerations

### Authentication and Authorization

- **JWT-based authentication** for all API endpoints
- **Role-based access control** (RBAC) with strict permission checks
- **Request ownership validation** - users can only view their own requests
- **Admin-only operations** protected with additional validation

### Data Protection

- **Sensitive data encryption** for support request content
- **PII handling** with proper anonymization in logs
- **Audit trails** for all support actions and admin operations
- **Rate limiting** to prevent abuse of support endpoints

### Notification Security

- **Phone number validation** before sending SMS
- **Email verification** for notification preferences
- **Message content sanitization** to prevent injection attacks
- **Delivery confirmation** tracking for critical notifications

## Monitoring and Analytics

### Key Metrics

- **Response Time**: Average time to first response
- **Resolution Time**: Average time to resolve requests
- **Shift Coverage**: Percentage of shifts with assigned staff
- **No-show Rate**: Percentage of missed shifts
- **Request Volume**: Number of requests by type and priority
- **Agent Performance**: Individual agent statistics

### Dashboard Features

- **Real-time status** of active shifts and requests
- **Performance trends** over time
- **Workload distribution** among team members
- **Escalation tracking** and resolution rates
- **System health** monitoring for auto-routing

### Alerting

- **Critical request alerts** for urgent issues
- **Shift coverage gaps** notifications
- **System performance** degradation alerts
- **SLA breach** warnings and notifications

## Troubleshooting

### Common Issues

1. **Notifications Not Sending**
   - Check SMS/Email service configuration
   - Verify phone numbers and email addresses
   - Review service provider logs

2. **Auto-routing Not Working**
   - Verify routing service is enabled
   - Check for available support team members
   - Review shift schedules and coverage

3. **Shift Check-in Issues**
   - Ensure user has SUPPORT_TEAM role
   - Verify shift is in SCHEDULED status
   - Check for time zone configuration

### Logs and Debugging

```bash
# View support service logs
docker logs auth-service | grep "SupportService\|NotificationService"

# Check notification delivery
docker logs auth-service | grep "SMS\|Email" | tail -50

# Monitor auto-routing activity
docker logs auth-service | grep "AutoRouting" | tail -20
```

## Future Enhancements

- **Skill-based routing** for specialized support areas
- **Chat integration** for real-time support
- **Knowledge base** integration for self-service
- **AI-powered** request categorization and routing
- **Mobile app** for support team members
- **Advanced analytics** with machine learning insights
- **Multi-language support** for international operations
- **Integration** with external ticketing systems

---

## Support and Maintenance

For technical support or questions about the Support Team System:

- **Documentation**: This README and inline code comments
- **API Documentation**: Available at `/api/docs` when running the service
- **Issue Tracking**: Use the project's issue tracker for bugs and feature requests
- **Code Reviews**: All changes require review by senior team members

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Maintainer**: Backend Engineering Team