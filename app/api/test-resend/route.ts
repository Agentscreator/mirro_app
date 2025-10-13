import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET(request: NextRequest) {
  try {
    console.log('=== TESTING RESEND CONFIGURATION ===');
    
    // Check environment variables
    const hasApiKey = !!process.env.RESEND_API_KEY;
    const hasFromEmail = !!process.env.FROM_EMAIL;
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;
    
    console.log('Has RESEND_API_KEY:', hasApiKey);
    console.log('Has FROM_EMAIL:', hasFromEmail);
    console.log('API Key (first 10 chars):', apiKey?.substring(0, 10));
    console.log('From Email:', fromEmail);
    
    if (!hasApiKey || !hasFromEmail) {
      return NextResponse.json({
        success: false,
        error: 'Missing configuration',
        details: {
          hasApiKey,
          hasFromEmail,
        }
      }, { status: 500 });
    }
    
    // Try to send a test email
    const resend = new Resend(apiKey);
    
    console.log('Attempting to send test email...');
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: ['joshmathbrown884@gmail.com'],
      subject: 'Test Email from Mirro',
      html: '<p>This is a test email to verify Resend configuration.</p>',
    });
    
    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to send email',
        details: error,
      }, { status: 500 });
    }
    
    console.log('Email sent successfully:', data);
    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      emailId: data?.id,
    });
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Exception occurred',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
