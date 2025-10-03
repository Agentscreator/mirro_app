import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eventParticipants, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params;

    // Get all participants for the event with their user details
    const participants = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        profilePicture: users.profilePicture,
        joinedAt: eventParticipants.joinedAt,
      })
      .from(eventParticipants)
      .innerJoin(users, eq(eventParticipants.userId, users.id))
      .where(eq(eventParticipants.eventId, eventId));

    return NextResponse.json(participants);
  } catch (error) {
    console.error('Error fetching event participants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event participants' },
      { status: 500 }
    );
  }
}