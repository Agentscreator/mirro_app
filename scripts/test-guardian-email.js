const { Resend } = require('resend');

async function testEmail() {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.FROM_EMAIL || 'noreply@mirro2.com';
  
  console.log('📧 Testing guardian notification email...');
  console.log('From:', fromEmail);
  console.log('API Key:', process.env.RESEND_API_KEY ? '✓ Set' : '✗ Not set');
  
  const testEmail = process.argv[2];
  
  if (!testEmail) {
    console.error('❌ Please provide a test email address');
    console.log('Usage: node scripts/test-guardian-email.js your-email@example.com');
    process.exit(1);
  }
  
  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: testEmail,
      subject: 'Mirro: Test Guardian Notification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">✅ Email Test Successful!</h2>
          <p>Hello,</p>
          <p>This is a test email from Mirro's parental controls notification system.</p>
          
          <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;">✓ Email service is configured correctly</p>
            <p style="margin: 5px 0;">✓ Guardian notifications are ready to use</p>
          </div>
          
          <p>You will receive notifications when:</p>
          <ul>
            <li>Your child sets up their PIN</li>
            <li>Your child resets their PIN</li>
            <li>Your child receives messages from new contacts</li>
            <li>Your child joins public events</li>
            <li>Your child's content is reported</li>
          </ul>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is a test email. You can safely ignore it.
          </p>
        </div>
      `,
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Email ID:', result.data?.id);
    console.log('\nCheck your inbox at:', testEmail);
    
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
    if (error.message.includes('API key')) {
      console.log('\n💡 Make sure RESEND_API_KEY is set in your .env file');
    }
  }
}

testEmail().catch(console.error);
