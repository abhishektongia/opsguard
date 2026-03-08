# OpsGuard - Deployment & Setup Guide

## Quick Start (Development)

Get OpsGuard running locally in 10 minutes:

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### 1. Clone & Install

```bash
cd ~/Documents/ATONGIA/IR-OPS/opsguard
npm install
```

### 2. Setup Environment Variables

Create `.env.local` file:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/opsguard"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-min-32-chars"

# OAuth (Optional - for Google/Microsoft login)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Integrations (Optional)
SLACK_CLIENT_ID="your-slack-client-id"
SLACK_CLIENT_SECRET="your-slack-client-secret"
NEXT_PUBLIC_SLACK_CLIENT_ID="your-slack-client-id"

# Stripe (Optional - for billing)
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# SendGrid (Optional - for email)
SENDGRID_API_KEY="SG.xxxxx"

# Socket.IO (Optional)
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Setup Database

Initialize PostgreSQL database:

```bash
# Create database
createdb opsguard

# Run Prisma migrations
npx prisma migrate dev --name init

# Seed with demo data
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
```

Server runs at `http://localhost:3000`

### 5. Access the App

1. Open browser to `http://localhost:3000`
2. Click "Sign Up"
3. Create test organization:
   - Email: `test@example.com`
   - Password: `test123456`
   - Organization: `Test Company`
   - Organization Slug: `test-company`
4. After signup, subdomain routing redirects to: `http://test-company.localhost:3000`

**For local subdomain routing to work**, add to `/etc/hosts` (macOS/Linux) or `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
127.0.0.1 localhost
127.0.0.1 test-company.localhost
127.0.0.1 *.localhost
```

## Running Tests

### Unit & Component Tests

```bash
# Run tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test -- --coverage
```

### E2E Tests

```bash
# Run Playwright tests
npm run test:e2e

# Run in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test e2e/app.spec.ts

# Debug mode
npx playwright test --debug
```

### API Testing with cURL

Test creating an alert:

```bash
curl -X POST http://localhost:3000/api/v1/alerts \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -H "x-org-slug: test-company" \
  -d '{
    "title": "Test Alert",
    "description": "This is a test alert",
    "severity": "P1",
    "source": "manual"
  }'
```

## Feature Testing Checklist

### ✅ Authentication
- [ ] Sign up with email
- [ ] Login with credentials
- [ ] Logout
- [ ] Multi-organization support (create second org)

### ✅ Alerts
- [ ] View alerts list with filtering
- [ ] Filter by severity (P1-P5)
- [ ] Filter by status (Open, Acknowledged, Resolved)
- [ ] Search alerts by title
- [ ] View alert details
- [ ] Acknowledge single alert
- [ ] Resolve alert with note
- [ ] Bulk acknowledge multiple alerts
- [ ] Bulk close alerts

### ✅ Incidents
- [ ] Create incident
- [ ] View incident list
- [ ] Filter incidents by status
- [ ] View incident details
- [ ] Add timeline entry
- [ ] Update incident status
- [ ] Link/unlink alerts

### ✅ Teams & Users
- [ ] Create team
- [ ] View team members
- [ ] Invite user to organization
- [ ] Change user role (Owner/Admin/Member/Viewer)
- [ ] View user directory

### ✅ On-Call Schedules
- [ ] Create on-call schedule
- [ ] Add rotation entries
- [ ] View current on-call person
- [ ] Edit/delete schedule

### ✅ Integrations
- [ ] View integrations catalog
- [ ] Enable Slack integration (if credentials available)
- [ ] Enable Microsoft Teams webhook
- [ ] Test webhook with sample payload
- [ ] Disable/delete integration

### ✅ Notifications
- [ ] Create notification rule
- [ ] Set severity triggers
- [ ] Configure notification channels
- [ ] Add escalation steps
- [ ] View notification logs
- [ ] Toggle rule enabled/disabled

### ✅ Billing
- [ ] View current plan information
- [ ] View plan comparison
- [ ] View invoices list
- [ ] Download invoice PDF

### ✅ Real-Time Features
- [ ] Open dashboard and alerts in two browser windows
- [ ] Create alert in one window
- [ ] See toast notification in other window
- [ ] Verify alert list updates automatically
- [ ] Check incident timeline updates in real-time

### ✅ Dashboard
- [ ] View KPI cards (Open Alerts, Active Incidents, MTTA, MTTR)
- [ ] View alert trend chart
- [ ] View active incidents
- [ ] View on-call widget
- [ ] View activity feed

## Production Deployment

### Prerequisites

- PostgreSQL hosted (AWS RDS, Azure Database, etc.)
- Node.js hosting (Vercel, Railway, Heroku, etc.)
- Redis for Socket.IO (optional but recommended)

### Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Then redeploy with: vercel --prod
```

### Manual Server Deployment

```bash
# Build
npm run build

# Start production server
npm start
```

### Environment Variables for Production

```bash
# Ensure all required vars are set:
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="<secure-random-32-chars>"

# Enable SSL
NODE_ENV="production"

# For Socket.IO with multiple instances, add Redis:
REDIS_URL="redis://..."
```

### Database Backup

```bash
# Backup PostgreSQL
pg_dump opsguard > backup.sql

# Restore
psql opsguard < backup.sql
```

## Troubleshooting

### Issue: Subdomain not working

**Solution:** Add wildcard entry to hosts file or configure DNS CNAME wildcard.

### Issue: Database connection error

```bash
# Check DATABASE_URL format:
# postgresql://user:password@host:5432/database

# Test connection:
psql $DATABASE_URL -c "SELECT 1"
```

### Issue: Socket.IO connection failing

```bash
# Check NEXTAUTH_SECRET is set and same across all servers
# Verify Socket.IO server is running on correct port
# Check browser console for connection errors
```

### Issue: Migrations failed

```bash
# Reset database (WARNING: deletes data)
npx prisma migrate reset

# Or manually rollback:
npx prisma migrate resolve --rolled-back "<migration-name>"
```

### Issue: Tests failing

```bash
# Clear Jest cache
npm run test -- --clearCache

# Clear Playwright browsers
npx playwright install

# Run with verbose output
npm run test -- --verbose
```

## Performance Optimization

### Database Indexing

Indexes are created automatically via Prisma migrations. Monitor slow queries:

```sql
-- Check slow query log
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Caching

React Query provides client-side caching. Configure cache time:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});
```

### Asset Optimization

Next.js automatically optimizes assets. Monitor bundle size:

```bash
npm run build
# Check .next/static for bundle size
```

## Security Checklist

- [ ] NEXTAUTH_SECRET is random and secure (32+ chars)
- [ ] DATABASE_URL uses secure connection (SSL)
- [ ] API routes validate user authorization
- [ ] Row-Level Security (RLS) enabled on database
- [ ] CORS properly configured
- [ ] Rate limiting enabled on API routes
- [ ] Sensitive environment variables not in code
- [ ] HTTPS enforced in production
- [ ] Regular security updates (npm audit)

## Monitoring & Logging

### View Application Logs

```bash
# Development
npm run dev # Logs to console

# Production
logs=$(pm2 logs opsguard)
echo $logs
```

### Monitor Database

```bash
# Check active connections
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;

# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables WHERE schemaname not in ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Support & Documentation

- **API Docs:** See `API_DOCUMENTATION.md`
- **Real-Time Guide:** See `REAL_TIME_GUIDE.md`
- **Implementation:** See `IMPLEMENTATION_SUMMARY.md`
- **GitHub Issues:** Report bugs at https://github.com/yourusername/opsguard/issues

## Next Steps

1. ✅ Complete setup (read above)
2. ✅ Run all tests
3. ✅ Test features manually (use checklist)
4. ✅ Configure production environment
5. ✅ Deploy to staging
6. ✅ Load testing
7. ✅ Security audit
8. ✅ Deploy to production
