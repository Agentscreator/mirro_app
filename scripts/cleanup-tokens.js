// Cleanup script for expired password reset tokens
// Run this periodically (e.g., via cron job) to clean up old tokens

const { cleanupExpiredTokens } = require('../lib/auth');

async function runCleanup() {
  try {
    console.log('🧹 Cleaning up expired password reset tokens...');
    await cleanupExpiredTokens();
    console.log('✅ Cleanup completed successfully');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

runCleanup();