import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/next-auth.config';
import prisma from '@/lib/db/prisma';
import { verifyOrgAndGetId, getOrgSlugFromRequest } from '@/lib/db/rls';
import { broadcastTimelineEntry } from '@/lib/socket';

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
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 },
      );
    }

    const incident = await prisma.incident.findFirst({
      where: { id: params.id, orgId },
    });

    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 },
      );
    }

    const timeline = Array.isArray(incident.timeline) ? incident.timeline : [];
    const newEntry = {
      timestamp: new Date().toISOString(),
      type: 'update',
      message,
      by: session.user.name || 'Unknown',
    };
    timeline.push(newEntry);

    const updated = await prisma.incident.update({
      where: { id: params.id },
      data: { timeline },
    });

    // Broadcast timeline:entry event to all connected users in the organization
    broadcastTimelineEntry(orgId, params.id, newEntry);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Add timeline error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
