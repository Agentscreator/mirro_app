import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;
    
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Generate shareable URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/event/${eventId}`;

    return NextResponse.json({
      shareUrl,
      eventId
    });
  } catch (error) {
    console.error('Error generating share URL:', error);
    return NextResponse.json({ error: 'Failed to generate share URL' }, { status: 500 });
  }
}