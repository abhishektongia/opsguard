import { NextRequest, NextResponse } from 'next/server';
import prisma from './prisma';

/**
 * Extract org slug from request headers (set by middleware)
 */
export function getOrgSlugFromRequest(request: NextRequest): string | null {
  return request.headers.get('x-org-slug');
}

/**
 * Verify the org exists and return org_id
 */
export async function verifyOrgAndGetId(slug: string): Promise<string | null> {
  try {
    const org = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });
    return org?.id || null;
  } catch (error) {
    console.error('Error verifying org:', error);
    return null;
  }
}

/**
 * Wrap an API route handler to inject org context
 */
export function withOrgContext(
  handler: (req: NextRequest, context: { orgId: string }) => Promise<NextResponse | Response>,
) {
  return async (req: NextRequest) => {
    const orgSlug = getOrgSlugFromRequest(req);

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

    try {
      return await handler(req, { orgId });
    } catch (error) {
      console.error('API error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 },
      );
    }
  };
}

/**
 * Set org_id in database session for RLS
 * This should be called at the start of any database operation
 */
export async function setOrgContext(orgId: string) {
  // Note: PostgreSQL RLS would use current_setting('app.org_id')
  // For now, we handle org_id filtering at the application level
  // In production, enable RLS on tables and set: SET app.org_id = '<org_id>'
}
