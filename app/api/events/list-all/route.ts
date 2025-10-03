import { NextResponse } from 'next/server';
import { getAllEvents } from '@/lib/auth';

export async function GET() {
  try {
    const events = await getAllEvents();
    
    return NextResponse.json({
      count: events.length,
      events: events.map(event => ({
        id: event.id,
        title: event.title,
        shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://mirro-app.vercel.app'}/event/${event.id}`
      }))
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}