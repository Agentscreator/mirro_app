import { NextRequest, NextResponse } from 'next/server';
import { getAllEvents, createEvent, updateEvent, getEventById, deleteEvent } from '@/lib/auth';

// Configure runtime for this route
export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds timeout

// Increase body size limit to handle larger payloads
export const dynamic = 'force-dynamic';
// Note: Next.js App Router doesn't use bodyParser config like Pages Router
// We handle size limits in the route handler itself

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
    // Check content length before parsing
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 50 * 1024 * 1024) { // 50MB limit
      return NextResponse.json({ 
        error: 'Request too large. Maximum size is 50MB.' 
      }, { status: 413 });
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json({ 
        error: 'Invalid JSON format in request body' 
      }, { status: 400 });
    }

    const { title, description, date, time, location, icon, gradient, mediaUrl, mediaType, createdBy, visualStyling } = body;

    if (!title || !description || !date || !time || !location || !createdBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if mediaUrl is too large (base64 encoded images can be huge)
    if (mediaUrl && mediaUrl.length > 10 * 1024 * 1024) { // 10MB limit for base64
      return NextResponse.json({
        error: 'Media content too large. Please use the upload endpoint for large files.'
      }, { status: 413 });
    }

    // Check if visualStyling is too large
    if (visualStyling) {
      const visualStylingSize = JSON.stringify(visualStyling).length;
      if (visualStylingSize > 100 * 1024) { // 100KB limit for visual styling
        console.warn('Visual styling too large, stripping it down:', visualStylingSize);
        // Keep only essential styling info
        body.visualStyling = {
          styling: visualStyling.styling || null,
          theme: visualStyling.theme || null
        };
      }
    }

    const event = await createEvent({
      title,
      description,
      date,
      time,
      location,
      icon,
      gradient,
      mediaUrl,
      mediaType,
      createdBy,
      visualStyling,
    });

    return NextResponse.json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('PayloadTooLargeError') || error.message.includes('request entity too large')) {
        return NextResponse.json({ 
          error: 'Request too large. Please reduce the size of your content.' 
        }, { status: 413 });
      }
    }
    
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