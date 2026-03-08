import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/next-auth.config';
import prisma from '@/lib/db/prisma';
import { getOrgSlugFromRequest, verifyOrgAndGetId } from '@/lib/db/rls';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const schedule = await prisma.onCallSchedule.findFirst({
      where: {
        id: params.id,
        orgId,
      },
      include: {
        team: {
          select: { id: true, name: true },
        },
        rotations: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { startTime: 'asc' },
        },
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Get schedule error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const { name, teamId, timezone, rotationType, rotations } = body;

    // Verify schedule belongs to org
    const schedule = await prisma.onCallSchedule.findFirst({
      where: { id: params.id, orgId },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 },
      );
    }

    // Delete old rotations and create new ones
    await prisma.onCallRotation.deleteMany({
      where: { scheduleId: params.id },
    });

    const updatedSchedule = await prisma.onCallSchedule.update({
      where: { id: params.id },
      data: {
        name: name || schedule.name,
        teamId: teamId || schedule.teamId,
        timezone: timezone || schedule.timezone,
        rotationType: rotationType || schedule.rotationType,
        rotations: rotations && rotations.length > 0 ? {
          create: rotations.map((rotation: any) => ({
            userId: rotation.userId,
            startTime: new Date(rotation.startTime),
            endTime: new Date(rotation.endTime),
          })),
        } : undefined,
      },
      include: {
        rotations: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedSchedule);
  } catch (error) {
    console.error('Update schedule error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Verify schedule belongs to org
    const schedule = await prisma.onCallSchedule.findFirst({
      where: { id: params.id, orgId },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 },
      );
    }

    // Delete rotations first
    await prisma.onCallRotation.deleteMany({
      where: { scheduleId: params.id },
    });

    // Delete schedule
    await prisma.onCallSchedule.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete schedule error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
