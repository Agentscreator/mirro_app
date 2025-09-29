import { NextRequest, NextResponse } from 'next/server';
import { getAllEvents, createEvent, updateEvent, getEventById, deleteEvent } from '@/lib/auth';

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

export async function PUT(request: NextRequest) {
  try {
    const { eventId, title, description, date, time, location, icon, gradient, userId } = await request.json();

    if (!eventId || !userId) {
      return NextResponse.json({ error: 'Event ID and User ID are required' }, { status: 400 });
    }

    const updatedEvent = await updateEvent(eventId, {
      title,
      description,
      date,
      time,
      location,
      icon,
      gradient,
    }, userId);

    return NextResponse.json({ 
      message: 'Event updated successfully',
      event: updatedEvent 
    });
  } catch (error) {
    console.error('Error updating event:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { eventId, userId } = await request.json();

    if (!eventId || !userId) {
      return NextResponse.json({ error: 'Event ID and User ID are required' }, { status: 400 });
    }

    await deleteEvent(eventId, userId);

    return NextResponse.json({ 
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}