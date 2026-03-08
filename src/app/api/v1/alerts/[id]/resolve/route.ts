import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/next-auth.config';
import prisma from '@/lib/db/prisma';
import { verifyOrgAndGetId, getOrgSlugFromRequest } from '@/lib/db/rls';
import { broadcastAlertResolved } from '@/lib/socket';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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
    const { resolutionNote } = body;

    // Get current alert to preserve rawPayload
    const currentAlert = await prisma.alert.findUnique({
      where: { id: params.id },
    });

    const alert = await prisma.alert.update({
      where: { id: params.id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        rawPayload: {
          ...(typeof currentAlert?.rawPayload === 'object' ? currentAlert.rawPayload : {}),
          resolutionNote,
        },
      },
      include: {
        assignedTo: true,
        assignedTeam: true,
      },
    });

    // Create audit log
    const user = await prisma.user.findFirst({
      where: { email: session.user.email!, orgId },
    });

    if (user) {
      await prisma.auditLog.create({
        data: {
          orgId,
          userId: user.id,
          action: 'alert.resolved',
          resourceType: 'alert',
          resourceId: alert.id,
          metadata: { severity: alert.severity, resolutionNote },
        },
      });
    }

    // Broadcast alert:resolved event to all connected users in the organization
    broadcastAlertResolved(orgId, alert.id, user?.id || 'system');

    return NextResponse.json(alert);
  } catch (error) {
    console.error('Resolve alert error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
