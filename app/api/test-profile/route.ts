import { NextResponse } from 'next/server';
import { getUserByUsername, getAllEvents, getUserEvents, getUserWithCounts } from '@/lib/auth';

export async function GET() {
  try {
    // REMOVED: Automatic seeding that was deleting all users
    // Only seed manually when needed for development

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