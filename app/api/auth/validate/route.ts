import { NextRequest, NextResponse } from 'next/server';
import { getUserWithCounts } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user data with follower counts to validate session
    const userWithCounts = await getUserWithCounts(userId);
    if (!userWithCounts) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = userWithCounts;
    
    return NextResponse.json({ 
      message: 'Session valid',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error during session validation:', error);
    return NextResponse.json({ error: 'Session validation failed' }, { status: 500 });
  }
}