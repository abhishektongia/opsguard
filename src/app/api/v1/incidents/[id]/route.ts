import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/next-auth.config';
import prisma from '@/lib/db/prisma';
import { getOrgSlugFromRequest, verifyOrgAndGetId } from '@/lib/db/rls';
import { broadcastIncidentUpdated } from '@/lib/socket';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const incident = await prisma.incident.findFirst({
      where: {
        id: params.id,
        orgId,
      },
      include: {
        responders: {
          select: { id: true, name: true, email: true },
        },
        teams: {
          select: { id: true, name: true },
        },
      },
    });

    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(incident);
  } catch (error) {
    console.error('Get incident error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const { title, description, severity, status, responderIds, teamIds, postmortem } = body;

    // Verify incident belongs to org
    const incident = await prisma.incident.findFirst({
      where: { id: params.id, orgId },
    });

    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 },
      );
    }

    // Update incident
    const updatedIncident = await prisma.incident.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(severity && { severity }),
        ...(status && { status }),
        ...(postmortem && { postmortem }),
        ...(responderIds && {
          responders: {
            connect: responderIds.map((id: string) => ({ id })),
          },
        }),
        ...(teamIds && {
          teams: {
            connect: teamIds.map((id: string) => ({ id })),
          },
        }),
      },
      include: {
        responders: {
          select: { id: true, name: true, email: true },
        },
        teams: {
          select: { id: true, name: true },
        },
      },
    });

    // Create audit log
    const user = await prisma.user.findFirst({
      where: { email: session.user.email, orgId },
    });

    if (user && status && status !== incident.status) {
      await prisma.auditLog.create({
        data: {
          orgId,
          userId: user.id,
          action: `incident.status_changed`,
          resourceType: 'incident',
          resourceId: params.id,
          metadata: { oldStatus: incident.status, newStatus: status },
        },
      });
    }

    // Broadcast incident:updated event
    broadcastIncidentUpdated(orgId, updatedIncident.id, {
      title: updatedIncident.title,
      status: updatedIncident.status,
      severity: updatedIncident.severity,
    });

    return NextResponse.json(updatedIncident);
  } catch (error) {
    console.error('Update incident error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Verify incident belongs to org
    const incident = await prisma.incident.findFirst({
      where: { id: params.id, orgId },
    });

    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 },
      );
    }

    // Delete incident
    await prisma.incident.delete({
      where: { id: params.id },
    });

    // Create audit log
    const user = await prisma.user.findFirst({
      where: { email: session.user.email, orgId },
    });

    if (user) {
      await prisma.auditLog.create({
        data: {
          orgId,
          userId: user.id,
          action: 'incident.deleted',
          resourceType: 'incident',
          resourceId: params.id,
          metadata: { title: incident.title },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete incident error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
