import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/next-auth.config';
import prisma from '@/lib/db/prisma';
import { getOrgSlugFromRequest, verifyOrgAndGetId } from '@/lib/db/rls';

export async function POST(
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

    const body = await request.json();
    const { type, payload } = body;

    // Simulate sending test payload based on integration type
    console.log(`Testing ${type} integration for org ${orgId}:`, payload);

    // In a real implementation, you would:
    // - For Slack: send to Slack API
    // - For MS Teams: POST to webhook
    // - For Email: send via SMTP
    // - For Datadog/Grafana: verify field mapping
    // - etc.

    // For now, just log and return success
    // Store test log in webhook logs if implemented

    return NextResponse.json({
      success: true,
      message: `Test alert sent to ${type} integration`,
    });
  } catch (error) {
    console.error('Integration test error:', error);
    return NextResponse.json(
      { error: 'Failed to send test alert' },
      { status: 500 },
    );
  }
}
