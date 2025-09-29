import { NextRequest, NextResponse } from 'next/server';
import { getAllEvents, createEvent } from '@/lib/auth';

export async function GET() {
  try {
    const events = await getAllEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, date, time, location, icon, gradient, createdBy } = await request.json();

    if (!title || !description || !date || !time || !location || !createdBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const event = await createEvent({
      title,
      description,
      date,
      time,
      location,
      icon,
      gradient,
      createdBy,
    });

    return NextResponse.json({ 
      message: 'Event created successfully',
      event 
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}