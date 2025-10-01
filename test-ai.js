// Simple test script to verify AI generation API
const testAIGeneration = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/generate-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: 'Birthday party for my friend',
        method: 'generate',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      return;
    }

    const eventData = await response.json();
    console.log('Generated Event:', eventData);
  } catch (error) {
    console.error('Test Error:', error);
  }
};

testAIGeneration();