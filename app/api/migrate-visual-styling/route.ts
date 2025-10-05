import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('Adding visual_styling_url column to events table...');

    // Add the column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE events ADD COLUMN IF NOT EXISTS visual_styling_url text;
    `);
    
    console.log('Successfully added visual_styling_url column to events table');
    
    // Check if the column was added
    const checkResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'events' AND column_name = 'visual_styling_url';
    `);
    
    const columnExists = checkResult.length > 0;
    
    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      columnExists,
      details: columnExists 
        ? 'Column visual_styling_url exists in events table'
        : 'Column visual_styling_url was not found'
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}