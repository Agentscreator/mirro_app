import { config } from 'dotenv';
config(); // Load environment variables

import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function addVisualStylingUrlColumn() {
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
    
    if (checkResult.length > 0) {
      console.log('✅ Column visual_styling_url exists in events table');
    } else {
      console.log('❌ Column visual_styling_url was not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
  
  console.log('✅ Migration completed successfully');
  process.exit(0);
}

addVisualStylingUrlColumn();