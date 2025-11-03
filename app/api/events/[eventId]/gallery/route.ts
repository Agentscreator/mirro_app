import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { mediaGallery } = await request.json();
    const eventId = params.eventId;

    if (!eventId || !mediaGallery) {
      return NextResponse.json({ error: 'Event ID and media gallery are required' }, { status: 400 });
    }

    // Update the event's media gallery
    await db
      .update(events)
      .set({ mediaGallery })
      .where(eq(events.id, eventId));

    return NextResponse.json({ success: true, message: 'Media gallery updated' });
  } catch (error) {
    console.error('Error updating media gallery:', error);
    return NextResponse.json({ error: 'Failed to update media gallery' }, { status: 500 });
  }
}
