const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔐 Setting up password reset functionality...\n');

// Check if drizzle-kit is available
try {
  console.log('📦 Generating database migration...');
  execSync('npx drizzle-kit generate', { stdio: 'inherit' });
  console.log('✅ Migration generated successfully\n');
} catch (error) {
  console.log('⚠️  Could not generate migration automatically');
  console.log('Please run: npx drizzle-kit generate\n');
}

// Check if migration should be applied
try {
  console.log('🚀 Applying database migration...');
  execSync('npx drizzle-kit migrate', { stdio: 'inherit' });
  console.log('✅ Migration applied successfully\n');
} catch (error) {
  console.log('⚠️  Could not apply migration automatically');
  console.log('Please run: npx drizzle-kit migrate\n');
}

console.log('📧 Resend Email Configuration:');
console.log('');
console.log('1. Sign up at https://resend.com');
console.log('2. Get your API key from the dashboard');
console.log('3. Add these to your .env file:');
console.log('');
console.log('   RESEND_API_KEY=re_your_actual_api_key_here');
console.log('   FROM_EMAIL=onboarding@resend.dev  # For development');
console.log('   # FROM_EMAIL=noreply@yourdomain.com  # For production');
console.log('');
console.log('📖 See RESEND_SETUP.md for detailed setup instructions');
console.log('📝 For development, password reset links will be logged to the console.');
console.log('');
console.log('🎉 Password reset setup complete!');
console.log('');
console.log('Available routes:');
console.log('  • /forgot-password - Request password reset');
console.log('  • /reset-password?token=... - Reset password with token');
console.log('  • API: POST /api/auth/forgot-password');
console.log('  • API: POST /api/auth/reset-password');
console.log('  • API: GET /api/auth/reset-password?token=... (validate token)');