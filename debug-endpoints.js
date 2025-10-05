// Debug script to test API endpoints
const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging API Endpoints\n');

// Check if API route files exist
const apiRoutes = [
  'app/api/events/route.ts',
  'app/api/upload/route.ts',
  'app/api/auth/validate/route.ts'
];

console.log('📁 Checking API route files:');
apiRoutes.forEach(route => {
  const exists = fs.existsSync(route);
  console.log(`  ${exists ? '✅' : '❌'} ${route}`);
});

// Check Next.js config
console.log('\n⚙️  Checking Next.js configuration:');
const nextConfigExists = fs.existsSync('next.config.mjs');
console.log(`  ${nextConfigExists ? '✅' : '❌'} next.config.mjs`);

if (nextConfigExists) {
  const config = fs.readFileSync('next.config.mjs', 'utf8');
  console.log('  📋 Config includes experimental settings:', config.includes('experimental'));
}

// Check middleware
console.log('\n🛡️  Checking middleware:');
const middlewareExists = fs.existsSync('middleware.ts');
console.log(`  ${middlewareExists ? '✅' : '❌'} middleware.ts`);

// Check package.json for dependencies
console.log('\n📦 Checking dependencies:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = ['next', 'react', 'drizzle-orm'];
requiredDeps.forEach(dep => {
  const exists = packageJson.dependencies[dep];
  console.log(`  ${exists ? '✅' : '❌'} ${dep}: ${exists || 'missing'}`);
});

console.log('\n🚀 To start the development server, run:');
console.log('  npm run dev');
console.log('\n📝 Common issues and solutions:');
console.log('  • 404 errors: Make sure the dev server is running');
console.log('  • 413 errors: Large files should be uploaded via /api/upload first');
console.log('  • JSON parse errors: Server might be returning HTML error pages');
console.log('  • Check browser console for detailed error messages');