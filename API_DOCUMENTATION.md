# OpsGuard API Documentation

## Base URL

```
https://api.opsguard.com/api/v1
```

For local development:
```
http://localhost:3000/api/v1
```

## Authentication

All API requests require authentication via JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

Obtain a token by logging in or signing up.

## Multi-Tenancy

All requests are scoped to an organization via subdomain routing:
- `https://acme.opsguard.com` - routes to organization with slug `acme`
- Organization context is injected via `x-org-slug` header in development

## Response Format

All responses return JSON in the following format:

```json
{
  "data": {},
  "error": null,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

Error responses:
```json
{
  "error": "Error message",
  "status": 400
}
```

## Alerts API

### GET /alerts

Fetch paginated list of alerts with filtering.

**Query Parameters:**
- `page` (number, default: 1) - Page number for pagination
- `pageSize` (number, default: 20) - Alerts per page
- `status` (string[]) - Filter by status: OPEN, ACK, RESOLVED, CLOSED
- `severity` (string[]) - Filter by severity: P1, P2, P3, P4, P5
- `search` (string) - Search in title and description
- `source` (string) - Filter by alert source
- `team` (string) - Filter by assigned team
- `assignee` (string) - Filter by assigned user

**Example:**
```bash
curl -H "Authorization: Bearer <token>" \
  "https://acme.opsguard.com/api/v1/alerts?page=1&severity=P1&severity=P2&status=OPEN"
```

**Response:**
```json
{
  "alerts": [
    {
      "id": "alert-123",
      "title": "High CPU Usage",
      "description": "CPU exceeded 90% threshold",
      "severity": "P1",
      "status": "OPEN",
      "source": "datadog",
      "createdAt": "2024-01-01T10:00:00Z",
      "ackedAt": null,
      "resolvedAt": null,
      "assignedTo": null,
      "assignedTeam": null,
      "tags": ["prod", "cpu"]
    }
  ],
  "totalCount": 42,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3
}
```

### POST /alerts

Create a new alert.

**Request Body:**
```json
{
  "title": "Database Connection Failed",
  "description": "Failed to connect to primary database",
  "severity": "P1",
  "source": "monitoring",
  "rawPayload": {}
}
```

**Response:** (201 Created)
```json
{
  "id": "alert-124",
  "title": "Database Connection Failed",
  "severity": "P1",
  "status": "OPEN",
  "createdAt": "2024-01-01T10:05:00Z"
}
```

### GET /alerts/:id

Fetch a specific alert with full details.

**Response:**
```json
{
  "id": "alert-123",
  "title": "High CPU Usage",
  "description": "CPU exceeded 90% threshold",
  "severity": "P1",
  "status": "OPEN",
  "source": "datadog",
  "createdAt": "2024-01-01T10:00:00Z",
  "assignedTo": {
    "id": "user-1",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "assignedTeam": {
    "id": "team-1",
    "name": "DevOps"
  },
  "linkedIncidents": ["incident-1", "incident-2"],
  "timeline": [
    {
      "timestamp": "2024-01-01T10:00:00Z",
      "type": "created",
      "message": "Alert created",
      "by": "system"
    },
    {
      "timestamp": "2024-01-01T10:05:00Z",
      "type": "acknowledged",
      "message": "Acknowledged by John Doe",
      "by": "John Doe"
    }
  ]
}
```

### PATCH /alerts/:id

Update an alert.

**Request Body:**
```json
{
  "status": "ACK",
  "assignedToId": "user-1",
  "assignedTeamId": "team-1"
}
```

### POST /alerts/:id/acknowledge

Acknowledge an alert.

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "id": "alert-123",
  "status": "ACK",
  "ackedAt": "2024-01-01T10:10:00Z"
}
```

### POST /alerts/:id/resolve

Resolve an alert.

**Request Body:**
```json
{
  "resolutionNote": "Issue was caused by database migration"
}
```

## Incidents API

### GET /incidents

Fetch paginated list of incidents.

**Query Parameters:**
- `page` (number, default: 1)
- `pageSize` (number, default: 20)
- `status` (string) - INVESTIGATING, IDENTIFIED, MONITORING, RESOLVED

**Response:**
```json
{
  "incidents": [
    {
      "id": "incident-1",
      "title": "Database Outage",
      "severity": "P1",
      "status": "INVESTIGATING",
      "createdAt": "2024-01-01T10:00:00Z",
      "responders": [
        {
          "id": "user-1",
          "name": "John Doe"
        }
      ],
      "teams": ["DevOps"],
      "linkedAlertCount": 5,
      "timelineCount": 3
    }
  ],
  "totalCount": 12,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1
}
```

### POST /incidents

Create a new incident.

**Request Body:**
```json
{
  "title": "Network Latency Issue",
  "description": "Users reporting slow response times",
  "severity": "P2",
  "linkedAlertIds": ["alert-1", "alert-2"]
}
```

### POST /incidents/:id/timeline

Add timeline entry to incident.

**Request Body:**
```json
{
  "message": "Root cause identified: ISP routing issue"
}
```

### PATCH /incidents/:id

Update incident.

**Request Body:**
```json
{
  "status": "IDENTIFIED",
  "responderIds": ["user-1", "user-2"]
}
```

## Teams API

### GET /teams

Fetch all teams in organization.

**Response:**
```json
{
  "teams": [
    {
      "id": "team-1",
      "name": "DevOps",
      "description": "Infrastructure and operations",
      "memberCount": 5,
      "members": [
        {
          "id": "user-1",
          "name": "John Doe",
          "role": "OWNER"
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /teams

Create a new team.

**Request Body:**
```json
{
  "name": "Platform",
  "description": "Platform and infrastructure"
}
```

### DELETE /teams/:id

Delete a team.

## Users API

### GET /users

Fetch all users in organization.

**Query Parameters:**
- `page` (number, default: 1)
- `pageSize` (number, default: 20)

**Response:**
```json
{
  "users": [
    {
      "id": "user-1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "OWNER",
      "teams": ["team-1"],
      "lastActive": "2024-01-01T10:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "totalCount": 5
}
```

### POST /users

Invite a user to organization.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "role": "MEMBER"
}
```

### GET /users/me

Get current authenticated user.

**Response:**
```json
{
  "id": "user-1",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "OWNER",
  "organization": {
    "id": "org-1",
    "name": "Acme Corp",
    "slug": "acme"
  },
  "teams": [
    {
      "id": "team-1",
      "name": "DevOps"
    }
  ]
}
```

## On-Call Schedules API

### GET /schedules

Fetch all on-call schedules.

**Response:**
```json
{
  "schedules": [
    {
      "id": "schedule-1",
      "name": "DevOps On-Call",
      "team": "DevOps",
      "timezone": "America/New_York",
      "rotationType": "WEEKLY",
      "rotations": [
        {
          "id": "rotation-1",
          "user": {
            "id": "user-1",
            "name": "John Doe"
          },
          "startTime": "2024-01-01T09:00:00Z",
          "endTime": "2024-01-08T09:00:00Z"
        }
      ]
    }
  ]
}
```

### POST /schedules

Create on-call schedule.

**Request Body:**
```json
{
  "name": "Support On-Call",
  "teamId": "team-1",
  "timezone": "UTC",
  "rotationType": "DAILY",
  "rotations": [
    {
      "userId": "user-1",
      "startTime": "2024-01-01T00:00:00Z",
      "endTime": "2024-01-02T00:00:00Z"
    }
  ]
}
```

### GET /schedules/oncall-now

Get current on-call person for all schedules.

**Response:**
```json
{
  "schedules": [
    {
      "id": "schedule-1",
      "name": "DevOps On-Call",
      "team": "DevOps",
      "currentOncall": {
        "user": {
          "id": "user-1",
          "name": "John Doe"
        },
        "startTime": "2024-01-01T09:00:00Z",
        "endTime": "2024-01-02T09:00:00Z"
      }
    }
  ]
}
```

## Integrations API

### GET /integrations

List all integrations.

**Response:**
```json
{
  "integrations": [
    {
      "id": "integration-1",
      "type": "SLACK",
      "name": "Slack Workspace",
      "description": "Send alerts to #alerts channel",
      "enabled": true,
      "webhookUrl": "/api/v1/webhooks/integration-1",
      "config": {
        "channelMapping": {
          "P1": "#critical",
          "P2": "#warnings"
        }
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /integrations/:id/test

Test an integration.

**Request Body:**
```json
{
  "type": "SLACK",
  "payload": {
    "title": "Test Alert",
    "severity": "P1"
  }
}
```

## Notification Rules API

### GET /notifications/rules

List notification rules.

**Response:**
```json
{
  "rules": [
    {
      "id": "rule-1",
      "name": "P1 Alerts to Email",
      "trigger": "severity",
      "severities": ["P1"],
      "channels": ["email"],
      "delayMinutes": 0,
      "repeatInterval": 0,
      "enabled": true,
      "escalationSteps": [],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /notifications/rules

Create notification rule.

**Request Body:**
```json
{
  "name": "Critical Alerts - Escalation",
  "trigger": "severity",
  "severities": ["P1"],
  "channels": ["email", "sms", "phone"],
  "delayMinutes": 0,
  "repeatMinutes": 15,
  "escalationSteps": [
    {
      "delayMinutes": 15,
      "targetType": "team",
      "targetTeamId": "team-1"
    }
  ]
}
```

## Billing API

### GET /billing/subscription

Get current subscription details.

**Response:**
```json
{
  "plan": "pro",
  "status": "active",
  "seats": 5,
  "currentPeriodStart": "2024-01-01T00:00:00Z",
  "currentPeriodEnd": "2024-02-01T00:00:00Z",
  "stripeCustomerId": "cus_123",
  "stripeSubscriptionId": "sub_123"
}
```

### GET /billing/invoices

List invoices.

**Query Parameters:**
- `limit` (number, default: 20)
- `offset` (number, default: 0)

**Response:**
```json
{
  "invoices": [
    {
      "id": "inv_123",
      "date": "2024-01-01T00:00:00Z",
      "amount": 299,
      "status": "paid",
      "pdfUrl": "https://..."
    }
  ],
  "total": 12
}
```

## Webhook Integration

### POST /api/v1/webhooks/:integrationId

Inbound webhook for integrations like Datadog, Grafana, etc.

**Request Body:**
```json
{
  "alert": {
    "title": "High Memory Usage",
    "description": "Memory usage exceeded 95%",
    "severity": "critical"
  }
}
```

**Response:** (201 Created)
```json
{
  "success": true,
  "alertId": "alert-125",
  "severity": "P1"
}
```

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

## Pagination

Paginated endpoints use offset-based pagination:

```json
{
  "data": [],
  "page": 1,
  "pageSize": 20,
  "totalCount": 100,
  "totalPages": 5
}
```

Navigate using `page` parameter:
```
GET /alerts?page=2&pageSize=20
```

## Rate Limiting

API is rate limited to:
- **100 requests per minute** for authenticated users
- **10 requests per minute** for public endpoints

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067260
```

## WebHook Events

Subscribe to real-time events via Socket.IO. See `REAL_TIME_GUIDE.md` for details.

Event types:
- `alert:created`
-`alert:updated`
- `alert:acknowledged`
- `alert:resolved`
- `incident:created`
- `incident:updated`
- `incident:timeline-entry`
- `notification:sent`
