import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  try {
    // For development - log the welcome email to console
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=== WELCOME EMAIL ===');
      console.log(`To: ${email}`);
      console.log(`Name: ${name}`);
      console.log('=====================\n');
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

    // Send welcome email using Resend
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: [email],
      subject: 'Welcome to Mirro - Where Beautiful Events Begin',
      html: getWelcomeEmailHTML(name),
      text: getWelcomeEmailText(name),
    });

    if (error) {
      console.error('Resend error:', error);
      return false;
    }

    console.log('Welcome email sent successfully:', data?.id);
    return true;

  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
    
    // For development - log the reset URL to console
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=== PASSWORD RESET EMAIL ===');
      console.log(`To: ${email}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log('============================\n');
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

function getWelcomeEmailHTML(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Mirro</title>
    </head>
    <body style="font-family: 'Georgia', serif; line-height: 1.8; color: #4A4A4A; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FAF7F2;">
      <div style="background: linear-gradient(135deg, #F5E8D5 0%, #F0DFC7 50%, #EBD6B9 100%); padding: 40px 30px; text-align: center; border-radius: 15px 15px 0 0; border: 1px solid #E8DCC6;">
        <h1 style="color: #8B7355; margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 1px;">Welcome to Mirro</h1>
        <p style="color: #A0916B; margin: 10px 0 0 0; font-size: 16px; font-style: italic;">Where Beautiful Events Begin</p>
      </div>
      
      <div style="background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); padding: 40px 30px; border-radius: 0 0 15px 15px; border: 1px solid #E8DCC6; border-top: none;">
        <p style="font-size: 18px; margin-bottom: 25px; color: #6B5B47;">
          Hello ${name},
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px; color: #6B5B47;">
          We are Mirro.
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px; color: #6B5B47;">
          You have come with dreams of beautiful events—moments that matter, carefully shaped with intention. We are here to help you make them real, quickly, so that time itself remains what it should be: yours to spend with the people you love.
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px; color: #6B5B47;">
          Our work is simple. We have built tools that make it easy to create what you need, in seconds, without complication. Tools that stay out of your way. Tools that work the way you think.
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px; color: #6B5B47;">
          We believe beautiful experiences deserve purpose and care. They deserve to be personal. They deserve to be in your hands, shaped by you, shared with your people. Not made for you. But made by you.
        </p>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}" 
             style="background: linear-gradient(135deg, #8B7355 0%, #A0916B 100%); 
                    color: white; 
                    padding: 15px 35px; 
                    text-decoration: none; 
                    border-radius: 25px; 
                    font-weight: 500; 
                    font-size: 16px; 
                    display: inline-block;
                    box-shadow: 0 4px 15px rgba(139, 115, 85, 0.3);
                    transition: all 0.3s ease;">
            Start Creating Beautiful Events
          </a>
        </div>
        
        <p style="font-size: 16px; margin-bottom: 30px; color: #6B5B47;">
          Thank you for joining us. We are grateful to be part of what you are building.
        </p>
        
        <div style="border-top: 1px solid #E8DCC6; padding-top: 25px; margin-top: 30px;">
          <p style="font-size: 16px; color: #8B7355; font-style: italic; margin-bottom: 5px;">
            With genuine care,
          </p>
          <p style="font-size: 16px; color: #8B7355; font-weight: 500; margin: 0;">
            The Mirro Team
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding-top: 25px; border-top: 1px solid #E8DCC6;">
          <p style="font-size: 12px; color: #A0916B; margin: 0;">
            This email was sent with care from Mirro. We're here to help you create moments that matter.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getWelcomeEmailText(name: string): string {
  return `
Welcome to Mirro

Hello ${name},

We are Mirro.

You have come with dreams of beautiful events—moments that matter, carefully shaped with intention. We are here to help you make them real, quickly, so that time itself remains what it should be: yours to spend with the people you love.

Our work is simple. We have built tools that make it easy to create what you need, in seconds, without complication. Tools that stay out of your way. Tools that work the way you think.

We believe beautiful experiences deserve purpose and care. They deserve to be personal. They deserve to be in your hands, shaped by you, shared with your people. Not made for you. But made by you.

Thank you for joining us. We are grateful to be part of what you are building.

Start creating: ${process.env.NEXT_PUBLIC_BASE_URL}

With genuine care,
The Mirro Team
  `.trim();
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