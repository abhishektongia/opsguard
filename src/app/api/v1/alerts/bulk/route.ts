import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/next-auth.config';
import prisma from '@/lib/db/prisma';
import { getOrgSlugFromRequest, verifyOrgAndGetId } from '@/lib/db/rls';
import { broadcastAlertUpdated } from '@/lib/socket';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { alertIds, action, assignTo } = body;

    if (!alertIds || !Array.isArray(alertIds) || alertIds.length === 0) {
      return NextResponse.json(
        { error: 'alertIds array is required' },
        { status: 400 },
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: 'action is required (acknowledge, resolve, assign, close)' },
        { status: 400 },
      );
    }

    // Verify all alerts belong to org
    const alerts = await prisma.alert.findMany({
      where: {
        id: { in: alertIds },
        orgId,
      },
    });

    if (alerts.length !== alertIds.length) {
      return NextResponse.json(
        { error: 'Some alerts not found or do not belong to this organization' },
        { status: 404 },
      );
    }

    const user = await prisma.user.findFirst({
      where: { email: session.user.email!, orgId },
    });

    let updatedAlerts;

    if (action === 'acknowledge') {
      updatedAlerts = await prisma.alert.updateMany({
        where: { id: { in: alertIds }, orgId },
        data: {
          status: 'ACKNOWLEDGED',
          acknowledgedBy: user?.id,
          acknowledgedAt: new Date(),
        },
      });

      // Broadcast updates
      alertIds.forEach((alertId) => {
        broadcastAlertUpdated(orgId, alertId, {
          status: 'ACKNOWLEDGED',
          acknowledgedBy: user?.id,
          acknowledgedAt: new Date(),
        });
      });
    } else if (action === 'resolve') {
      updatedAlerts = await prisma.alert.updateMany({
        where: { id: { in: alertIds }, orgId },
        data: {
          status: 'RESOLVED',
          resolvedBy: user?.id,
          resolvedAt: new Date(),
        },
      });

      // Broadcast updates
      alertIds.forEach((alertId) => {
        broadcastAlertUpdated(orgId, alertId, {
          status: 'RESOLVED',
          resolvedBy: user?.id,
          resolvedAt: new Date(),
        });
      });
    } else if (action === 'close') {
      updatedAlerts = await prisma.alert.updateMany({
        where: { id: { in: alertIds }, orgId },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
        },
      });

      // Broadcast updates
      alertIds.forEach((alertId) => {
        broadcastAlertUpdated(orgId, alertId, {
          status: 'CLOSED',
          closedAt: new Date(),
        });
      });
    } else if (action === 'assign' && assignTo) {
      updatedAlerts = await prisma.alert.updateMany({
        where: { id: { in: alertIds }, orgId },
        data: {
          assignedTo: assignTo,
        },
      });

      // Broadcast updates
      alertIds.forEach((alertId) => {
        broadcastAlertUpdated(orgId, alertId, {
          assignedTo,
        });
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action or missing required parameters' },
        { status: 400 },
      );
    }

    // Create audit log
    if (user) {
      await prisma.auditLog.create({
        data: {
          orgId,
          userId: user.id,
          action: `alert.bulk_${action}`,
          resourceType: 'alert',
          resourceId: alertIds.join(','),
          metadata: { count: alertIds.length, action },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully performed ${action} on ${updatedAlerts.count} alerts`,
      count: updatedAlerts.count,
    });
  } catch (error) {
    console.error('Bulk alert operation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
