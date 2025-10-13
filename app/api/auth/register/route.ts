import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByUsername, getUserByEmail, getUserWithCounts } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { name, username, email, password } = await request.json();

    if (!name || !username || !email || !password) {
      return NextResponse.json({ error: 'Name, username, email, and password are required' }, { status: 400 });
    }

    // Check if username already exists
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    // Check if email already exists
    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    // Create new user
    const newUser = await createUser(name, username, email, password);

    // Get user data with follower counts (will be 0 for new user)
    const userWithCounts = await getUserWithCounts(newUser.id);
    if (!userWithCounts) {
      return NextResponse.json({ error: 'Failed to retrieve user data' }, { status: 500 });
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = userWithCounts;

    return NextResponse.json({
      message: 'Account created successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error during registration:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}