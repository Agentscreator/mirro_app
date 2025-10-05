import { NextRequest, NextResponse } from 'next/server';
import { getAllEvents, createEvent, updateEvent, getEventById, deleteEvent } from '@/lib/auth';
import { uploadToR2, generateFileName } from '@/lib/storage';

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

    // Media should ALWAYS be uploaded to R2 first, not sent as base64
    // If mediaUrl is a data URL, reject it
    if (mediaUrl && mediaUrl.startsWith('data:')) {
      return NextResponse.json({
        error: 'Media must be uploaded to R2 first. Use /api/upload endpoint.'
      }, { status: 400 });
    }

    // Store large visualStyling data in R2 if it exceeds size limit
    let visualStylingUrl = null;
    let optimizedVisualStyling = null;
    
    if (visualStyling) {
      const visualStylingSize = JSON.stringify(visualStyling).length;
      console.log('Visual styling size:', visualStylingSize, 'bytes');
      
      // If visualStyling is large (>50KB), store it in R2
      if (visualStylingSize > 50000) {
        try {
          const fileName = generateFileName('event-styling', 'json');
          const visualStylingBuffer = Buffer.from(JSON.stringify(visualStyling), 'utf-8');
          visualStylingUrl = await uploadToR2(visualStylingBuffer, fileName, 'application/json');
          console.log('Large visual styling stored in R2:', visualStylingUrl);
        } catch (uploadError) {
          console.error('Failed to upload visual styling to R2:', uploadError);
          // Fall back to optimized version
          optimizedVisualStyling = {
            styling: {
              gradient: visualStyling.styling?.gradient || null,
              font: visualStyling.styling?.font || null,
            },
            theme: visualStyling.theme || null,
          };
        }
      } else {
        // Keep smaller styling data inline
        optimizedVisualStyling = visualStyling;
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
      visualStyling: optimizedVisualStyling,
      visualStylingUrl: visualStylingUrl ?? undefined, // Store R2 URL for large styling data
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
          error: 'Request too large. All large data must be uploaded to R2 separately.'
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