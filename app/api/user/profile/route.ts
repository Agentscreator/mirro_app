import { NextRequest, NextResponse } from 'next/server';
import { updateUserProfile } from '@/lib/auth';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, profilePicture, followersCount, followingCount } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updates: any = {};
    if (profilePicture !== undefined) updates.profilePicture = profilePicture;
    if (followersCount !== undefined) updates.followersCount = followersCount;
    if (followingCount !== undefined) updates.followingCount = followingCount;

    const updatedUser = await updateUserProfile(userId, updates);
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}