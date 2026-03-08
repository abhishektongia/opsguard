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

    // Get query params
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // In a real implementation, you would fetch invoices from Stripe API
    // using the organization's Stripe customer ID
    // For now, return mock invoices

    const mockInvoices = [
      {
        id: 'inv_1234567890',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        amount: 299,
        status: 'paid',
        pdfUrl: 'https://example.com/invoice1.pdf',
      },
      {
        id: 'inv_1234567891',
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        amount: 299,
        status: 'paid',
        pdfUrl: 'https://example.com/invoice2.pdf',
      },
      {
        id: 'inv_1234567892',
        date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        amount: 299,
        status: 'paid',
        pdfUrl: 'https://example.com/invoice3.pdf',
      },
    ];

    return NextResponse.json({
      invoices: mockInvoices.slice(offset, offset + limit),
      total: mockInvoices.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
