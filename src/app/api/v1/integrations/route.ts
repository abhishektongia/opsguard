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

    const integrations = await prisma.integration.findMany({
      where: { orgId },
      select: {
        id: true,
        type: true,
        name: true,
        description: true,
        enabled: true,
        webhookUrl: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(integrations);
  } catch (error) {
    console.error('Integrations list error:', error);
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
    const { type, name, description, config } = body;

    if (!type || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: type, name' },
        { status: 400 },
      );
    }

    // Generate unique webhook URL for this integration
    const webhookPath = `${orgId}-${Date.now()}`;

    const integration = await prisma.integration.create({
      data: {
        orgId,
        type,
        name,
        description: description || '',
        config: config || {},
        webhookUrl: `/api/v1/webhooks/${webhookPath}`,
        enabled: false,
      },
    });

    return NextResponse.json(integration, { status: 201 });
  } catch (error) {
    console.error('Create integration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
