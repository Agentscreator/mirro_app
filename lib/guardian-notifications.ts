import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.FROM_EMAIL || 'noreply@mirro2.com';

interface NotificationData {
  guardianEmail: string;
  minorName: string;
  minorUsername: string;
}

/**
 * Send notification when minor receives message from new contact
 */
export async function sendNewContactMessageNotification(
  data: NotificationData & { contactName: string; contactUsername: string }
) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: data.guardianEmail,
      subject: `Mirro: ${data.minorName} received a message from a new contact`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Message Alert</h2>
          <p>Hello,</p>
          <p>Your child <strong>${data.minorName}</strong> (@${data.minorUsername}) has received a message from a new contact on Mirro.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Contact Name:</strong> ${data.contactName}</p>
            <p style="margin: 5px 0;"><strong>Contact Username:</strong> @${data.contactUsername}</p>
          </div>
          
          <p>This is an automated notification from Mirro's parental controls system.</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            You can manage notification settings in the Mirro app under Parental Controls.
          </p>
        </div>
      `,
    });
    console.log('✅ New contact message notification sent to:', data.guardianEmail);
  } catch (error) {
    console.error('❌ Failed to send new contact message notification:', error);
  }
}

/**
 * Send notification when minor joins a public event
 */
export async function sendPublicEventJoinNotification(
  data: NotificationData & { eventTitle: string; eventDate: string; eventLocation: string }
) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: data.guardianEmail,
      subject: `Mirro: ${data.minorName} joined a public event`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Public Event Join Alert</h2>
          <p>Hello,</p>
          <p>Your child <strong>${data.minorName}</strong> (@${data.minorUsername}) has joined a public event on Mirro.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Event:</strong> ${data.eventTitle}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${data.eventDate}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${data.eventLocation}</p>
          </div>
          
          <p>This is an automated notification from Mirro's parental controls system.</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            You can manage notification settings in the Mirro app under Parental Controls.
          </p>
        </div>
      `,
    });
    console.log('✅ Public event join notification sent to:', data.guardianEmail);
  } catch (error) {
    console.error('❌ Failed to send public event join notification:', error);
  }
}

/**
 * Send notification when minor's content is reported
 */
export async function sendContentReportNotification(
  data: NotificationData & { reportReason: string; contentType: string }
) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: data.guardianEmail,
      subject: `Mirro: Content report for ${data.minorName}'s account`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d32f2f;">⚠️ Content Report Alert</h2>
          <p>Hello,</p>
          <p>Content from your child <strong>${data.minorName}</strong> (@${data.minorUsername}) has been reported on Mirro.</p>
          
          <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
            <p style="margin: 5px 0;"><strong>Content Type:</strong> ${data.contentType}</p>
            <p style="margin: 5px 0;"><strong>Report Reason:</strong> ${data.reportReason}</p>
          </div>
          
          <p>We recommend discussing appropriate online behavior with your child.</p>
          
          <p>This is an automated notification from Mirro's parental controls system.</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            You can manage notification settings in the Mirro app under Parental Controls.
          </p>
        </div>
      `,
    });
    console.log('✅ Content report notification sent to:', data.guardianEmail);
  } catch (error) {
    console.error('❌ Failed to send content report notification:', error);
  }
}

/**
 * Send weekly activity summary
 */
export async function sendWeeklyActivitySummary(
  data: NotificationData & {
    messagesCount: number;
    eventsJoined: number;
    eventsCreated: number;
  }
) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: data.guardianEmail,
      subject: `Mirro: Weekly activity summary for ${data.minorName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">📊 Weekly Activity Summary</h2>
          <p>Hello,</p>
          <p>Here's a summary of <strong>${data.minorName}</strong>'s activity on Mirro this week:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <div style="margin: 15px 0;">
              <span style="font-size: 24px; font-weight: bold; color: #2196F3;">${data.messagesCount}</span>
              <span style="color: #666; margin-left: 10px;">Messages sent</span>
            </div>
            <div style="margin: 15px 0;">
              <span style="font-size: 24px; font-weight: bold; color: #4CAF50;">${data.eventsJoined}</span>
              <span style="color: #666; margin-left: 10px;">Events joined</span>
            </div>
            <div style="margin: 15px 0;">
              <span style="font-size: 24px; font-weight: bold; color: #FF9800;">${data.eventsCreated}</span>
              <span style="color: #666; margin-left: 10px;">Events created</span>
            </div>
          </div>
          
          <p>This is an automated weekly summary from Mirro's parental controls system.</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            You can manage notification settings in the Mirro app under Parental Controls.
          </p>
        </div>
      `,
    });
    console.log('✅ Weekly activity summary sent to:', data.guardianEmail);
  } catch (error) {
    console.error('❌ Failed to send weekly activity summary:', error);
  }
}

/**
 * Send PIN setup confirmation
 */
export async function sendPinSetupConfirmation(data: NotificationData) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: data.guardianEmail,
      subject: `Mirro: Parental controls PIN set up for ${data.minorName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">✅ PIN Setup Complete</h2>
          <p>Hello,</p>
          <p>A parental controls PIN has been set up for <strong>${data.minorName}</strong> (@${data.minorUsername}) on Mirro.</p>
          
          <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;">✓ Parental controls are now active</p>
            <p style="margin: 5px 0;">✓ Messaging restrictions enabled</p>
            <p style="margin: 5px 0;">✓ Event creation restrictions enabled</p>
            <p style="margin: 5px 0;">✓ Content filtering enabled</p>
          </div>
          
          <p>You can modify these settings anytime using the PIN in the Mirro app.</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            If you didn't set up this PIN, please contact support immediately at mirrosocial@gmail.com
          </p>
        </div>
      `,
    });
    console.log('✅ PIN setup confirmation sent to:', data.guardianEmail);
  } catch (error) {
    console.error('❌ Failed to send PIN setup confirmation:', error);
  }
}

/**
 * Send PIN reset confirmation
 */
export async function sendPinResetConfirmation(data: NotificationData) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: data.guardianEmail,
      subject: `Mirro: Parental controls PIN reset for ${data.minorName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2196F3;">🔄 PIN Reset Complete</h2>
          <p>Hello,</p>
          <p>The parental controls PIN for <strong>${data.minorName}</strong> (@${data.minorUsername}) has been successfully reset.</p>
          
          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;">Your new PIN is now active and can be used to access parental control settings.</p>
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            If you didn't reset this PIN, please contact support immediately at mirrosocial@gmail.com
          </p>
        </div>
      `,
    });
    console.log('✅ PIN reset confirmation sent to:', data.guardianEmail);
  } catch (error) {
    console.error('❌ Failed to send PIN reset confirmation:', error);
  }
}

/**
 * Check if notifications are enabled for a user
 */
export async function shouldSendNotification(userId: string): Promise<boolean> {
  try {
    const { getParentalControlSettings } = await import('./parental-controls');
    const settings = await getParentalControlSettings(userId);
    return settings?.notificationsEnabled || false;
  } catch (error) {
    console.error('Error checking notification settings:', error);
    return false;
  }
}
