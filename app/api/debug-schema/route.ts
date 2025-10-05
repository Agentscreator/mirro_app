import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check events table schema
    const columns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'events' 
      ORDER BY ordinal_position;
    `);
    
    // Check if visual_styling_url column exists
    const hasVisualStylingUrl = columns.some((col: any) => col.column_name === 'visual_styling_url');
    
    // Get sample event to see current structure
    const sampleEvents = await db.execute(sql`
      SELECT id, title, visual_styling, 
             CASE WHEN EXISTS (
               SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'events' AND column_name = 'visual_styling_url'
             ) THEN 'Column exists' ELSE 'Column missing' END as visual_styling_url_status
      FROM events 
      LIMIT 3;
    `);
    
    return NextResponse.json({
      success: true,
      schema: {
        columns: columns,
        hasVisualStylingUrl,
        totalColumns: columns.length
      },
      sampleEvents,
      message: hasVisualStylingUrl 
        ? 'visual_styling_url column exists' 
        : 'visual_styling_url column is missing - run migration'
    });
    
  } catch (error) {
    console.error('Schema debug error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}