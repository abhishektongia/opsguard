import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/next-auth.config';
import prisma from '@/lib/db/prisma';
import { getOrgSlugFromRequest, verifyOrgAndGetId } from '@/lib/db/rls';
import { broadcastIncidentCreated } from '@/lib/socket';

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

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const status = url.searchParams.get('status');

    const where: any = { orgId };
    if (status) {
      where.status = status;
    }

    const totalCount = await prisma.incident.count({ where });

    const incidents = await prisma.incident.findMany({
      where,
      include: {
        responders: {
          select: { id: true, name: true, email: true },
        },
        teams: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return NextResponse.json({
      incidents,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    });
  } catch (error) {
    console.error('Incidents API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

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
    const { title, description, severity, linkedAlertIds } = body;

    if (!title || !severity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const incident = await prisma.incident.create({
      data: {
        orgId,
        title,
        description,
        severity,
        status: 'INVESTIGATING',
        linkedAlertIds: linkedAlertIds || [],
        timeline: [
          {
            timestamp: new Date(),
            type: 'created',
            message: 'Incident created',
            by: session.user.name || 'Unknown',
          },
        ],
      },
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
          action: 'incident.created',
          resourceType: 'incident',
          resourceId: incident.id,
          metadata: { severity },
        },
      });
    }

    // Broadcast incident:created event to all connected users in the organization
    broadcastIncidentCreated(orgId, incident);

    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    console.error('Create incident error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
