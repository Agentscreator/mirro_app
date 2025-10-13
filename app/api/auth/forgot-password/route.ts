import { NextRequest, NextResponse } from 'next/server';
import { createPasswordResetToken } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Create reset token
    const token = await createPasswordResetToken(email);
    
    if (token) {
      // Send email and wait for result
      const emailSent = await sendPasswordResetEmail(email, token);
      
      if (emailSent) {
        return NextResponse.json({
          success: true,
          message: 'Password reset link has been sent to your email.',
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'Failed to send password reset email. Please try again.',
        }, { status: 500 });
      }
    } else {
      // No user found with this email
      return NextResponse.json({
        success: false,
        error: 'No account found with this email address.',
      }, { status: 404 });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}