import { NextRequest, NextResponse } from 'next/server';
import { getEventById, getEventParticipants, getUserById } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const event = await getEventById(params.eventId);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Get creator information
    const creator = await getUserById(event.createdBy);

    // Get participants/attendees
    const participants = await getEventParticipants(event.id);

    // Include creator as an attendee if they're not already in participants
    const creatorAsAttendee = {
      id: event.createdBy,
      name: creator?.name || 'Unknown',
      username: creator?.username || 'unknown',
      profilePicture: creator?.profilePicture || null,
      joinedAt: event.createdAt,
    };

    // Check if creator is already in participants list
    const isCreatorInParticipants = participants.some(p => p.id === event.createdBy);

    // Combine creator and participants, ensuring creator is first
    const allAttendees = isCreatorInParticipants
      ? participants
      : [creatorAsAttendee, ...participants];

    // Return event with full details
    const eventWithDetails = {
      ...event,
      creatorName: creator?.name,
      creatorUsername: creator?.username,
      creatorProfilePicture: creator?.profilePicture,
      attendees: allAttendees,
      attendeeCount: allAttendees.length,
    };

    return NextResponse.json(eventWithDetails);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}