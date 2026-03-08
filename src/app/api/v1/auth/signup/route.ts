import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, orgName, orgSlug } = body;

    // Validate input
    if (!email || !password || !name || !orgName || !orgSlug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Check if slug is available
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: orgSlug },
    });

    if (existingOrg) {
      return NextResponse.json(
        { error: 'Organization slug already exists' },
        { status: 400 },
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 },
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create organization and user
    const org = await prisma.organization.create({
      data: {
        name: orgName,
        slug: orgSlug,
        subdomain: orgSlug,
        plan: 'FREE',
        users: {
          create: {
            email,
            name,
            passwordHash,
            role: 'OWNER',
          },
        },
        billing: {
          create: {
            plan: 'FREE',
            seats: 1,
            status: 'active',
          },
        },
      },
      include: {
        users: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        org: {
          id: org.id,
          slug: org.slug,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 },
    );
  }
}
