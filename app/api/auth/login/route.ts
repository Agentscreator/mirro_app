import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, verifyPassword, getUserWithCounts } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const user = await getUserByUsername(username);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Get user data with follower counts
    const userWithCounts = await getUserWithCounts(user.id);
    if (!userWithCounts) {
      return NextResponse.json({ error: 'User data not found' }, { status: 500 });
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = userWithCounts;
    
    return NextResponse.json({ 
      message: 'Login successful',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}