import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/next-auth.config';
import prisma from '@/lib/db/prisma';
import { getOrgSlugFromRequest, verifyOrgAndGetId } from '@/lib/db/rls';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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

    const integration = await prisma.integration.findFirst({
      where: {
        id: params.id,
        orgId,
      },
    });

    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    return NextResponse.json(integration);
  } catch (error) {
    console.error('Get integration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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

    const integration = await prisma.integration.findFirst({
      where: {
        id: params.id,
        orgId,
      },
    });

    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    const updated = await prisma.integration.update({
      where: { id: params.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description && { description: body.description }),
        ...(body.config && { config: { ...integration.config, ...body.config } }),
        ...(body.enabled !== undefined && { enabled: body.enabled }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update integration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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

    const integration = await prisma.integration.findFirst({
      where: {
        id: params.id,
        orgId,
      },
    });

    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    await prisma.integration.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete integration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
