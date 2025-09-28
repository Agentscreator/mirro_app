import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Simple query to test database connection
    const result = await db.execute('SELECT NOW() as current_time');
    
    return NextResponse.json({
      message: 'Database connection successful',
      timestamp: result.rows[0],
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { error: 'Database connection failed' },
      { status: 500 }
    );
  }
}