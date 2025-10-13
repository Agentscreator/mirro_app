import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
    
    // For development - log the reset URL to console
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=== PASSWORD RESET EMAIL ===');
      console.log(`To: ${email}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log('============================\n');
      
      // Still send email in development if Resend is configured
      if (!process.env.RESEND_API_KEY) {
        return true;
      }
    }

    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured. Please add it to your .env file.');
      return false;
    }

    if (!process.env.FROM_EMAIL) {
      console.error('FROM_EMAIL is not configured. Please add it to your .env file.');
      return false;
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: [email],
      subject: 'Reset Your Password - Mirro',
      html: getPasswordResetEmailHTML(resetUrl),
      text: getPasswordResetEmailText(resetUrl),
    });

    if (error) {
      console.error('Resend error:', error);
      return false;
    }

    console.log('Password reset email sent successfully:', data?.id);
    return true;

  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}

function getPasswordResetEmailHTML(resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
        <p style="font-size: 16px; margin-bottom: 20px;">
          Hello,
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          We received a request to reset your password for your Mirro account. If you didn't make this request, you can safely ignore this email.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    font-weight: bold; 
                    font-size: 16px; 
                    display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          This link will expire in 1 hour for security reasons.
        </p>
        
        <p style="font-size: 14px; color: #666;">
          If the button doesn't work, you can copy and paste this link into your browser:
          <br>
          <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          This email was sent by Mirro. If you have any questions, please contact our support team.
        </p>
      </div>
    </body>
    </html>
  `;
}

function getPasswordResetEmailText(resetUrl: string): string {
  return `
Reset Your Password

Hello,

We received a request to reset your password for your Mirro account. If you didn't make this request, you can safely ignore this email.

To reset your password, click the following link:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you have any questions, please contact our support team.

Best regards,
The Mirro Team
  `.trim();
}

export async function verifyEmailConfiguration(): Promise<boolean> {
  return !!(process.env.RESEND_API_KEY && process.env.FROM_EMAIL);
}