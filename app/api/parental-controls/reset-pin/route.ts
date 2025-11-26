import { NextRequest, NextResponse } from 'next/server';
import { generatePinResetToken } from '@/lib/parental-controls';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Find user by guardian email
    const userRecords = await db.select()
      .from(users)
      .where(eq(users.guardianEmail, email))
      .limit(1);
    
    if (userRecords.length === 0) {
      // Don't reveal if email exists for security
      return NextResponse.json({
        success: true,
        message: 'If this email is registered as a guardian email, a reset link has been sent.',
      });
    }
    
    const user = userRecords[0];
    const token = await generatePinResetToken(user.id);
    
    // TODO: Send email with reset link
    // For now, return token in response (in production, this should be sent via email)
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-pin?token=${token}`;
    
    console.log('PIN Reset Link:', resetLink);
    
    return NextResponse.json({
      success: true,
      message: 'If this email is registered as a guardian email, a reset link has been sent.',
      // Remove this in production:
      resetLink,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
