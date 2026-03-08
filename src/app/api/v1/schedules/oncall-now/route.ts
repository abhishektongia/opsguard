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

    const now = new Date();

    // Get all schedules with current rotations
    const schedules = await prisma.onCallSchedule.findMany({
      where: { orgId },
      include: {
        team: {
          select: { id: true, name: true },
        },
        rotations: {
          where: {
            startTime: { lte: now },
            endTime: { gte: now },
          },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    // Flatten to get all on-call people
    const onCallPeople = schedules.flatMap((schedule) =>
      schedule.rotations.map((rotation) => ({
        scheduleId: schedule.id,
        scheduleName: schedule.name,
        teamName: schedule.team.name,
        user: rotation.user,
        shiftEndsAt: rotation.endTime,
      })),
    );

    return NextResponse.json({ onCallPeople, schedules });
  } catch (error) {
    console.error('Oncall-now API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
