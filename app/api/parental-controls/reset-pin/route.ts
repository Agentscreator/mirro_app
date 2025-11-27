import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, parentalControls } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Generate a random 4-digit PIN
function generateRandomPin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

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
        message: 'If this email is registered as a guardian email, a new PIN has been sent.',
      });
    }
    
    const user = userRecords[0];
    
    // Generate new PIN
    const newPin = generateRandomPin();
    const hashedPin = await bcrypt.hash(newPin, 10);
    
    // Update PIN in database
    await db.update(parentalControls)
      .set({ pin: hashedPin, updatedAt: new Date() })
      .where(eq(parentalControls.userId, user.id));
    
    // Send new PIN via email
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@mirro2.com',
        to: email,
        subject: `Mirro: Your New Parental Controls PIN`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2196F3;">🔐 Your New PIN</h2>
            <p>Hello,</p>
            <p>You requested a new PIN for parental controls for <strong>${user.name}</strong> (@${user.username}).</p>
            
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Your new PIN is:</p>
              <p style="margin: 0; font-size: 48px; font-weight: bold; color: #2196F3; letter-spacing: 8px;">${newPin}</p>
            </div>
            
            <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
              <p style="margin: 5px 0;"><strong>⚠️ Keep this PIN secure!</strong></p>
              <p style="margin: 5px 0; font-size: 14px;">Your old PIN has been replaced with this new one.</p>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              If you didn't request this PIN reset, please contact support immediately at mirrosocial@gmail.com
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send PIN reset email:', emailError);
      // Don't fail the reset if email fails
    }
    
    return NextResponse.json({
      success: true,
      message: 'If this email is registered as a guardian email, a new PIN has been sent.',
    });
  } catch (error: any) {
    console.error('Error resetting PIN:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
