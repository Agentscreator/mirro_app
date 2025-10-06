import { NextRequest, NextResponse } from 'next/server';
import { getEventById } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    console.log('🔍 API: Raw params object:', JSON.stringify(params));
    console.log('🔍 API: Request URL:', request.url);
    console.log('🔍 API: Request pathname:', new URL(request.url).pathname);

    const { eventId } = params;

    console.log('🔍 API: Extracted event ID:', eventId);
    console.log('🔧 API: Event ID type:', typeof eventId);
    console.log('🔧 API: Event ID length:', eventId?.length);
    console.log('🔧 API: Event ID characters:', eventId?.split('').map((c, i) => `[${i}]=${c}`).join(' '));
    
    if (!eventId) {
      console.log('❌ API: No event ID provided');
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Check if eventId looks like a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(eventId)) {
      console.log('❌ API: Invalid UUID format:', eventId);
      return NextResponse.json({ 
        error: 'Invalid event ID format. Expected UUID format.',
        receivedId: eventId,
        expectedFormat: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
      }, { status: 400 });
    }

    console.log('✅ API: Event ID format is valid, fetching from database...');
    const event = await getEventById(eventId);
    
    if (!event) {
      console.log('❌ API: Event not found in database');
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    console.log('✅ API: Event found successfully:', event.title);
    return NextResponse.json(event);
  } catch (error) {
    console.error('❌ API: Error fetching event:', error);
    console.error('❌ API: Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ 
      error: 'Failed to fetch event',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}