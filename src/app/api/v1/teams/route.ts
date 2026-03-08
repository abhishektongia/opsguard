import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/next-auth.config';
import prisma from '@/lib/db/prisma';
import { getOrgSlugFromRequest, verifyOrgAndGetId } from '@/lib/db/rls';

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

    const teams = await prisma.team.findMany({
      where: { orgId },
      include: {
        _count: {
          select: { members: true },
        },
        schedule: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error('Teams API error:', error);
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

    // Get current user
    const user = await prisma.user.findFirst({
      where: { email: session.user.email!, orgId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Team name is required' },
        { status: 400 },
      );
    }

    const team = await prisma.team.create({
      data: {
        orgId,
        name,
        description,
        createdBy: user.id,
      },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error('Create team error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
