const { execSync } = require('child_process');

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database...');
    
    // Generate migrations
    console.log('📝 Generating database migrations...');
    execSync('npm run db:generate', { stdio: 'inherit' });
    
    // Push schema to database
    console.log('🔄 Pushing schema to database...');
    execSync('npm run db:push', { stdio: 'inherit' });
    
    console.log('✅ Database setup completed successfully!');
    console.log('💡 You can now run the seed script to add sample data:');
    console.log('   npm run db:seed');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();