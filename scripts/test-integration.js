const { execSync } = require('child_process');

async function testIntegration() {
  console.log('🧪 Running integration tests...\n');

  try {
    // Test 1: Database Connection
    console.log('1️⃣ Testing database connection...');
    try {
      const response = await fetch('http://localhost:3000/api/test-db');
      if (response.ok) {
        console.log('✅ Database connection successful');
      } else {
        console.log('❌ Database connection failed');
      }
    } catch (error) {
      console.log('❌ Database connection failed - Server not running?');
    }

    // Test 2: User Registration
    console.log('\n2️⃣ Testing user registration...');
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          username: 'testuser_' + Date.now(),
          password: 'password123'
        })
      });
      
      if (response.ok) {
        console.log('✅ User registration successful');
      } else {
        console.log('❌ User registration failed');
      }
    } catch (error) {
      console.log('❌ User registration failed - Server not running?');
    }

    // Test 3: Event Creation
    console.log('\n3️⃣ Testing event creation...');
    try {
      // First get a user
      const users = await fetch('http://localhost:3000/api/test-profile');
      if (users.ok) {
        const userData = await users.json();
        if (userData.length > 0) {
          const response = await fetch('http://localhost:3000/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: 'Test Event',
              description: 'This is a test event',
              date: '2024-12-01',
              time: '18:00',
              location: 'Test Location',
              createdBy: userData[0].id
            })
          });
          
          if (response.ok) {
            console.log('✅ Event creation successful');
          } else {
            console.log('❌ Event creation failed');
          }
        }
      }
    } catch (error) {
      console.log('❌ Event creation failed - Server not running?');
    }

    console.log('\n🎉 Integration test completed!');
    console.log('\n💡 To run these tests:');
    console.log('   1. Start the development server: npm run dev');
    console.log('   2. Run this script: node scripts/test-integration.js');

  } catch (error) {
    console.error('❌ Integration test failed:', error);
  }
}

// Check if server is running
console.log('🚀 Make sure your development server is running (npm run dev)');
console.log('⏳ Waiting 3 seconds before starting tests...\n');

setTimeout(testIntegration, 3000);