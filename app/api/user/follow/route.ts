import { NextRequest, NextResponse } from 'next/server';
import { followUser, unfollowUser, isFollowing } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { followerId, followingId } = await request.json();

    if (!followerId || !followingId) {
      return NextResponse.json({ error: 'Both follower and following IDs are required' }, { status: 400 });
    }

    const success = await followUser(followerId, followingId);
    
    if (!success) {
      return NextResponse.json({ error: 'Already following this user' }, { status: 409 });
    }
    
    return NextResponse.json({ message: 'Successfully followed user' });
  } catch (error) {
    console.error('Error following user:', error);
    return NextResponse.json({ error: 'Failed to follow user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { followerId, followingId } = await request.json();

    if (!followerId || !followingId) {
      return NextResponse.json({ error: 'Both follower and following IDs are required' }, { status: 400 });
    }

    await unfollowUser(followerId, followingId);
    
    return NextResponse.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return NextResponse.json({ error: 'Failed to unfollow user' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const followerId = searchParams.get('followerId');
    const followingId = searchParams.get('followingId');

    if (!followerId || !followingId) {
      return NextResponse.json({ error: 'Both follower and following IDs are required' }, { status: 400 });
    }

    const following = await isFollowing(followerId, followingId);
    
    return NextResponse.json({ isFollowing: following });
  } catch (error) {
    console.error('Error checking follow status:', error);
    return NextResponse.json({ error: 'Failed to check follow status' }, { status: 500 });
  }
}