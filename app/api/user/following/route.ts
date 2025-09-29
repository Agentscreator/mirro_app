import { NextRequest, NextResponse } from 'next/server';
import { getFollowing } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const following = await getFollowing(userId);
    
    return NextResponse.json({ following });
  } catch (error) {
    console.error('Error fetching following:', error);
    return NextResponse.json({ error: 'Failed to fetch following' }, { status: 500 });
  }
}