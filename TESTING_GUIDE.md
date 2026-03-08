# OpsGuard - Feature Testing Guide

This guide provides step-by-step instructions to test each feature of the OpsGuard incident response system.

---

## Table of Contents

1. [Setup & Prerequisites](#setup--prerequisites)
2. [Phase 8-10: Core Features Test](#phase-8-10-core-features-test)
3. [Phase 11: On-Call Schedules Test](#phase-11-on-call-schedules-test)
4. [Phase 12: Integrations Test](#phase-12-integrations-test)
5. [Phase 13: Notifications Test](#phase-13-notifications-test)
6. [Phase 14: Billing Test](#phase-14-billing-test)
7. [Phase 15: Email Ingestion Test](#phase-15-email-ingestion-test)
8. [Phase 16: Real-Time Updates Test](#phase-16-real-time-updates-test)
9. [End-to-End Flow Test](#end-to-end-flow-test)

---

## Setup & Prerequisites

### 1. Install Dependencies

```bash
cd "c:\Users\abhishekt\Documents\ATONGIA\IR-OPS\opsguard"
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and configure:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random string for session encryption
- `NEXTAUTH_URL` - http://localhost:3000 for development
- `GITHUB_ID` / `GITHUB_SECRET` - For OAuth (optional)

### 3. Database Setup

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 4. Start Dev Server

```bash
npm run dev
```

Access: http://localhost:3000

---

## Phase 8-10: Core Features Test

### Alert Management

**Test 1: View Alert List**
1. Login: alice@demo.local / password123
2. Navigate to: Alerts
3. Verify: See list of 50 seeded alerts
4. **Expected:** Alerts displayed in table format with severity badges

**Test 2: Filter Alerts**
1. In Alerts page, use filters:
   - Status: Filter by "OPEN"
   - Severity: Filter by "P1"
   - Team: Select a specific team
2. **Expected:** Alerts filtered accordingly

**Test 3: Alert Detail View**
1. Click on any alert in the list
2. Verify: Alert detail page loads with:
   - Title, description, severity
   - Status, source, created date
   - Tabs: Details, Timeline, Activity, Related
3. **Expected:** All information displayed correctly

**Test 4: Acknowledge Alert**
1. In alert detail, click "Acknowledge" button
2. Verify: Status changes to "ACKNOWLEDGED"
3. **Expected:** Button changes to "Acknowledged" with timestamp

**Test 5: Resolve Alert**
1. In alert detail, click "Resolve" button
2. Verify: Status changes to "RESOLVED"
3. **Expected:** Cannot acknowledge after resolving

**Test 6: Assign Alert**
1. In alert list, select multiple alerts
2. Click bulk action "Assign to"
3. Select a user
4. **Expected:** All selected alerts assigned to user

### Incident Management

**Test 7: Create Incident**
1. Navigate to: Incidents
2. Click "New Incident"
3. Fill form:
   - Title: "Server Database Down"
   - Severity: P1
   - Link alerts: Select 3 alerts
4. Click "Create"
5. **Expected:** Incident created and visible in list

**Test 8: View Incident Detail**
1. Click on any incident
2. Verify tabs: Timeline, Communication, Postmortem
3. Add update in Timeline tab
4. **Expected:** Update appears in timeline with timestamp

**Test 9: Update Incident Status**
1. In incident detail, change status dropdown
2. Select "Resolved"
3. **Expected:** Status updates, timeline entry created

---

## Phase 11: On-Call Schedules Test

### Schedule Management

**Test 10: Create Schedule**
1. Navigate to: On-Call Schedules
2. Click "Create Schedule"
3. Fill form:
   - Name: "Backend Team Weekly"
   - Team: Select "Backend"
   - Timezone: "America/New_York"
   - Rotation Type: "WEEKLY"
4. Add rotation:
   - User: Select a user
   - Start: Next Monday
   - End: Next Sunday
5. Click "Create Schedule"
6. **Expected:** Schedule appears in list with "ON-CALL NOW" if current week

**Test 11: View Schedule Detail**
1. Click on schedule name or "Edit" button
2. Verify detail page shows:
   - Schedule name, team, timezone
   - All rotations with date ranges
   - Duration in days
3. **Expected:** All info displayed correctly

**Test 12: Edit Schedule**
1. In schedule detail, click "Edit"
2. Change timezone to "Europe/London"
3. Click "Save Changes"
4. Verify: Timezone updated and saved
5. **Expected:** Breadcrumb navigation works, changes persist

**Test 13: Delete Schedule**
1. In schedule list, click delete icon
2. Confirm deletion
3. **Expected:** Schedule removed from list, rotations deleted

**Test 14: Query On-Call Now**
1. Call API: `GET /api/v1/schedules/oncall-now`
2. **Expected:** Returns user on-call for current time

---

## Phase 12: Integrations Test

### Integration Management

**Test 15: View Integrations**
1. Navigate to: Integrations
2. Verify: Shows available integrations by category
3. **Expected:** Displays 11+ integration templates

**Test 16: Create Custom Webhook**
1. Scroll to "Available Integrations"
2. Find and click "Custom Webhook"
3. Fill form:
   - Name: "Prometheus Alerts"
   - Description: "Alerts from Prometheus"
4. Configure field mapping:
   - Title field: "alert.labels.alertname"
   - Severity field: "alert.labels.severity"
5. Click "Create"
6. **Expected:** Integration created, webhook URL generated

**Test 17: Test Webhook**
1. In integration detail, click "Test Integration"
2. Should show form to test webhook
3. **Expected:** Test endpoint available

**Test 18: Configure Slack Integration**
1. Find and click "Slack" (if setup available)
2. Verify OAuth flow or webhook input
3. **Expected:** Setup wizard loads

---

## Phase 13: Notifications Test

### Notification Rules

**Test 19: Create Notification Rule**
1. Navigate to: Notifications
2. Click "New Rule"
3. Fill form:
   - Name: "Critical Alerts"
   - Trigger: Severity
   - Severities: P1, P2
   - Channels: Email, Slack
   - Delay: 0 minutes
   - Repeat: Never
4. Click "Create Rule"
5. **Expected:** Rule appears in Rules list

**Test 20: View Notification Logs**
1. In Notifications page, click "Activity Log" tab
2. View notification history
3. **Expected:** Shows status (sent, pending, failed) and timestamps

**Test 21: Disable Rule**
1. In Rules list, click toggle to disable a rule
2. Verify: Rule shows as disabled
3. **Expected:** Toggle reflects state

**Test 22: Delete Rule**
1. Click delete icon on a rule
2. Confirm deletion
3. **Expected:** Rule removed from list

---

## Phase 14: Billing Test

### Billing & Subscription

**Test 23: View Billing Page**
1. Navigate to: Billing
2. Verify displays:
   - Current plan (should be "Free")
   - Plan details and price
   - Feature list
   - Plan comparison table
3. **Expected:** All information visible

**Test 24: View Invoices**
1. Scroll to Invoices section
2. Verify: Shows seeded invoices
3. **Expected:** Invoice history displayed with dates and amounts

**Test 25: Upgrade Plan Flow**
1. Click "Upgrade to Starter"
2. Verify: Redirect to Stripe checkout (or mock) initiated
3. **Expected:** Checkout URL generated

---

## Phase 15: Email Ingestion Test

### Email Alert Creation

**Test 26: Send Test Email**
1. Configure email provider (SendGrid in production)
2. Send email to: `alerts@demo.opsguard.com`
   - Subject: "CRITICAL: Database CPU at 95%"
   - Body: "High CPU usage detected on production database"
3. **Expected:** Alert created automatically

**Test 27: Verify Alert from Email**
1. Navigate to Alerts
2. Find alert created from email
3. Verify:
   - Title from subject
   - Description from body
   - Severity auto-detected as P1 (from CRITICAL keyword)
   - Source: "email"
4. **Expected:** Alert properly parsed and created

---

## Phase 16: Real-Time Updates Test

### Socket.IO Real-Time Events

**Test 28: Test Alert Real-Time Update**
1. Open Alerts page in two browser tabs
2. In tab 1, acknowledge an alert
3. In tab 2, watch for update without refresh
4. **Expected:** Alert updates in real-time in tab 2

**Test 29: Test Incident Real-Time Update**
1. Open Incident detail in two browser tabs
2. In tab 1, add a timeline update
3. In tab 2, watch for new timeline entry without refresh
4. **Expected:** Timeline updates in real-time

**Test 30: Connection Status**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter for "ws" (WebSocket)
4. Verify: WebSocket connection established
5. **Expected:** Socket.IO connection shows as open

---

## End-to-End Flow Test

### Complete Alert-to-Resolution Workflow

**Test 31: Complete Alert Lifecycle**

```
Step 1: Alert Creation
└─ Navigate to Alerts
└─ Create new alert with form (or via webhook)
└─ Verify alert appears in list

Step 2: Alert Acknowledgement
└─ Select alert from list
└─ Click "Acknowledge"
└─ Verify status changes and real-time broadcast

Step 3: Incident Linking
└─ Navigate to Incidents
└─ Create new incident
└─ Link the alert
└─ Verify linked alerts displayed

Step 4: Timeline Update
└─ In incident detail, add update
└─ Verify update appears in timeline
└─ Check real-time broadcast to other users

Step 5: Escalation via Notification
└─ Verify notification rule triggered
└─ Check notification log
└─ Verify channel selected (email/Slack)

Step 6: Incident Resolution
└─ Update incident status to "Resolved"
└─ Verify timestamp recorded
└─ Verify audit log created

Step 7: Post-Mortem
└─ In incident detail, fill postmortem
└─ Verify text saved
└─ Verify can be viewed and edited
```

**Expected Results:**
- All status changes reflected in real-time
- Audit logs created for all actions
- Notifications sent to appropriate users
- Timelines accurately recorded

---

## API Testing with cURL

### Test Alert API

```bash
# List alerts
curl "http://localhost:3000/api/v1/alerts" \
  -H "Authorization: Bearer {token}"

# Create alert
curl -X POST "http://localhost:3000/api/v1/alerts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "title": "Test Alert",
    "severity": "P2",
    "description": "Test description"
  }'

# Acknowledge alert
curl -X POST "http://localhost:3000/api/v1/alerts/{alertId}/acknowledge" \
  -H "Authorization: Bearer {token}"

# Bulk operations
curl -X POST "http://localhost:3000/api/v1/alerts/bulk" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "alertIds": ["id1", "id2"],
    "action": "acknowledge"
  }'
```

### Test Schedule API

```bash
# List schedules
curl "http://localhost:3000/api/v1/schedules" \
  -H "Authorization: Bearer {token}"

# Get schedule detail
curl "http://localhost:3000/api/v1/schedules/{scheduleId}" \
  -H "Authorization: Bearer {token}"

# Update schedule
curl -X PATCH "http://localhost:3000/api/v1/schedules/{scheduleId}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "Updated Name",
    "timezone": "Europe/London"
  }'

# Delete schedule
curl -X DELETE "http://localhost:3000/api/v1/schedules/{scheduleId}" \
  -H "Authorization: Bearer {token}"
```

---

## Debugging Tips

### Enable Detailed Logging

In `.env.local`:
```bash
DEBUG=opsguard:* # Enable debug logging
PRISMA_LOG=query # Log database queries
```

### Check Database

```bash
npm run prisma:studio
```

Opens Prisma Studio at http://localhost:5555

### Monitor WebSocket

1. Open DevTools (F12)
2. Go to Console tab
3. Type `localStorage.getItem('socket-debug')` to check Socket.IO state
4. Look for socket events in Network > WS tab

---

## Troubleshooting

### Issue: "Unauthorized" on API calls
**Solution:** Ensure session is active (login first) and token is valid

### Issue: Real-time updates not working
**Solution:**
- Check WebSocket connection in DevTools
- Verify Socket.IO server is running
- Check NEXTAUTH_URL in .env.local

### Issue: Alerts not being created from emails
**Solution:**
- Verify integration is enabled
- Check email recipient address format
- Review email parsing logic

### Issue: Schedule doesn't update
**Solution:**
- Verify all rotations have valid dates
- Check organization slug in URL matches
- Verify user has permission to edit

---

## Success Criteria

All features complete when:

✅ All 17 phases fully functional
✅ Real-time updates working across browsers
✅ API endpoints responsive
✅ Database operations successful
✅ Audit logging recording actions
✅ No console errors in DevTools
✅ Authentication flow working
✅ Multi-tab synchronization working

---

## Next Steps After Testing

1. **If all tests pass:**
   - Deploy to staging environment
   - Run load testing
   - Perform security audit
   - Deploy to production

2. **If issues found:**
   - Document issues in GitHub
   - Prioritize by severity
   - Fix and re-test
   - Update documentation

---

## Support

For questions or issues:
1. Check the DEPLOYMENT.md guide
2. Review API_DOCUMENTATION.md
3. Check REAL_TIME_GUIDE.md for Socket.IO issues
4. Review IMPLEMENTATION_COMPLETE.md for feature details
