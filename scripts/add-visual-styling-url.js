const postgres = require('postgres');
require('dotenv').config();

async function addVisualStylingUrlColumn() {
  const sql = postgres(process.env.DATABASE_URL);

  try {
    console.log('Connected to database');

    // Add the column if it doesn't exist
    await sql`
      ALTER TABLE events ADD COLUMN IF NOT EXISTS visual_styling_url text;
    `;
    
    console.log('Successfully added visual_styling_url column to events table');
    
    // Check if the column was added
    const checkResult = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'events' AND column_name = 'visual_styling_url';
    `;
    
    if (checkResult.length > 0) {
      console.log('Column visual_styling_url exists in events table');
    } else {
      console.log('Column visual_styling_url was not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.end();
    console.log('Database connection closed');
  }
}

addVisualStylingUrlColumn();