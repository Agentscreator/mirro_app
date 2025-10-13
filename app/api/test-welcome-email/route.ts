import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();
    
    if (!email || !name) {
      return NextResponse.json({
        success: false,
        error: 'Email and name are required',
      }, { status: 400 });
    }
    
    console.log('Testing welcome email send to:', email, 'for:', name);
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
    
    // Test sending welcome email
    const result = await sendWelcomeEmail(email, name);
    
    return NextResponse.json({
      success: result,
      message: result ? 'Welcome email sent successfully' : 'Failed to send welcome email',
      config: {
        hasApiKey: !!process.env.RESEND_API_KEY,
        fromEmail: process.env.FROM_EMAIL,
      }
    });
    
  } catch (error) {
    console.error('Test welcome email error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}