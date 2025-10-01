import { NextRequest, NextResponse } from 'next/server';
import { joinEvent, leaveEvent, isParticipating } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { eventId, userId } = await request.json();

    if (!eventId || !userId) {
      return NextResponse.json({ error: 'Event ID and User ID are required' }, { status: 400 });
    }

    await joinEvent(eventId, userId);

    return NextResponse.json({
      message: 'Successfully joined event',
      joined: true
    });
  } catch (error) {
    console.error('Error joining event:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to join event' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { eventId, userId } = await request.json();

    if (!eventId || !userId) {
      return NextResponse.json({ error: 'Event ID and User ID are required' }, { status: 400 });
    }

    await leaveEvent(eventId, userId);

    return NextResponse.json({
      message: 'Successfully left event',
      joined: false
    });
  } catch (error) {
    console.error('Error leaving event:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to leave event' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const userId = searchParams.get('userId');

    if (!eventId || !userId) {
      return NextResponse.json({ error: 'Event ID and User ID are required' }, { status: 400 });
    }

    const participating = await isParticipating(eventId, userId);

    return NextResponse.json({
      participating
    });
  } catch (error) {
    console.error('Error checking participation:', error);
    return NextResponse.json({ error: 'Failed to check participation' }, { status: 500 });
  }
}