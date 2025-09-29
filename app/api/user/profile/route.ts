import { NextRequest, NextResponse } from 'next/server';
import { updateUserProfile, getUserWithCounts, checkUsernameAvailability } from '@/lib/auth';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, profilePicture, name, username } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updates: any = {};
    if (profilePicture !== undefined) updates.profilePicture = profilePicture;
    if (name !== undefined) updates.name = name;
    if (username !== undefined) updates.username = username;

    const updatedUser = await updateUserProfile(userId, updates);

    // Get user with updated counts
    const userWithCounts = await getUserWithCounts(userId);

    return NextResponse.json(userWithCounts);
  } catch (error) {
    console.error('Error updating user profile:', error);

    // Handle specific username conflict error
    if (error instanceof Error && error.message === 'Username already exists') {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userWithCounts = await getUserWithCounts(userId);

    if (!userWithCounts) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(userWithCounts);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}