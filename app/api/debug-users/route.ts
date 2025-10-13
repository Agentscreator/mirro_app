import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUGGING USERS ===');
    
    // Get all users (just email and username for privacy)
    const allUsers = await db.select({
      email: users.email,
      username: users.username,
      name: users.name,
      createdAt: users.createdAt,
    }).from(users);
    
    console.log('Found users:', allUsers.length);
    
    return NextResponse.json({
      userCount: allUsers.length,
      users: allUsers,
    });
    
  } catch (error) {
    console.error('Debug users error:', error);
    return NextResponse.json({
      error: 'Failed to fetch users',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}