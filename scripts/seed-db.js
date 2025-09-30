const { seed } = require('../lib/db/seed.ts');

async function runSeed() {
  try {
    console.log('🌱 Seeding database...');
    await seed();
    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

runSeed();