const fs = require('fs');
const path = require('path');

function checkStatus() {
  console.log('📊 App Integration Status Check\n');

  const checks = [
    {
      name: 'Environment Configuration',
      check: () => {
        if (!fs.existsSync('.env')) return { status: '❌', message: '.env file missing' };
        const envContent = fs.readFileSync('.env', 'utf8');
        if (!envContent.includes('DATABASE_URL')) return { status: '❌', message: 'DATABASE_URL missing' };
        return { status: '✅', message: 'Environment configured' };
      }
    },
    {
      name: 'Database Schema',
      check: () => {
        if (!fs.existsSync('lib/db/schema.ts')) return { status: '❌', message: 'Schema file missing' };
        const schemaContent = fs.readFileSync('lib/db/schema.ts', 'utf8');
        if (!schemaContent.includes('users') || !schemaContent.includes('events')) {
          return { status: '❌', message: 'Schema incomplete' };
        }
        return { status: '✅', message: 'Schema defined' };
      }
    },
    {
      name: 'Auth Functions',
      check: () => {
        if (!fs.existsSync('lib/auth.ts')) return { status: '❌', message: 'Auth file missing' };
        const authContent = fs.readFileSync('lib/auth.ts', 'utf8');
        const requiredFunctions = ['createUser', 'getUserByUsername', 'createEvent', 'getAllEvents'];
        const missing = requiredFunctions.filter(fn => !authContent.includes(fn));
        if (missing.length > 0) return { status: '❌', message: `Missing functions: ${missing.join(', ')}` };
        return { status: '✅', message: 'Auth functions complete' };
      }
    },
    {
      name: 'API Routes',
      check: () => {
        const routes = [
          'app/api/auth/login/route.ts',
          'app/api/auth/register/route.ts',
          'app/api/events/route.ts',
          'app/api/user/profile/route.ts',
          'app/api/user/follow/route.ts'
        ];
        const missing = routes.filter(route => !fs.existsSync(route));
        if (missing.length > 0) return { status: '❌', message: `Missing routes: ${missing.length}` };
        return { status: '✅', message: 'API routes complete' };
      }
    },
    {
      name: 'Components Integration',
      check: () => {
        const components = [
          'components/CreateEventPage.tsx',
          'components/ProfilePage.tsx',
          'components/AuthPage.tsx',
          'components/EventCard.tsx'
        ];
        const missing = components.filter(comp => !fs.existsSync(comp));
        if (missing.length > 0) return { status: '❌', message: `Missing components: ${missing.length}` };
        
        // Check if CreateEventPage has API integration
        const createEventContent = fs.readFileSync('components/CreateEventPage.tsx', 'utf8');
        if (!createEventContent.includes('fetch(\'/api/events\'')) {
          return { status: '⚠️', message: 'CreateEventPage missing API integration' };
        }
        
        return { status: '✅', message: 'Components integrated' };
      }
    },
    {
      name: 'Database Seed',
      check: () => {
        if (!fs.existsSync('lib/db/seed.ts')) return { status: '❌', message: 'Seed file missing' };
        return { status: '✅', message: 'Seed file ready' };
      }
    },
    {
      name: 'Package Dependencies',
      check: () => {
        if (!fs.existsSync('package.json')) return { status: '❌', message: 'package.json missing' };
        const packageContent = fs.readFileSync('package.json', 'utf8');
        const pkg = JSON.parse(packageContent);
        const required = ['drizzle-orm', 'postgres', 'bcryptjs', 'next'];
        const missing = required.filter(dep => !pkg.dependencies[dep]);
        if (missing.length > 0) return { status: '❌', message: `Missing deps: ${missing.join(', ')}` };
        return { status: '✅', message: 'Dependencies complete' };
      }
    }
  ];

  checks.forEach(({ name, check }) => {
    const result = check();
    console.log(`${result.status} ${name}: ${result.message}`);
  });

  console.log('\n🚀 Setup Commands:');
  console.log('   npm run setup     - Complete setup');
  console.log('   npm run db:setup  - Database only');
  console.log('   npm run db:seed   - Seed data');
  console.log('   npm run dev       - Start development');
  console.log('   npm run db:studio - View database');

  console.log('\n📝 Sample Users (after seeding):');
  console.log('   Username: johndoe, Password: password123');
  console.log('   Username: janesmith, Password: password123');
  console.log('   Username: mikejohnson, Password: password123');
  console.log('   Username: sarahwilson, Password: password123');
}

checkStatus();