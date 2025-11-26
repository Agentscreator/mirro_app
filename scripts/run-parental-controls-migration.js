const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set. Run with: DATABASE_URL="your-url" node scripts/run-parental-controls-migration.js');
  }
  
  const sql = postgres(process.env.DATABASE_URL);

  try {
    console.log('🔄 Starting parental controls migration...');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../migrations/0001_add_parental_controls_safe.sql'),
      'utf8'
    );

    await sql.unsafe(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('\nAdded:');
    console.log('  - date_of_birth, age_category, guardian_email columns to users table');
    console.log('  - is_public, is_mature columns to events table');
    console.log('  - parental_controls table');
    console.log('  - pin_attempts table');
    console.log('  - pin_reset_tokens table');
    console.log('  - Performance indexes');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    throw error;
  } finally {
    await sql.end();
  }
}

runMigration().catch(console.error);
