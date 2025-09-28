import { NextRequest, NextResponse } from 'next/server';
import { getUserEvents } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const events = await getUserEvents(userId);
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching user events:', error);
    return NextResponse.json({ error: 'Failed to fetch user events' }, { status: 500 });
  }
}