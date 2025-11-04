import { NextRequest, NextResponse } from 'next/server';
import { getEventById, updateEvent } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { userId } = await request.json();
    const eventId = params.eventId;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get the event
    const event = await getEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if user owns the event
    if (event.createdBy !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Generate new thumbnail
    const generateResponse = await fetch(`${request.nextUrl.origin}/api/generate-event-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: event.title,
        description: event.description,
        location: event.location,
        type: 'thumbnail',
        visualStyling: event.visualStyling ? JSON.parse(event.visualStyling) : null
      }),
    });

    if (!generateResponse.ok) {
      throw new Error('Failed to generate thumbnail');
    }

    const { imageUrl } = await generateResponse.json();

    // Update event with new thumbnail
    await updateEvent(eventId, { thumbnailUrl: imageUrl }, userId);

    return NextResponse.json({ 
      message: 'Thumbnail regenerated successfully',
      thumbnailUrl: imageUrl
    });
  } catch (error) {
    console.error('Error regenerating thumbnail:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate thumbnail' },
      { status: 500 }
    );
  }
}
