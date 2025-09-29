#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const apiPath = path.join(process.cwd(), 'app', 'api');
const apiBackupPath = path.join(process.cwd(), 'api.mobile-backup');

console.log('🚀 Starting mobile build process...');

try {
  // Step 1: Backup API routes if they exist
  if (fs.existsSync(apiPath)) {
    console.log('📦 Backing up API routes...');
    if (fs.existsSync(apiBackupPath)) {
      fs.rmSync(apiBackupPath, { recursive: true });
    }
    fs.renameSync(apiPath, apiBackupPath);
  }

  // Step 2: Build with mobile configuration
  console.log('🔨 Building Next.js app for mobile...');
  process.env.MOBILE_BUILD = 'true';
  execSync('npm run build', { stdio: 'inherit' });

  // Step 3: Sync with Capacitor
  console.log('📱 Syncing with Capacitor platforms...');
  execSync('npx cap sync', { stdio: 'inherit' });

  console.log('✅ Mobile build completed successfully!');

} catch (error) {
  console.error('❌ Mobile build failed:', error.message);
  process.exit(1);
} finally {
  // Step 4: Restore API routes
  if (fs.existsSync(apiBackupPath)) {
    console.log('🔄 Restoring API routes...');
    if (fs.existsSync(apiPath)) {
      fs.rmSync(apiPath, { recursive: true });
    }
    fs.renameSync(apiBackupPath, apiPath);
  }
}