# Resend Email Setup for Password Reset

## 1. Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

## 2. Get Your API Key

1. Log into your Resend dashboard
2. Go to **API Keys** in the sidebar
3. Click **Create API Key**
4. Give it a name like "Mirro Password Reset"
5. Copy the API key (it starts with `re_`)

## 3. Set Up Your Domain (Optional but Recommended)

### Option A: Use Resend's Domain (Quick Start)
- You can use `onboarding@resend.dev` as your FROM_EMAIL for testing
- This works immediately but emails might go to spam

### Option B: Add Your Own Domain (Recommended for Production)
1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records Resend provides to your domain
5. Wait for verification (usually takes a few minutes)
6. Use an email like `noreply@yourdomain.com`

## 4. Update Your .env File

Replace the placeholder values in your `.env` file:

```env
# Email Configuration - Resend
RESEND_API_KEY=re_your_actual_api_key_here
FROM_EMAIL=noreply@yourdomain.com
```

**For quick testing, you can use:**
```env
RESEND_API_KEY=re_your_actual_api_key_here
FROM_EMAIL=onboarding@resend.dev
```

## 5. Test the Setup

1. Start your development server: `yarn dev`
2. Open `http://localhost:3000/test-password-reset.html`
3. Enter an email address and click "Test Forgot Password"
4. Check the console for the reset link (in development)
5. Check your email inbox for the reset email

## 6. Production Considerations

- **Domain Verification**: Always use your own verified domain in production
- **Rate Limits**: Resend free tier allows 100 emails/day, 3,000/month
- **Security**: Never commit your API key to version control
- **Monitoring**: Check Resend dashboard for delivery statistics

## 7. Troubleshooting

### Email not received?
- Check spam/junk folder
- Verify your FROM_EMAIL domain is verified in Resend
- Check Resend dashboard for delivery logs

### API errors?
- Verify your API key is correct
- Check that FROM_EMAIL matches a verified domain
- Ensure you haven't exceeded rate limits

### Development issues?
- Check console logs for detailed error messages
- Verify environment variables are loaded correctly
- Test with the HTML test page first

## 8. Resend Dashboard Features

- **Logs**: See all sent emails and their status
- **Analytics**: Track open rates and clicks
- **Webhooks**: Get notified of delivery events
- **Templates**: Create reusable email templates

## Free Tier Limits

- 100 emails per day
- 3,000 emails per month
- 1 verified domain
- Basic analytics

Upgrade to paid plans for higher limits and advanced features.