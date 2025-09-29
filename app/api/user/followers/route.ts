import { NextRequest, NextResponse } from 'next/server';
import { getFollowers } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const followers = await getFollowers(userId);
    
    return NextResponse.json({ followers });
  } catch (error) {
    console.error('Error fetching followers:', error);
    return NextResponse.json({ error: 'Failed to fetch followers' }, { status: 500 });
  }
}