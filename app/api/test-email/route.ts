import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    console.log('Testing email send to:', email);
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
    
    // Test sending email
    const result = await sendPasswordResetEmail(email, 'test-token-123');
    
    return NextResponse.json({
      success: result,
      message: result ? 'Test email sent successfully' : 'Failed to send test email',
      config: {
        hasApiKey: !!process.env.RESEND_API_KEY,
        fromEmail: process.env.FROM_EMAIL,
      }
    });
    
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}