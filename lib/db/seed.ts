import { db } from './index';
import { users, events, follows, eventParticipants } from './schema';
import { hashPassword } from '../auth';

async function seed() {
  try {
    console.log('Seeding database...');

    // Create sample users if they don't exist
    const existingUsers = await db.select().from(users);
    
    if (existingUsers.length === 0) {
      console.log('Creating sample users...');
      
      const hashedPassword = await hashPassword('password123');
      
      const [user1] = await db.insert(users).values({
        name: 'John Doe',
        username: 'johndoe',
        password: hashedPassword,
        profilePicture: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTIgMTFBNCA0IDAgMSAwIDEyIDNBNCA0IDAgMCAwIDEyIDExWk0xMiAxM0M5LjMzIDEzIDQgMTQuMzQgNCAyMFYyMkgyMFYyMEMxOSAxNC4zNCAxNC42NyAxMyAxMiAxM1oiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4K',
      }).returning();

      const [user2] = await db.insert(users).values({
        name: 'Jane Smith',
        username: 'janesmith',
        password: hashedPassword,
        profilePicture: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGNTU5QTAiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTIgMTFBNCA0IDAgMSAwIDEyIDNBNCA0IDAgMCAwIDEyIDExWk0xMiAxM0M5LjMzIDEzIDQgMTQuMzQgNCAyMFYyMkgyMFYyMEMxOSAxNC4zNCAxNC42NyAxMyAxMiAxM1oiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4K',
      }).returning();

      const [user3] = await db.insert(users).values({
        name: 'Mike Johnson',
        username: 'mikejohnson',
        password: hashedPassword,
        profilePicture: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMxMEI5ODEiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTIgMTFBNCA0IDAgMSAwIDEyIDNBNCA0IDAgMCAwIDEyIDExWk0xMiAxM0M5LjMzIDEzIDQgMTQuMzQgNCAyMFYyMkgyMFYyMEMxOSAxNC4zNCAxNC42NyAxMyAxMiAxM1oiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4K',
      }).returning();

      const [user4] = await db.insert(users).values({
        name: 'Sarah Wilson',
        username: 'sarahwilson',
        password: hashedPassword,
        profilePicture: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGNTk3MzEiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTIgMTFBNCA0IDAgMSAwIDEyIDNBNCA0IDAgMCAwIDEyIDExWk0xMiAxM0M5LjMzIDEzIDQgMTQuMzQgNCAyMFYyMkgyMFYyMEMxOSAxNC4zNCAxNC42NyAxMyAxMiAxM1oiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4K',
      }).returning();

      console.log('Sample users created');

      // Create sample events
      console.log('Creating sample events...');
      
      const sampleEvents = await db.insert(events).values([
        {
          title: 'Summer Music Festival',
          description: 'Join us for an amazing outdoor music experience',
          date: 'July 15, 2024',
          time: '18:00',
          location: 'Central Park',
          icon: 'music',
          gradient: 'from-sand-400 to-sand-500',
          createdBy: user1.id,
        },
        {
          title: 'Photography Workshop',
          description: 'Learn professional photography techniques',
          date: 'August 3, 2024',
          time: '14:00',
          location: 'Studio Downtown',
          icon: 'photography',
          gradient: 'from-taupe-400 to-taupe-500',
          createdBy: user1.id,
        },
        {
          title: 'Community Meetup',
          description: 'Connect with local community members',
          date: 'August 10, 2024',
          time: '19:00',
          location: 'Community Center',
          icon: 'community',
          gradient: 'from-cream-400 to-cream-500',
          createdBy: user2.id,
        },
        {
          title: 'Tech Conference 2024',
          description: 'Latest trends in technology and innovation',
          date: 'September 5, 2024',
          time: '09:00',
          location: 'Convention Center',
          icon: 'music',
          gradient: 'from-blue-400 to-blue-500',
          createdBy: user2.id,
        },
      ]).returning();

      console.log('Sample events created');

      // Add sample event participants
      console.log('Creating sample event participants...');
      await db.insert(eventParticipants).values([
        // Summer Music Festival attendees
        { eventId: sampleEvents[0].id, userId: user2.id },
        { eventId: sampleEvents[0].id, userId: user3.id },
        { eventId: sampleEvents[0].id, userId: user4.id },
        
        // Photography Workshop attendees
        { eventId: sampleEvents[1].id, userId: user2.id },
        { eventId: sampleEvents[1].id, userId: user4.id },
        
        // Community Meetup attendees
        { eventId: sampleEvents[2].id, userId: user1.id },
        { eventId: sampleEvents[2].id, userId: user3.id },
        { eventId: sampleEvents[2].id, userId: user4.id },
        
        // Tech Conference attendees
        { eventId: sampleEvents[3].id, userId: user1.id },
        { eventId: sampleEvents[3].id, userId: user3.id },
      ]);
      console.log('Sample event participants created');

      // Create some follow relationships
      console.log('Creating follow relationships...');
      await db.insert(follows).values([
        { followerId: user1.id, followingId: user2.id },
        { followerId: user1.id, followingId: user3.id },
        { followerId: user1.id, followingId: user4.id },
        { followerId: user2.id, followingId: user1.id },
        { followerId: user2.id, followingId: user3.id },
        { followerId: user3.id, followingId: user1.id },
        { followerId: user4.id, followingId: user1.id },
        { followerId: user4.id, followingId: user2.id },
      ]);
      console.log('Follow relationships created');
    } else {
      console.log('Users already exist, skipping seed');
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

if (require.main === module) {
  seed()
    .then(() => {
      console.log('Seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

export { seed };