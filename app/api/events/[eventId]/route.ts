import { NextRequest, NextResponse } from 'next/server';
import { getEventById, getEventParticipants, getUserById } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;
    
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Get event details
    const event = await getEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Get event creator details
    const creator = await getUserById(event.createdBy);
    
    // Get event participants
    const participants = await getEventParticipants(eventId);
    
    // Include creator as an attendee if they're not already in participants
    const creatorAsAttendee = {
      id: creator?.id || event.createdBy,
      name: creator?.name || 'Unknown',
      username: creator?.username || 'unknown',
      profilePicture: creator?.profilePicture || null,
      joinedAt: event.createdAt, // Creator joined when they created the event
    };

    // Check if creator is already in participants list
    const isCreatorInParticipants = participants.some(p => p.id === event.createdBy);
    
    // Combine creator and participants, ensuring creator is first
    const allAttendees = isCreatorInParticipants 
      ? participants 
      : [creatorAsAttendee, ...participants];

    const eventWithDetails = {
      ...event,
      creatorName: creator?.name,
      creatorUsername: creator?.username,
      attendees: allAttendees,
      attendeeCount: allAttendees.length,
    };

    return NextResponse.json(eventWithDetails);
  } catch (error) {
    console.error('Error fetching event details:', error);
    return NextResponse.json({ error: 'Failed to fetch event details' }, { status: 500 });
  }
}