# OpsGuard - Production-Ready Incident Management Platform

## Project Status

### ✅ Completed Phases

#### Phase 1: Project Setup
- Next.js 14 project structure with TypeScript
- All configuration files (tsconfig, tailwind, postcss, next.config)
- Folder organization with 20+ directories
- Dependencies installed in package.json

#### Phase 2: Database Schema
- Complete Prisma schema with 12+ tables:
  - Organizations, Users, Teams, TeamMembers
  - Alerts, Incidents, OnCallSchedules, OnCallRotations
  - Integrations, NotificationRules/Logs, AuditLogs, BillingSubscriptions
- Row-Level Security (RLS) policies documented
- Support for multi-tenancy via org_id

#### Phase 3: Seed Data
- Demo organization (demo.opsguard.com)
- 10 demo users across 3 teams (DevOps, Backend, Frontend)
- 3 on-call schedules with weekly rotations
- 50 sample alerts in various states (P1-P5, all statuses)
- 5 active incidents with timelines and postmortems
- 4 pre-configured integrations (Slack, Datadog, Email, Custom)
- Billing subscription (PRO plan, 10 seats)
- Notification rules and audit logs

#### Phase 4-5: Authentication & Onboarding
- NextAuth.js setup with JWT strategy
- Email/Password + Google OAuth support
- `/api/auth/[...nextauth]` - Authentication endpoints
- `/login` - Login page with credentials & OAuth buttons
- `/signup` - Signup with org creation & slug validation
- `/api/v1/auth/signup` - Create org + user
- `/api/v1/auth/verify-slug` - Check slug availability

#### Phase 6: Core Layout & Navigation
- `Sidebar.tsx` - Collapsible sidebar with navigation items
- `Header.tsx` - Search bar, notifications, org name display
- `/[subdomain]/layout.tsx` - Workspace layout with RLS verification
- Multi-tenant routing via subdomain (acme.opsguard.com)
- User session validation and org membership checks

### 🚀 In Progress / To Do

#### Phase 7: Dashboard
- [ ] KPI cards (Open Alerts, Active Incidents, MTTA, MTTR)
- [ ] Alert trend chart (7/30 day views)
- [ ] Active incidents panel
- [ ] On-call now widget
- [ ] Activity feed with real-time updates

#### Phase 8: Alerts Feature
- [ ] Alert list with filters, sorting, pagination
- [ ] Alert detail view with tabs (Details, Timeline, Activity, Related Incidents)
- [ ] Bulk actions (Acknowledge, Assign, Close, Merge)
- [ ] Comments with @mentions
- [ ] Real-time updates

#### Phase 9: Incidents Feature
- [ ] Incident list view
- [ ] Incident detail with status management
- [ ] Responders panel
- [ ] Timeline tab with collaborative updates
- [ ] Communication tab (Slack/Teams integration)
- [ ] Postmortem editor

#### Phase 10: Teams & Users
- [ ] Team management (create, edit, delete)
- [ ] User directory with roles
- [ ] Invite users with email
- [ ] User profile page

#### Phase 11: On-Call Schedules
- [ ] Schedule list view
- [ ] Schedule builder with drag-drop rotations
- [ ] Calendar view
- [ ] Override management
- [ ] "Who is on-call now" API

#### Phase 12: Integrations
- [ ] Integration catalog grid
- [ ] Slack OAuth setup wizard
- [ ] Microsoft Teams webhook setup
- [ ] Datadog/Grafana/Prometheus field mapping
- [ ] Custom webhook JSONPath mapping
- [ ] Integration management & webhooks

#### Phase 13: Notifications
- [ ] Notification rules builder
- [ ] Escalation policy configuration
- [ ] Notification log viewer
- [ ] BullMQ + Redis queue setup
- [ ] SMS/Email/Call/Slack delivery

#### Phase 14: Billing
- [ ] Stripe integration
- [ ] Plan comparison table
- [ ] Subscription management
- [ ] Invoice history
- [ ] Payment method management

#### Phase 15: Email Ingestion
- [ ] SendGrid inbound parse webhook
- [ ] Email parsing (subject → title, body → description)
- [ ] Severity auto-detection from email keywords
- [ ] Alert creation from emails

#### Phase 16: Real-Time Updates
- [ ] Socket.IO setup
- [ ] WebSocket events for alerts/incidents
- [ ] Real-time alert notifications
- [ ] Live timeline updates

#### Phase 17: Testing & Polish
- [ ] Unit tests (Jest + React Testing Library)
- [ ] E2E tests (Playwright)
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Empty states & loading skeletons
- [ ] Error boundaries
- [ ] Responsive design refinement

---

## Quick Start

### Prerequisites
- Node 18+ and npm/yarn
- PostgreSQL (local or remote)
- Redis (for job queue)
- Stripe account (for billing)
- SendGrid account (for email)

### Local Development

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your database URL and API keys

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed demo data
npm run prisma:seed

# Start dev server
npm run dev
```

Visit `http://localhost:3000` or `http://demo.localhost:3000:3000`

**Demo Credentials:**
- Email: `alice@demo.local`
- Password: `password123`

### Database

```bash
# Open Prisma Studio
npm run prisma:studio

# Run migrations
npm run prisma:migrate

# Generate new migration
npm run prisma:migrate -- --name migration_name
```

---

## Architecture Highlights

### Multi-Tenancy
- **Subdomain-based**: `{org-slug}.opsguard.com`
- **Automatic org_id injection** via Next.js middleware
- **Row-Level Security (RLS)** on all org-scoped tables
- **Complete data isolation** at database level

### Authentication
- NextAuth.js with JWT strategy
- Support for Email/Password, Google OAuth, Microsoft OAuth
- Automatic org context injection into session
- Protected API routes with org verification

### Database Design
- Prisma ORM with TypeScript
- PostgreSQL with RLS policies
- Soft-delete support via timestamps
- JSONB columns for flexible config storage
- Audit logging on all operations

### Real-Time Features
- WebSocket support via Socket.IO (ready for implementation)
- Event broadcasting to org members
- Automatic refresh for alerts/incidents/schedules
- Notification delivery tracking

---

## File Structure Created

```
opsguard/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx ✅
│   │   │   ├── signup/page.tsx ✅
│   │   │   └── layout.tsx ✅
│   │   ├── (workspace)/
│   │   │   └── [subdomain]/
│   │   │       ├── layout.tsx ✅
│   │   │       ├── dashboard/page.tsx (WIP)
│   │   │       ├── alerts/ (TODO)
│   │   │       ├── incidents/ (TODO)
│   │   │       ├── teams/ (TODO)
│   │   │       ├── users/ (TODO)
│   │   │       ├── on-call/ (TODO)
│   │   │       ├── integrations/ (TODO)
│   │   │       └── settings/ (TODO)
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts ✅
│   │   │   └── v1/
│   │   │       ├── auth/signup/route.ts ✅
│   │   │       ├── auth/verify-slug/route.ts ✅
│   │   │       ├── alerts/ (TODO)
│   │   │       ├── incidents/ (TODO)
│   │   │       ├── teams/ (TODO)
│   │   │       └── ...
│   │   ├── page.tsx ✅ (landing)
│   │   ├── layout.tsx ✅
│   │   └── providers.tsx ✅
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Sidebar.tsx ✅
│   │   │   ├── Header.tsx ✅
│   │   │   └── Navbar.tsx (TODO)
│   │   ├── Dashboard/ (TODO)
│   │   ├── Alerts/ (TODO)
│   │   ├── Incidents/ (TODO)
│   │   ├── OnCall/ (TODO)
│   │   ├── Integrations/ (TODO)
│   │   └── ...
│   ├── lib/
│   │   ├── auth/
│   │   │   └── next-auth.config.ts ✅
│   │   ├── db/
│   │   │   ├── prisma.ts ✅
│   │   │   └── rls.ts ✅
│   │   ├── utils/
│   │   │   ├── severity.ts ✅
│   │   │   └── formatting.ts ✅
│   │   ├── constants/
│   │   │   └── index.ts ✅
│   │   └── ...
│   ├── hooks/ (TODO)
│   ├── stores/ (TODO)
│   ├── styles/
│   │   └── globals.css ✅
│   └── middleware.ts ✅
├── prisma/
│   ├── schema.prisma ✅
│   └── seed.ts ✅
├── public/
├── .env.example ✅
├── .gitignore ✅
├── tailwind.config.ts ✅
├── tsconfig.json ✅
├── next.config.js ✅
├── postcss.config.js ✅
├── package.json ✅
└── README.md (this file)
```

---

## Next Steps

1. **Install dependencies**: `npm install` (requires internet, may need npm auth setup)
2. **Configure .env.local** with database and API keys
3. **Run migrations**: `npm run prisma:migrate`
4. **Seed demo data**: `npm run prisma:seed`
5. **Start dev server**: `npm run dev`
6. **Access the app**: `http://demo.localhost:3000`
7. **Continue with Phase 7** - Dashboard implementation

---

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **State**: Zustand, React Query
- **Backend**: Next.js API Routes, Express (optional)
- **Database**: PostgreSQL, Prisma ORM
- **Auth**: NextAuth.js
- **Real-Time**: Socket.IO (ready)
- **Queue**: BullMQ + Redis (ready)
- **Monitoring**: Datadog, Grafana, Prometheus integrations
- **Notifications**: Email, SMS, Slack, MS Teams
- **Payments**: Stripe

---

**Happy building! 🚀**
