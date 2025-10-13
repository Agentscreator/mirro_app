import { NextRequest, NextResponse } from 'next/server';
import { resetPassword, validatePasswordResetToken } from '@/lib/auth';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

    // Reset the password
    const success = await resetPassword(token, password);

    if (!success) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully',
    });

  } catch (error) {
    console.error('Reset password error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

// Validate token endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const userId = await validatePasswordResetToken(token);
    
    return NextResponse.json({
      valid: !!userId,
    });

  } catch (error) {
    console.error('Validate token error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}