import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const testEmail = 'joshmathrown8884@gmail.com';
  
  try {
    console.log('=== TESTING FORGOT PASSWORD API ===');
    
    // Test the forgot password endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: testEmail }),
    });
    
    const data = await response.json();
    
    return NextResponse.json({
      testEmail,
      status: response.status,
      statusText: response.statusText,
      responseData: data,
      headers: Object.fromEntries(response.headers.entries()),
    });
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  
  try {
    console.log('=== DIRECT TESTING FORGOT PASSWORD ===');
    
    // Import the functions directly to test them
    const { createPasswordResetToken } = await import('@/lib/auth');
    const { sendPasswordResetEmail } = await import('@/lib/email');
    
    console.log('Testing with email:', email);
    
    // Test token creation
    console.log('Step 1: Creating token...');
    const token = await createPasswordResetToken(email);
    console.log('Token result:', !!token);
    
    if (!token) {
      return NextResponse.json({
        step: 'token_creation',
        success: false,
        message: 'No user found with this email or token creation failed',
      });
    }
    
    // Test email sending
    console.log('Step 2: Sending email...');
    const emailSent = await sendPasswordResetEmail(email, token);
    console.log('Email sent:', emailSent);
    
    return NextResponse.json({
      step: 'complete',
      success: true,
      tokenCreated: !!token,
      emailSent,
      message: 'Test completed successfully',
    });
    
  } catch (error) {
    console.error('Direct test error:', error);
    return NextResponse.json({
      step: 'error',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}