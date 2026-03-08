import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/next-auth.config';
import prisma from '@/lib/db/prisma';
import { getOrgSlugFromRequest, verifyOrgAndGetId } from '@/lib/db/rls';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgSlug = getOrgSlugFromRequest(request);
    if (!orgSlug) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 });
    }

    const orgId = await verifyOrgAndGetId(orgSlug);
    if (!orgId) {
      return NextResponse.json({ error: 'Invalid organization' }, { status: 404 });
    }

    // Get query params for filtering
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const channel = url.searchParams.get('channel');
    const userId = url.searchParams.get('userId');
    const alertId = url.searchParams.get('alertId');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Build where clause
    const where: any = { orgId };
    if (status) where.status = status;
    if (channel) where.channel = channel;
    if (userId) where.userId = userId;
    if (alertId) where.alertId = alertId;

    const logs = await prisma.notificationLog.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        alert: {
          select: { id: true, title: true },
        },
      },
      orderBy: { sentAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.notificationLog.count({ where });

    return NextResponse.json({
      logs: logs.map((log) => ({
        id: log.id,
        alertId: log.alertId,
        alertTitle: log.alert?.title || 'Unknown',
        userId: log.userId,
        userName: log.user?.name,
        userEmail: log.user?.email,
        channel: log.channel,
        status: log.status,
        sentAt: log.sentAt,
        deliveryTimestamp: log.deliveryTimestamp,
        errorMessage: log.errorMessage,
      })),
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Notification logs fetch error:', error);
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgSlug = getOrgSlugFromRequest(request);
    if (!orgSlug) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 });
    }

    const orgId = await verifyOrgAndGetId(orgSlug);
    if (!orgId) {
      return NextResponse.json({ error: 'Invalid organization' }, { status: 404 });
    }

    const body = await request.json();
    const { alertId, userId, channel, status, errorMessage } = body;

    if (!alertId || !userId || !channel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const log = await prisma.notificationLog.create({
      data: {
        orgId,
        alertId,
        userId,
        channel: channel as any,
        status: status || 'pending',
        sentAt: new Date(),
        errorMessage: errorMessage || null,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('Create notification log error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
