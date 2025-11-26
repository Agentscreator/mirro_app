import { NextRequest, NextResponse } from 'next/server';
import { verifyPinAttempt } from '@/lib/parental-controls';
import { db } from '@/lib/db';
import { users, parentalControls, pinAttempts, pinResetTokens } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { userId, pin } = await request.json();
    
    if (!userId || !pin) {
      return NextResponse.json(
        { error: 'User ID and PIN are required' },
        { status: 400 }
      );
    }
    
    // Verify PIN before disabling
    const verification = await verifyPinAttempt(userId, pin);
    if (!verification.success) {
      return NextResponse.json(
        { error: verification.error || 'Invalid PIN' },
        { status: 401 }
      );
    }
    
    // Delete parental controls
    await db.delete(parentalControls).where(eq(parentalControls.userId, userId));
    
    // Delete PIN attempts
    await db.delete(pinAttempts).where(eq(pinAttempts.userId, userId));
    
    // Delete any unused PIN reset tokens
    await db.delete(pinResetTokens).where(eq(pinResetTokens.userId, userId));
    
    // Update user to adult status
    await db.update(users)
      .set({ ageCategory: 'adult' })
      .where(eq(users.id, userId));
    
    // Send notification email to guardian
    try {
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (user.length > 0 && user[0].guardianEmail) {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        await resend.emails.send({
          from: process.env.FROM_EMAIL || 'noreply@mirro2.com',
          to: user[0].guardianEmail,
          subject: `Mirro: Parental controls disabled for ${user[0].name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ff9800;">⚠️ Parental Controls Disabled</h2>
              <p>Hello,</p>
              <p>Parental controls have been disabled for <strong>${user[0].name}</strong> (@${user[0].username}) on Mirro.</p>
              
              <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
                <p style="margin: 5px 0;"><strong>All restrictions have been removed:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Messaging restrictions removed</li>
                  <li>Event creation restrictions removed</li>
                  <li>Content filtering disabled</li>
                  <li>Guardian notifications stopped</li>
                </ul>
              </div>
              
              <p>The account now has full access to all features.</p>
              
              <p style="color: #666; font-size: 12px; margin-top: 30px;">
                If you did not authorize this change, please contact support immediately at mirrosocial@gmail.com
              </p>
            </div>
          `,
        });
      }
    } catch (emailError) {
      console.error('Failed to send disable notification email:', emailError);
      // Don't fail the disable operation if email fails
    }
    
    return NextResponse.json({
      success: true,
      message: 'Parental controls have been disabled successfully',
    });
  } catch (error: any) {
    console.error('Error disabling parental controls:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to disable parental controls' },
      { status: 500 }
    );
  }
}
