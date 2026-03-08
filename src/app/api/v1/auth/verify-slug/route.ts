import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug } = body;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 },
      );
    }

    const existingOrg = await prisma.organization.findUnique({
      where: { slug },
    });

    return NextResponse.json({
      available: !existingOrg,
    });
  } catch (error) {
    console.error('Verify slug error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 },
    );
  }
}
