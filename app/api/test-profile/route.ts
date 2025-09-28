import { NextResponse } from 'next/server';
import { getUserByUsername, getAllEvents, getUserEvents } from '@/lib/auth';

export async function GET() {
  try {
    // First, let's seed the database if needed
    const seedResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/seed`, {
      method: 'POST',
    });
    
    if (!seedResponse.ok) {
      console.log('Seed may have already been run or failed');
    }

    // Get a test user
    const user = await getUserByUsername('johndoe');
    if (!user) {
      return NextResponse.json({ error: 'Test user not found' }, { status: 404 });
    }

    // Get all events
    const allEvents = await getAllEvents();
    
    // Get user events
    const userEvents = await getUserEvents(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        profilePicture: user.profilePicture,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      allEvents,
      userEvents,
      counts: {
        allEvents: allEvents.length,
        userEvents: userEvents.length,
      }
    });
  } catch (error) {
    console.error('Error in test-profile:', error);
    return NextResponse.json({ error: 'Failed to test profile' }, { status: 500 });
  }
}