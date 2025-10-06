// Test script to verify API endpoints are working
const BASE_URL = 'http://localhost:3000';

async function testEndpoints() {
  console.log('Testing API endpoints...\n');

  // Test 1: Check if events API is accessible
  try {
    console.log('1. Testing GET /api/events');
    const response = await fetch(`${BASE_URL}/api/events`);
    console.log(`   Status: ${response.status}`);
    if (response.ok) {
      const data = await response.json();
      console.log(`   Response: Found ${Array.isArray(data) ? data.length : 'unknown'} events`);
    } else {
      const error = await response.text();
      console.log(`   Error: ${error}`);
    }
  } catch (error) {
    console.log(`   Network Error: ${error.message}`);
  }

  console.log('');

  // Test 2: Check if individual event API works (with a fake ID)
  try {
    console.log('2. Testing GET /api/events/[eventId] (with fake ID)');
    const fakeId = '123e4567-e89b-12d3-a456-426614174000';
    const response = await fetch(`${BASE_URL}/api/events/${fakeId}`);
    console.log(`   Status: ${response.status}`);
    if (response.status === 404) {
      console.log('   Response: 404 (expected for fake ID)');
    } else {
      const data = await response.text();
      console.log(`   Response: ${data}`);
    }
  } catch (error) {
    console.log(`   Network Error: ${error.message}`);
  }

  console.log('');

  // Test 3: Check if generate-event API works
  try {
    console.log('3. Testing POST /api/generate-event');
    const response = await fetch(`${BASE_URL}/api/generate-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: 'Birthday party tomorrow at 7 PM',
        method: 'extract'
      })
    });
    console.log(`   Status: ${response.status}`);
    if (response.ok) {
      const data = await response.json();
      console.log(`   Response: Generated event "${data.title}"`);
    } else {
      const error = await response.text();
      console.log(`   Error: ${error}`);
    }
  } catch (error) {
    console.log(`   Network Error: ${error.message}`);
  }

  console.log('');

  // Test 4: Check if analyze-visual-style API works
  try {
    console.log('4. Testing POST /api/analyze-visual-style');
    const response = await fetch(`${BASE_URL}/api/analyze-visual-style`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Birthday Party',
        description: 'A fun birthday celebration',
        location: 'My house',
        date: '2024-12-15',
        time: '19:00'
      })
    });
    console.log(`   Status: ${response.status}`);
    if (response.ok) {
      const data = await response.json();
      console.log(`   Response: Generated ${data.theme} theme`);
    } else {
      const error = await response.text();
      console.log(`   Error: ${error}`);
    }
  } catch (error) {
    console.log(`   Network Error: ${error.message}`);
  }

  console.log('\nTest completed!');
}

// Run the tests
testEndpoints().catch(console.error);