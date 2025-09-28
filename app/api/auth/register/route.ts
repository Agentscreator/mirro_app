import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByUsername } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { name, username, password } = await request.json();

    if (!name || !username || !password) {
      return NextResponse.json({ error: 'Name, username, and password are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    // Create new user
    const newUser = await createUser(name, username, password);
    
    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser;
    
    return NextResponse.json({ 
      message: 'Account created successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error during registration:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}