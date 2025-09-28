import { NextResponse } from 'next/server';
import { getUserByUsername, getAllEvents, getUserEvents, getUserWithCounts } from '@/lib/auth';

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

    // Get user with follower counts
    const userWithCounts = await getUserWithCounts(user.id);
    if (!userWithCounts) {
      return NextResponse.json({ error: 'Failed to get user data' }, { status: 500 });
    }

    // Get all events
    const allEvents = await getAllEvents();
    
    // Get user events
    const userEvents = await getUserEvents(user.id);

    return NextResponse.json({
      user: {
        id: userWithCounts.id,
        name: userWithCounts.name,
        username: userWithCounts.username,
        profilePicture: userWithCounts.profilePicture,
        followersCount: userWithCounts.followersCount,
        followingCount: userWithCounts.followingCount,
        createdAt: userWithCounts.createdAt,
        updatedAt: userWithCounts.updatedAt,
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