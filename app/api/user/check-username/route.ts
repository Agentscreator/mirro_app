import { NextRequest, NextResponse } from 'next/server';
import { checkUsernameAvailability } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const currentUserId = searchParams.get('currentUserId');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Basic username validation
    if (username.length < 3) {
      return NextResponse.json({ 
        available: false, 
        error: 'Username must be at least 3 characters long' 
      });
    }

    if (username.length > 30) {
      return NextResponse.json({ 
        available: false, 
        error: 'Username must be less than 30 characters long' 
      });
    }

    // Check if username contains only valid characters (alphanumeric and underscore)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ 
        available: false, 
        error: 'Username can only contain letters, numbers, and underscores' 
      });
    }

    const isAvailable = await checkUsernameAvailability(username, currentUserId || undefined);
    
    return NextResponse.json({ 
      available: isAvailable,
      username: username
    });
  } catch (error) {
    console.error('Error checking username availability:', error);
    return NextResponse.json({ error: 'Failed to check username availability' }, { status: 500 });
  }
}