const postgres = require('postgres');

async function updateUserToMinor() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  const sql = postgres(process.env.DATABASE_URL);

  try {
    console.log('🔄 Updating user to minor account...');
    
    // Get username from command line argument
    const username = process.argv[2];
    
    if (!username) {
      console.error('❌ Please provide a username as argument');
      console.log('Usage: node scripts/update-user-to-minor.js <username>');
      process.exit(1);
    }
    
    // Update user to be a minor (age 15)
    const dateOfBirth = '2009-01-15'; // Makes user 15 years old
    const ageCategory = 'minor';
    const guardianEmail = 'guardian@example.com';
    
    const result = await sql`
      UPDATE users 
      SET 
        date_of_birth = ${dateOfBirth},
        age_category = ${ageCategory},
        guardian_email = ${guardianEmail}
      WHERE username = ${username}
      RETURNING id, username, age_category, date_of_birth
    `;
    
    if (result.length === 0) {
      console.error(`❌ User '${username}' not found`);
      process.exit(1);
    }
    
    console.log('✅ User updated successfully!');
    console.log('\nUpdated user:');
    console.log(`  Username: ${result[0].username}`);
    console.log(`  Age Category: ${result[0].age_category}`);
    console.log(`  Date of Birth: ${result[0].date_of_birth}`);
    console.log('\n⚠️  IMPORTANT: Log out and log back in to see changes!');
    console.log('⚠️  You will need to set up a PIN after logging back in.');
    
  } catch (error) {
    console.error('❌ Update failed:', error.message);
    throw error;
  } finally {
    await sql.end();
  }
}

updateUserToMinor().catch(console.error);
