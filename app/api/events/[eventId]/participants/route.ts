import { NextRequest, NextResponse } from 'next/server';
import { getEventParticipants } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params;

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const participants = await getEventParticipants(eventId);

    return NextResponse.json({
      participants,
      count: participants.length
    });
  } catch (error) {
    console.error('Error fetching event participants:', error);
    return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 });
  }
}