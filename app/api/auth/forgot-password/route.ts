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
      // Send email (don't await to avoid timing attacks)
      sendPasswordResetEmail(email, token).catch(error => {
        console.error('Failed to send password reset email:', error);
      });
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we\'ve sent a password reset link.',
    });

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