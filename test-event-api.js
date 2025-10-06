// Quick test script for the event API
const BASE_URL = 'http://localhost:3000'; // Change this if your server runs on a different port

async function testEventAPI() {
    console.log('🧪 Testing Event API Endpoints\n');
    console.log(`Base URL: ${BASE_URL}\n`);

    // Test 1: Get all events
    console.log('1️⃣ Testing GET /api/events');
    console.log('─'.repeat(50));
    try {
        const response = await fetch(`${BASE_URL}/api/events`);
        const data = await response.json();
        
        if (response.ok) {
            console.log(`✅ SUCCESS - Status: ${response.status}`);
            console.log(`📊 Found ${Array.isArray(data) ? data.length : 'unknown'} events`);
            
            if (Array.isArray(data) && data.length > 0) {
                console.log('\n📋 Available Events:');
                data.forEach((event, index) => {
                    console.log(`   ${index + 1}. ${event.title} (ID: ${event.id})`);
                    console.log(`      Created by: ${event.creatorName || 'Unknown'}`);
                    console.log(`      Date: ${event.date} at ${event.time}`);
                });
            } else {
                console.log('📝 No events found in database');
            }
        } else {
            console.log(`❌ ERROR - Status: ${response.status}`);
            console.log(`Response: ${JSON.stringify(data, null, 2)}`);
        }
    } catch (error) {
        console.log(`❌ NETWORK ERROR: ${error.message}`);
        console.log('💡 Make sure your development server is running (npm run dev)');
    }

    console.log('\n');

    // Test 2: Test specific event ID
    const testEventId = 'f1cdf3e-928b-473b-8bf4-ee79908fb49'; // The ID from your URL
    console.log(`2️⃣ Testing GET /api/events/${testEventId}`);
    console.log('─'.repeat(50));
    try {
        const response = await fetch(`${BASE_URL}/api/events/${testEventId}`);
        const data = await response.json();
        
        if (response.ok) {
            console.log(`✅ SUCCESS - Status: ${response.status}`);
            console.log(`📄 Event Details:`);
            console.log(`   Title: ${data.title}`);
            console.log(`   Description: ${data.description}`);
            console.log(`   Date: ${data.date} at ${data.time}`);
            console.log(`   Location: ${data.location}`);
            console.log(`   Created by: ${data.createdBy}`);
            console.log(`   Event ID: ${data.id}`);
        } else if (response.status === 404) {
            console.log(`⚠️  EVENT NOT FOUND - Status: 404`);
            console.log(`🔍 The event ID "${testEventId}" doesn't exist in the database`);
            console.log(`Response: ${JSON.stringify(data, null, 2)}`);
        } else {
            console.log(`❌ ERROR - Status: ${response.status}`);
            console.log(`Response: ${JSON.stringify(data, null, 2)}`);
        }
    } catch (error) {
        console.log(`❌ NETWORK ERROR: ${error.message}`);
    }

    console.log('\n');

    // Test 3: Database connection test
    console.log('3️⃣ Testing Database Connection');
    console.log('─'.repeat(50));
    try {
        const response = await fetch(`${BASE_URL}/api/events`);
        if (response.ok) {
            console.log('✅ Database connection appears to be working');
        } else if (response.status >= 500) {
            console.log('❌ Database connection might be failing (500 error)');
            console.log('💡 Check your DATABASE_URL in .env file');
        }
    } catch (error) {
        console.log(`❌ Cannot reach server: ${error.message}`);
    }

    console.log('\n🏁 Test completed!');
    console.log('\n💡 Next steps:');
    console.log('   1. If events are found, try visiting: http://localhost:3000/event/[event-id]');
    console.log('   2. If no events found, create one through the app first');
    console.log('   3. Check browser console for any JavaScript errors');
}

// Run the test
testEventAPI().catch(console.error);