import { NextRequest, NextResponse } from 'next/server';
import { createPasswordResetToken } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    console.log('=== FORGOT PASSWORD REQUEST START ===');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { email } = forgotPasswordSchema.parse(body);
    console.log('Parsed email:', email);

    // Create reset token
    console.log('Creating password reset token...');
    let token;
    try {
      token = await createPasswordResetToken(email);
      console.log('Token created:', !!token);
      console.log('Token value (first 10 chars):', token?.substring(0, 10));
    } catch (tokenError) {
      console.error('Token creation error:', tokenError);
      throw tokenError;
    }
    
    if (token) {
      // Send email and wait for result
      console.log('Sending password reset email...');
      try {
        const emailSent = await sendPasswordResetEmail(email, token);
        console.log('Email sent result:', emailSent);
        console.log('Email sent type:', typeof emailSent);
        
        if (emailSent === true) {
          console.log('=== FORGOT PASSWORD SUCCESS ===');
          return NextResponse.json({
            success: true,
            message: 'Password reset link has been sent to your email.',
          });
        } else {
          console.log('=== FORGOT PASSWORD EMAIL FAILED ===');
          console.log('emailSent value:', emailSent);
          return NextResponse.json({
            success: false,
            error: 'Failed to send password reset email. Please try again.',
          }, { status: 500 });
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        return NextResponse.json({
          success: false,
          error: 'Failed to send password reset email. Please try again.',
          details: emailError instanceof Error ? emailError.message : 'Unknown error'
        }, { status: 500 });
      }
    } else {
      // No user found with this email
      console.log('=== FORGOT PASSWORD NO USER FOUND ===');
      // For security, return success message even if user not found
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    }

  } catch (error) {
    console.error('=== FORGOT PASSWORD ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error instanceof z.ZodError) {
      console.log('Validation error:', error.errors);
      return NextResponse.json(
        { error: 'Invalid email address', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Something went wrong. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}