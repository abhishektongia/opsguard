import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo organization
  const org = await prisma.organization.create({
    data: {
      name: 'Demo Corp',
      slug: 'demo',
      subdomain: 'demo',
      plan: 'PRO',
      settings: {
        timezone: 'America/New_York',
        theme: 'light',
      },
    },
  });

  console.log(`✅ Created organization: ${org.name}`);

  // Create billing subscription
  await prisma.billingSubscription.create({
    data: {
      orgId: org.id,
      plan: 'PRO',
      seats: 10,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`✅ Created billing subscription`);

  // Create teams
  const teams = await Promise.all([
    prisma.team.create({
      data: {
        orgId: org.id,
        name: 'DevOps',
        description: 'Infrastructure and deployment team',
        createdBy: '', // Will be set after user creation
      },
    }),
    prisma.team.create({
      data: {
        orgId: org.id,
        name: 'Backend',
        description: 'Backend services team',
        createdBy: '',
      },
    }),
    prisma.team.create({
      data: {
        orgId: org.id,
        name: 'Frontend',
        description: 'Frontend and UX team',
        createdBy: '',
      },
    }),
  ]);

  console.log(`✅ Created ${teams.length} teams`);

  // Create users
  const passwordHash = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        orgId: org.id,
        email: 'alice@demo.local',
        name: 'Alice Johnson',
        passwordHash,
        role: 'OWNER',
        timezone: 'America/New_York',
      },
    }),
    prisma.user.create({
      data: {
        orgId: org.id,
        email: 'bob@demo.local',
        name: 'Bob Smith',
        passwordHash,
        role: 'ADMIN',
        timezone: 'America/New_York',
      },
    }),
    prisma.user.create({
      data: {
        orgId: org.id,
        email: 'charlie@demo.local',
        name: 'Charlie Brown',
        passwordHash,
        role: 'MEMBER',
        timezone: 'America/New_York',
      },
    }),
    prisma.user.create({
      data: {
        orgId: org.id,
        email: 'diana@demo.local',
        name: 'Diana Prince',
        passwordHash,
        role: 'MEMBER',
        timezone: 'America/Los_Angeles',
      },
    }),
    prisma.user.create({
      data: {
        orgId: org.id,
        email: 'ethan@demo.local',
        name: 'Ethan Hunt',
        passwordHash,
        role: 'MEMBER',
        timezone: 'America/Chicago',
      },
    }),
    prisma.user.create({
      data: {
        orgId: org.id,
        email: 'fiona@demo.local',
        name: 'Fiona Green',
        passwordHash,
        role: 'MEMBER',
        timezone: 'America/New_York',
      },
    }),
    prisma.user.create({
      data: {
        orgId: org.id,
        email: 'grace@demo.local',
        name: 'Grace Lee',
        passwordHash,
        role: 'MEMBER',
        timezone: 'America/New_York',
      },
    }),
    prisma.user.create({
      data: {
        orgId: org.id,
        email: 'henry@demo.local',
        name: 'Henry Wilson',
        passwordHash,
        role: 'MEMBER',
        timezone: 'America/Los_Angeles',
      },
    }),
    prisma.user.create({
      data: {
        orgId: org.id,
        email: 'iris@demo.local',
        name: 'Iris Taylor',
        passwordHash,
        role: 'MEMBER',
        timezone: 'America/Denver',
      },
    }),
    prisma.user.create({
      data: {
        orgId: org.id,
        email: 'jack@demo.local',
        name: 'Jack Miller',
        passwordHash,
        role: 'VIEWER',
        timezone: 'America/New_York',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Update teams with createdBy
  await Promise.all([
    prisma.team.update({
      where: { id: teams[0].id },
      data: { createdBy: users[0].id },
    }),
    prisma.team.update({
      where: { id: teams[1].id },
      data: { createdBy: users[0].id },
    }),
    prisma.team.update({
      where: { id: teams[2].id },
      data: { createdBy: users[0].id },
    }),
  ]);

  // Add team members
  const teamMembers = [
    // DevOps team: Alice, Bob, Charlie, Diana
    { teamId: teams[0].id, userId: users[0].id, role: 'lead' },
    { teamId: teams[0].id, userId: users[1].id, role: 'member' },
    { teamId: teams[0].id, userId: users[2].id, role: 'member' },
    { teamId: teams[0].id, userId: users[3].id, role: 'member' },
    // Backend team: Bob, Ethan, Fiona, Grace
    { teamId: teams[1].id, userId: users[1].id, role: 'lead' },
    { teamId: teams[1].id, userId: users[4].id, role: 'member' },
    { teamId: teams[1].id, userId: users[5].id, role: 'member' },
    { teamId: teams[1].id, userId: users[6].id, role: 'member' },
    // Frontend team: Grace, Henry, Iris
    { teamId: teams[2].id, userId: users[6].id, role: 'lead' },
    { teamId: teams[2].id, userId: users[7].id, role: 'member' },
    { teamId: teams[2].id, userId: users[8].id, role: 'member' },
  ];

  await Promise.all(
    teamMembers.map((member) =>
      prisma.teamMember.create({
        data: member,
      }),
    ),
  );

  console.log(`✅ Added ${teamMembers.length} team members`);

  // Create on-call schedules
  const schedules = await Promise.all([
    prisma.onCallSchedule.create({
      data: {
        orgId: org.id,
        teamId: teams[0].id,
        name: 'DevOps Weekly Rotation',
        timezone: 'America/New_York',
        rotationType: 'WEEKLY',
      },
    }),
    prisma.onCallSchedule.create({
      data: {
        orgId: org.id,
        teamId: teams[1].id,
        name: 'Backend Weekly Rotation',
        timezone: 'America/New_York',
        rotationType: 'WEEKLY',
      },
    }),
    prisma.onCallSchedule.create({
      data: {
        orgId: org.id,
        teamId: teams[2].id,
        name: 'Frontend Weekly Rotation',
        timezone: 'America/New_York',
        rotationType: 'WEEKLY',
      },
    }),
  ]);

  console.log(`✅ Created ${schedules.length} on-call schedules`);

  // Create on-call rotations
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const rotations = [];
  for (let i = 0; i < schedules.length; i++) {
    const schedule = schedules[i];
    const teamUsers = teamMembers
      .filter((m) => m.teamId === teams[i].id)
      .map((m) => users.find((u) => u.id === m.userId)!);

    for (let j = 0; j < teamUsers.length; j++) {
      const startDate = new Date(now.getTime() + (j * 7 * 24 * 60 * 60 * 1000));
      const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

      rotations.push(
        prisma.onCallRotation.create({
          data: {
            scheduleId: schedule.id,
            userId: teamUsers[j].id,
            startTime: startDate,
            endTime: endDate,
          },
        }),
      );
    }
  }

  await Promise.all(rotations);
  console.log(`✅ Created on-call rotations`);

  // Create integrations
  const integrations = await Promise.all([
    prisma.integration.create({
      data: {
        orgId: org.id,
        type: 'SLACK',
        name: 'Slack',
        description: 'Slack integration for notifications',
        config: {
          workspaceId: 'T123456',
          botToken: 'xoxb-...',
          channels: ['#alerts', '#incidents'],
        },
        enabled: true,
        webhookUrl: `https://api.opsguard.com/webhooks/slack/${org.id}`,
      },
    }),
    prisma.integration.create({
      data: {
        orgId: org.id,
        type: 'DATADOG',
        name: 'Datadog',
        description: 'Datadog monitoring alerts',
        config: {
          apiKey: 'dd_...',
          appKey: 'app_...',
        },
        enabled: true,
        webhookUrl: `https://api.opsguard.com/webhooks/datadog/${org.id}`,
      },
    }),
    prisma.integration.create({
      data: {
        orgId: org.id,
        type: 'EMAIL',
        name: 'Email Ingestion',
        description: 'Inbound email alerts',
        config: {
          inboundEmail: `alerts@demo.opsguard.com`,
        },
        enabled: true,
      },
    }),
    prisma.integration.create({
      data: {
        orgId: org.id,
        type: 'CUSTOM',
        name: 'Custom Webhook',
        description: 'Generic webhook for custom alerts',
        config: {
          fieldMapping: {
            title: 'alert.title',
            description: 'alert.message',
            severity: 'alert.level',
          },
        },
        enabled: true,
        webhookUrl: `https://api.opsguard.com/webhooks/custom/${org.id}`,
      },
    }),
  ]);

  console.log(`✅ Created ${integrations.length} integrations`);

  // Create alerts
  const alertTitles = [
    'High CPU usage on web-01',
    'Database connection pool exhausted',
    'Redis memory usage critical',
    'API response time degradation',
    'Failed payment processing',
    'Disk space low on backup',
    'SSL certificate expiring soon',
    'Service unavailable - HealthCheck failed',
    'Unusual traffic spike detected',
    'Memory leak detected in worker process',
  ];

  const alerts = [];
  const severities: any[] = ['P1', 'P2', 'P3', 'P4', 'P5'];
  const statuses: any[] = ['OPEN', 'ACK', 'RESOLVED', 'CLOSED'];

  for (let i = 0; i < 50; i++) {
    const createdDaysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(now.getTime() - createdDaysAgo * 24 * 60 * 60 * 1000);

    const severity = severities[Math.floor(Math.random() * severities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    alerts.push(
      prisma.alert.create({
        data: {
          orgId: org.id,
          title: alertTitles[i % alertTitles.length] + ` #${i + 1}`,
          description: `Alert triggered from monitoring system. Severity: ${severity}. Status: ${status}`,
          source: integrations[Math.floor(Math.random() * integrations.length)].type,
          severity,
          status,
          assignedToId:
            Math.random() > 0.5 ? users[Math.floor(Math.random() * users.length)].id : null,
          assignedTeamId:
            Math.random() > 0.5 ? teams[Math.floor(Math.random() * teams.length)].id : null,
          tags: ['monitoring', 'production', severity.toLowerCase()],
          rawPayload: {
            timestamp: createdAt.toISOString(),
            source: 'datadog',
            labels: { env: 'production', team: 'backend' },
          },
          createdAt,
          ackedAt:
            status !== 'OPEN'
              ? new Date(createdAt.getTime() + Math.random() * 60 * 60 * 1000)
              : null,
          resolvedAt:
            status === 'RESOLVED'
              ? new Date(
                  createdAt.getTime() + (1 + Math.random() * 12) * 60 * 60 * 1000,
                )
              : null,
        },
      }),
    );
  }

  const createdAlerts = await Promise.all(alerts);
  console.log(`✅ Created ${createdAlerts.length} alerts`);

  // Create incidents
  const incidents = await Promise.all([
    prisma.incident.create({
      data: {
        orgId: org.id,
        title: 'Production Database Outage',
        description: 'Primary database became unresponsive',
        severity: 'P1',
        status: 'RESOLVED',
        responderIds: [users[0].id, users[1].id],
        responders: {
          connect: [{ id: users[0].id }, { id: users[1].id }],
        },
        teams: {
          connect: [{ id: teams[0].id }],
        },
        linkedAlertIds: [createdAlerts[0].id, createdAlerts[1].id],
        alerts: {
          connect: [{ id: createdAlerts[0].id }, { id: createdAlerts[1].id }],
        },
        timeline: [
          {
            timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000),
            type: 'created',
            message: 'Incident created',
            by: users[0].name,
          },
          {
            timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
            type: 'status_change',
            message: 'Status changed to Identified',
            by: users[1].name,
          },
          {
            timestamp: new Date(now.getTime() - 30 * 60 * 1000),
            type: 'resolved',
            message: 'Database restored and verified',
            by: users[0].name,
          },
        ],
        postmortem: `## Incident Postmortem\n\n### Summary\nPrimary database became unresponsive for 3 hours.\n\n### Root Cause\nUnexpected spike in connections exhausted connection pool.\n\n### Resolution\nRestarted DB connection pooler and added alerting.`,
        createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
        resolvedAt: new Date(now.getTime() - 30 * 60 * 1000),
      },
    }),
    prisma.incident.create({
      data: {
        orgId: org.id,
        title: 'API Performance Degradation',
        description: 'Response times increased to 5+ seconds',
        severity: 'P2',
        status: 'MONITORING',
        responderIds: [users[1].id, users[4].id],
        responders: {
          connect: [{ id: users[1].id }, { id: users[4].id }],
        },
        teams: {
          connect: [{ id: teams[1].id }],
        },
        linkedAlertIds: [createdAlerts[2].id, createdAlerts[3].id],
        alerts: {
          connect: [{ id: createdAlerts[2].id }, { id: createdAlerts[3].id }],
        },
        timeline: [
          {
            timestamp: new Date(now.getTime() - 90 * 60 * 1000),
            type: 'created',
            message: 'Incident created',
            by: users[1].name,
          },
          {
            timestamp: new Date(now.getTime() - 60 * 60 * 1000),
            type: 'status_change',
            message: 'Status changed to Identified',
            by: users[4].name,
          },
        ],
        createdAt: new Date(now.getTime() - 90 * 60 * 1000),
      },
    }),
    prisma.incident.create({
      data: {
        orgId: org.id,
        title: 'Memory Leak in Worker Service',
        description: 'Worker process memory consumption growing unbounded',
        severity: 'P3',
        status: 'INVESTIGATING',
        responderIds: [users[4].id],
        responders: {
          connect: [{ id: users[4].id }],
        },
        teams: {
          connect: [{ id: teams[1].id }],
        },
        linkedAlertIds: [createdAlerts[9].id],
        alerts: {
          connect: [{ id: createdAlerts[9].id }],
        },
        timeline: [
          {
            timestamp: new Date(now.getTime() - 30 * 60 * 1000),
            type: 'created',
            message: 'Incident created',
            by: users[4].name,
          },
        ],
        createdAt: new Date(now.getTime() - 30 * 60 * 1000),
      },
    }),
    prisma.incident.create({
      data: {
        orgId: org.id,
        title: 'CDN Cache Invalidation Issue',
        description: 'Stale content being served from CDN',
        severity: 'P4',
        status: 'INVESTIGATING',
        responderIds: [users[7].id],
        responders: {
          connect: [{ id: users[7].id }],
        },
        teams: {
          connect: [{ id: teams[2].id }],
        },
        linkedAlertIds: [],
        timeline: [
          {
            timestamp: new Date(now.getTime() - 20 * 60 * 1000),
            type: 'created',
            message: 'Incident created',
            by: users[7].name,
          },
        ],
        createdAt: new Date(now.getTime() - 20 * 60 * 1000),
      },
    }),
    prisma.incident.create({
      data: {
        orgId: org.id,
        title: 'SSL Certificate Renewal Pending',
        description: 'Certificate expiring in 14 days',
        severity: 'P4',
        status: 'INVESTIGATING',
        responderIds: [users[0].id],
        responders: {
          connect: [{ id: users[0].id }],
        },
        teams: {
          connect: [{ id: teams[0].id }],
        },
        linkedAlertIds: [],
        timeline: [
          {
            timestamp: new Date(now.getTime() - 5 * 60 * 1000),
            type: 'created',
            message: 'Incident created',
            by: users[0].name,
          },
        ],
        createdAt: new Date(now.getTime() - 5 * 60 * 1000),
      },
    }),
  ]);

  console.log(`✅ Created ${incidents.length} incidents`);

  // Create notification rules
  const notificationRules = await Promise.all([
    prisma.notificationRule.create({
      data: {
        orgId: org.id,
        userId: users[0].id,
        alertSeverity: 'P1,P2',
        channels: {
          email: true,
          sms: true,
          call: true,
        },
        delayMinutes: 0,
        repeatInterval: 5,
        enabled: true,
      },
    }),
    prisma.notificationRule.create({
      data: {
        orgId: org.id,
        userId: users[1].id,
        alertSeverity: 'P1,P2,P3',
        channels: {
          email: true,
          slack_dm: true,
        },
        delayMinutes: 5,
        enabled: true,
      },
    }),
    prisma.notificationRule.create({
      data: {
        orgId: org.id,
        userId: users[4].id,
        alertSeverity: 'P1,P2,P3',
        channels: {
          email: true,
          slack_dm: true,
        },
        delayMinutes: 0,
        enabled: true,
      },
    }),
  ]);

  console.log(`✅ Created ${notificationRules.length} notification rules`);

  // Create audit logs
  await prisma.auditLog.create({
    data: {
      orgId: org.id,
      userId: users[0].id,
      action: 'organization.created',
      resourceType: 'organization',
      resourceId: org.id,
      metadata: { plan: 'PRO' },
    },
  });

  console.log(`✅ Created audit logs`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
