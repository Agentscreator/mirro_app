import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message, category } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json({
        success: false,
        message: 'All fields are required'
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: 'Please enter a valid email address'
      }, { status: 400 });
    }

    // Check if email service is configured
    if (!process.env.RESEND_API_KEY || !process.env.FROM_EMAIL) {
      console.error('Email service not configured');
      return NextResponse.json({
        success: false,
        message: 'Email service is not configured. Please try again later.'
      }, { status: 500 });
    }

    // Send support request email
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: ['mirrosocial@gmail.com'],
      replyTo: email,
      subject: `[Mirro Support] ${category.charAt(0).toUpperCase() + category.slice(1)}: ${subject}`,
      html: getSupportEmailHTML(name, email, subject, message, category),
      text: getSupportEmailText(name, email, subject, message, category),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({
        success: false,
        message: 'Failed to send support request. Please try again.'
      }, { status: 500 });
    }

    // Send confirmation email to user
    try {
      await resend.emails.send({
        from: process.env.FROM_EMAIL,
        to: [email],
        subject: 'Support Request Received - Mirro',
        html: getConfirmationEmailHTML(name, subject),
        text: getConfirmationEmailText(name, subject),
      });
    } catch (confirmationError) {
      console.error('Failed to send confirmation email:', confirmationError);
      // Don't fail the main request if confirmation email fails
    }

    console.log('Support request sent successfully:', data?.id);
    return NextResponse.json({
      success: true,
      message: 'Support request sent successfully! We\'ll get back to you soon.'
    });

  } catch (error) {
    console.error('Support request error:', error);
    return NextResponse.json({
      success: false,
      message: 'Something went wrong. Please try again.'
    }, { status: 500 });
  }
}

function getSupportEmailHTML(name: string, email: string, subject: string, message: string, category: string): string {
  const timestamp = new Date().toLocaleString();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mirro Support Request</title>
    </head>
    <body style="font-family: 'Georgia', serif; line-height: 1.6; color: #4A4A4A; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FAF7F2;">
      <div style="background: linear-gradient(135deg, #F5E8D5 0%, #F0DFC7 50%, #EBD6B9 100%); padding: 30px; text-align: center; border-radius: 15px 15px 0 0; border: 1px solid #E8DCC6;">
        <h1 style="color: #8B7355; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 1px;">Mirro Support Request</h1>
        <p style="color: #A0916B; margin: 10px 0 0 0; font-size: 14px;">New support ticket received</p>
      </div>
      
      <div style="background: rgba(255, 255, 255, 0.9); padding: 30px; border-radius: 0 0 15px 15px; border: 1px solid #E8DCC6; border-top: none;">
        <div style="background: #F8F5F0; padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #8B7355;">
          <h2 style="color: #8B7355; margin: 0 0 15px 0; font-size: 20px; font-weight: 400;">Contact Information</h2>
          <p style="margin: 5px 0; color: #6B5B47;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 5px 0; color: #6B5B47;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #8B7355;">${email}</a></p>
          <p style="margin: 5px 0; color: #6B5B47;"><strong>Category:</strong> ${category.charAt(0).toUpperCase() + category.slice(1)}</p>
          <p style="margin: 5px 0; color: #6B5B47;"><strong>Submitted:</strong> ${timestamp}</p>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h3 style="color: #8B7355; margin: 0 0 10px 0; font-size: 18px; font-weight: 400;">Subject</h3>
          <p style="background: #F8F5F0; padding: 15px; border-radius: 8px; margin: 0; color: #6B5B47; font-size: 16px;">${subject}</p>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h3 style="color: #8B7355; margin: 0 0 10px 0; font-size: 18px; font-weight: 400;">Message</h3>
          <div style="background: #F8F5F0; padding: 20px; border-radius: 8px; color: #6B5B47; white-space: pre-wrap; font-size: 15px; line-height: 1.6;">${message}</div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E8DCC6;">
          <p style="color: #A0916B; font-size: 12px; margin: 0;">
            This support request was sent from the Mirro support form at www.mirro2.com
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getSupportEmailText(name: string, email: string, subject: string, message: string, category: string): string {
  const timestamp = new Date().toLocaleString();
  
  return `
MIRRO SUPPORT REQUEST

Contact Information:
Name: ${name}
Email: ${email}
Category: ${category.charAt(0).toUpperCase() + category.slice(1)}
Submitted: ${timestamp}

Subject: ${subject}

Message:
${message}

---
This support request was sent from the Mirro support form at www.mirro2.com
  `.trim();
}

function getConfirmationEmailHTML(name: string, subject: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Support Request Received</title>
    </head>
    <body style="font-family: 'Georgia', serif; line-height: 1.8; color: #4A4A4A; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FAF7F2;">
      <div style="background: linear-gradient(135deg, #F5E8D5 0%, #F0DFC7 50%, #EBD6B9 100%); padding: 40px 30px; text-align: center; border-radius: 15px 15px 0 0; border: 1px solid #E8DCC6;">
        <h1 style="color: #8B7355; margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 1px;">Support Request Received</h1>
        <p style="color: #A0916B; margin: 10px 0 0 0; font-size: 16px; font-style: italic;">We're here to help</p>
      </div>
      
      <div style="background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); padding: 40px 30px; border-radius: 0 0 15px 15px; border: 1px solid #E8DCC6; border-top: none;">
        <p style="font-size: 18px; margin-bottom: 25px; color: #6B5B47;">
          Hello ${name},
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px; color: #6B5B47;">
          Thank you for contacting Mirro support. We have received your request about:
        </p>
        
        <div style="background: #F8F5F0; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #8B7355;">
          <p style="margin: 0; color: #6B5B47; font-size: 16px; font-weight: 500;">${subject}</p>
        </div>
        
        <p style="font-size: 16px; margin-bottom: 20px; color: #6B5B47;">
          Our support team will review your request and respond within 24 hours. We appreciate your patience and look forward to helping you create beautiful events with Mirro.
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px; color: #6B5B47;">
          If you have any additional information or urgent concerns, please reply to this email or contact us directly at mirrosocial@gmail.com.
        </p>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="https://www.mirro2.com" 
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
            Return to Mirro
          </a>
        </div>
        
        <div style="border-top: 1px solid #E8DCC6; padding-top: 25px; margin-top: 30px;">
          <p style="font-size: 16px; color: #8B7355; font-style: italic; margin-bottom: 5px;">
            With genuine care,
          </p>
          <p style="font-size: 16px; color: #8B7355; font-weight: 500; margin: 0;">
            The Mirro Support Team
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding-top: 25px; border-top: 1px solid #E8DCC6;">
          <p style="font-size: 12px; color: #A0916B; margin: 0;">
            This email was sent from Mirro Support. We're here to help you create moments that matter.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getConfirmationEmailText(name: string, subject: string): string {
  return `
Support Request Received

Hello ${name},

Thank you for contacting Mirro support. We have received your request about: ${subject}

Our support team will review your request and respond within 24 hours. We appreciate your patience and look forward to helping you create beautiful events with Mirro.

If you have any additional information or urgent concerns, please reply to this email or contact us directly at mirrosocial@gmail.com.

Visit Mirro: https://www.mirro2.com

With genuine care,
The Mirro Support Team
  `.trim();
}