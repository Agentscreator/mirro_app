// Quick test to debug the forgot password issue
const testForgotPassword = async () => {
  try {
    console.log('Testing forgot password endpoint...');
    
    const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'joshmathrown8884@gmail.com'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Response data:', data);
    
  } catch (error) {
    console.error('Test error:', error);
  }
};

testForgotPassword();