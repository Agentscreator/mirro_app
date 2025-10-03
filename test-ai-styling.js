// Simple test script to verify AI visual styling feature
const testEventData = {
  title: "Summer Music Festival",
  description: "Join us for an amazing outdoor music festival featuring local bands and food trucks. Bring your friends and enjoy a day of great music under the sun!",
  date: "2024-07-15",
  time: "14:00",
  location: "Central Park, New York"
};

async function testAIVisualStyling() {
  try {
    console.log('Testing AI Visual Styling Feature...');
    console.log('Event Data:', testEventData);
    
    const response = await fetch('http://localhost:3000/api/analyze-visual-style', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEventData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('\n✅ AI Visual Analysis Result:');
    console.log('Theme:', result.theme);
    console.log('Energy:', result.energy);
    console.log('Formality:', result.formality);
    console.log('Mood:', result.mood);
    console.log('Visual Elements:', result.visualElements);
    console.log('Color Palette:', result.colorPalette);
    console.log('Styling:', result.styling);
    console.log('Reasoning:', result.reasoning);
    
    console.log('\n🎨 Generated CSS Classes:');
    console.log('Gradient:', result.styling.gradient);
    console.log('Primary Color:', result.styling.primaryColor);
    console.log('Font:', result.styling.font);
    console.log('Layout:', result.styling.layout);
    
  } catch (error) {
    console.error('❌ Error testing AI visual styling:', error);
  }
}

// Test the generate-event endpoint with visual styling
async function testEventGeneration() {
  try {
    console.log('\n\nTesting Event Generation with Visual Styling...');
    
    const response = await fetch('http://localhost:3000/api/generate-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: "Birthday party for my friend Sarah next Saturday at 7 PM",
        method: "generate"
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('\n✅ Generated Event with Visual Styling:');
    console.log('Title:', result.title);
    console.log('Description:', result.description);
    console.log('Date:', result.date);
    console.log('Time:', result.time);
    console.log('Location:', result.location);
    
    if (result.visualStyling) {
      console.log('\n🎨 Visual Styling Applied:');
      console.log('Theme:', result.visualStyling.theme);
      console.log('Mood:', result.visualStyling.mood);
      console.log('Gradient:', result.visualStyling.styling.gradient);
    } else {
      console.log('\n⚠️ No visual styling generated');
    }
    
  } catch (error) {
    console.error('❌ Error testing event generation:', error);
  }
}

// Run tests
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  testAIVisualStyling().then(() => testEventGeneration());
} else {
  // Browser environment
  testAIVisualStyling().then(() => testEventGeneration());
}

console.log('🚀 AI Visual Styling Test Started...');
console.log('Make sure your development server is running on http://localhost:3000');