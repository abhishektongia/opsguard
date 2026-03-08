import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/next-auth.config';
import prisma from '@/lib/db/prisma';
import { getOrgSlugFromRequest, verifyOrgAndGetId } from '@/lib/db/rls';
import { broadcastAlertCreated } from '@/lib/socket';

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

    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const status = url.searchParams.getAll('status');
    const severity = url.searchParams.getAll('severity');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const search = url.searchParams.get('search') || '';
    const source = url.searchParams.get('source') || '';
    const team = url.searchParams.get('team') || '';

    // Build where clause
    const where: any = { orgId };

    if (status.length > 0) {
      where.status = { in: status };
    }

    if (severity.length > 0) {
      where.severity = { in: severity };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (source) {
      where.source = { contains: source, mode: 'insensitive' };
    }

    if (team) {
      where.assignedTeam = {
        name: { contains: team, mode: 'insensitive' },
      };
    }

    // Count total
    const totalCount = await prisma.alert.count({ where });

    // Get alerts
    const alerts = await prisma.alert.findMany({
      where,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        assignedTeam: {
          select: { id: true, name: true },
        },
      },
      orderBy: {
        [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return NextResponse.json({
      alerts,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    });
  } catch (error) {
    console.error('Alerts API error:', error);
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
    const { title, description, source, severity } = body;

    if (!title || !source || !severity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const alert = await prisma.alert.create({
      data: {
        orgId,
        title,
        description,
        source,
        severity,
        status: 'OPEN',
        rawPayload: body.rawPayload || {},
      },
    });

    // Broadcast alert:created event to all connected users in the organization
    broadcastAlertCreated(orgId, alert);

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error('Create alert error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
