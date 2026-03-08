import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/next-auth.config';
import prisma from '@/lib/db/prisma';
import { getOrgSlugFromRequest, verifyOrgAndGetId } from '@/lib/db/rls';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const orgSlug = getOrgSlugFromRequest(request);
    if (!orgSlug) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 400 },
      );
    }

    const orgId = await verifyOrgAndGetId(orgSlug);
    if (!orgId) {
      return NextResponse.json(
        { error: 'Invalid organization' },
        { status: 404 },
      );
    }

    // Get KPI data
    const openAlerts = await prisma.alert.count({
      where: {
        orgId,
        status: { in: ['OPEN', 'ACK'] },
      },
    });

    const activeIncidents = await prisma.incident.count({
      where: {
        orgId,
        status: { in: ['INVESTIGATING', 'IDENTIFIED', 'MONITORING'] },
      },
    });

    // Get MTTA (Mean Time to Acknowledge)
    const ackedAlerts = await prisma.alert.findMany({
      where: {
        orgId,
        ackedAt: { not: null },
      },
      select: {
        createdAt: true,
        ackedAt: true,
      },
      take: 100,
    });

    let mtta = 0;
    if (ackedAlerts.length > 0) {
      const totalTime = ackedAlerts.reduce((sum, alert) => {
        const time =
          alert.ackedAt!.getTime() - alert.createdAt.getTime();
        return sum + time;
      }, 0);
      mtta = Math.round(totalTime / ackedAlerts.length / (1000 * 60));
    }

    // Get MTTR (Mean Time to Resolve)
    const resolvedAlerts = await prisma.alert.findMany({
      where: {
        orgId,
        resolvedAt: { not: null },
      },
      select: {
        createdAt: true,
        resolvedAt: true,
      },
      take: 100,
    });

    let mttr = 0;
    if (resolvedAlerts.length > 0) {
      const totalTime = resolvedAlerts.reduce((sum, alert) => {
        const time =
          alert.resolvedAt!.getTime() - alert.createdAt.getTime();
        return sum + time;
      }, 0);
      mttr = Math.round(totalTime / resolvedAlerts.length / (1000 * 60 * 60));
    }

    // Get active incidents with details
    const incidents = await prisma.incident.findMany({
      where: {
        orgId,
        status: { in: ['INVESTIGATING', 'IDENTIFIED', 'MONITORING'] },
      },
      take: 10,
    });

    // Get on-call people
    const schedules = await prisma.onCallSchedule.findMany({
      where: { orgId },
      include: {
        rotations: {
          where: {
            startTime: { lte: new Date() },
            endTime: { gte: new Date() },
          },
          include: {
            user: true,
          },
        },
        team: true,
      },
    });

    const onCallPeople = schedules
      .flatMap((schedule) =>
        schedule.rotations.map((rotation) => ({
          name: rotation.user.name,
          team: schedule.team.name,
          shiftEndsAt: rotation.endTime,
        })),
      );

    // Get recent activities
    const auditLogs = await prisma.auditLog.findMany({
      where: { orgId },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const activities = auditLogs.map((log) => ({
      id: log.id,
      type: log.action.includes('alert')
        ? 'alert_created'
        : 'incident_created',
      title: log.action,
      description: JSON.stringify(log.metadata || {}),
      resourceId: log.resourceId,
      resourceType: log.resourceType as 'alert' | 'incident',
      timestamp: log.createdAt,
      userName: log.user?.name || 'System',
    }));

    return NextResponse.json({
      kpis: {
        openAlerts,
        activeIncidents,
        mtta,
        mttr,
      },
      incidents,
      onCallPeople,
      activities,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
