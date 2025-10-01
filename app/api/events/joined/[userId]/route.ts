import { NextRequest, NextResponse } from 'next/server';
import { getUserParticipatingEvents } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const events = await getUserParticipatingEvents(userId);
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching joined events:', error);
    return NextResponse.json({ error: 'Failed to fetch joined events' }, { status: 500 });
  }
}