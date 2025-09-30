const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function completeSetup() {
  console.log('🚀 Starting complete app setup...\n');

  try {
    // Step 1: Check environment
    console.log('1️⃣ Checking environment...');
    if (!fs.existsSync('.env')) {
      console.log('❌ .env file not found!');
      console.log('💡 Please create a .env file with the required environment variables');
      return;
    }
    
    const envContent = fs.readFileSync('.env', 'utf8');
    if (!envContent.includes('DATABASE_URL')) {
      console.log('❌ DATABASE_URL not found in .env file!');
      return;
    }
    console.log('✅ Environment configuration found');

    // Step 2: Install dependencies
    console.log('\n2️⃣ Installing dependencies...');
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('✅ Dependencies installed');
    } catch (error) {
      console.log('❌ Failed to install dependencies');
      throw error;
    }

    // Step 3: Setup database
    console.log('\n3️⃣ Setting up database...');
    try {
      execSync('npm run db:generate', { stdio: 'inherit' });
      execSync('npm run db:push', { stdio: 'inherit' });
      console.log('✅ Database schema created');
    } catch (error) {
      console.log('❌ Failed to setup database');
      throw error;
    }

    // Step 4: Seed database
    console.log('\n4️⃣ Seeding database...');
    try {
      execSync('npm run db:seed', { stdio: 'inherit' });
      console.log('✅ Database seeded with sample data');
    } catch (error) {
      console.log('❌ Failed to seed database');
      throw error;
    }

    // Step 5: Create directories if needed
    console.log('\n5️⃣ Creating required directories...');
    const dirs = ['lib/db/migrations', 'public/uploads'];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      }
    });

    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Start the development server: npm run dev');
    console.log('   2. Open http://localhost:3000 in your browser');
    console.log('   3. Create an account or use sample users:');
    console.log('      - Username: johndoe, Password: password123');
    console.log('      - Username: janesmith, Password: password123');
    console.log('\n🛠️  Additional commands:');
    console.log('   - View database: npm run db:studio');
    console.log('   - Run tests: node scripts/test-integration.js');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your DATABASE_URL in .env');
    console.log('   2. Ensure your database server is running');
    console.log('   3. Check network connectivity');
    console.log('   4. Review the error message above');
  }
}

completeSetup();