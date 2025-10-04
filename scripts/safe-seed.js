#!/usr/bin/env node

/**
 * Safe seeding script for development
 * This will only add sample data if the database is empty
 */

const { execSync } = require('child_process');

console.log('🌱 Running safe database seed...');
console.log('This will only add sample data if no users exist.');

try {
  // Run the safe seed script
  execSync('npm run db:seed', { stdio: 'inherit' });
  console.log('✅ Safe seed completed successfully!');
} catch (error) {
  console.error('❌ Safe seed failed:', error.message);
  process.exit(1);
}