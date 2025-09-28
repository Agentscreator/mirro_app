import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, events } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth';

export async function POST() {
  try {
    console.log('Seeding database...');

    // Check if users already exist
    const existingUsers = await db.select().from(users);
    
    if (existingUsers.length > 0) {
      return NextResponse.json({ message: 'Database already seeded' });
    }

    console.log('Creating sample users...');
    
    const hashedPassword = await hashPassword('password123');
    
    const [user1] = await db.insert(users).values({
      name: 'John Doe',
      username: 'johndoe',
      password: hashedPassword,
      followersCount: '1200',
      followingCount: '342',
    }).returning();

    const [user2] = await db.insert(users).values({
      name: 'Jane Smith',
      username: 'janesmith',
      password: hashedPassword,
      followersCount: '850',
      followingCount: '195',
    }).returning();

    console.log('Sample users created');

    // Create sample events
    console.log('Creating sample events...');
    
    await db.insert(events).values([
      {
        title: 'Summer Music Festival',
        description: 'Join us for an amazing outdoor music experience',
        date: 'July 15, 2024',
        time: '6:00 PM',
        location: 'Central Park',
        icon: 'music',
        gradient: 'from-sand-400 to-sand-500',
        createdBy: user1.id,
      },
      {
        title: 'Photography Workshop',
        description: 'Learn professional photography techniques',
        date: 'August 3, 2024',
        time: '2:00 PM',
        location: 'Studio Downtown',
        icon: 'photography',
        gradient: 'from-taupe-400 to-taupe-500',
        createdBy: user1.id,
      },
      {
        title: 'Community Meetup',
        description: 'Connect with local community members',
        date: 'August 10, 2024',
        time: '7:00 PM',
        location: 'Community Center',
        icon: 'community',
        gradient: 'from-cream-400 to-cream-500',
        createdBy: user2.id,
      },
      {
        title: 'Tech Conference 2024',
        description: 'Latest trends in technology and innovation',
        date: 'September 5, 2024',
        time: '9:00 AM',
        location: 'Convention Center',
        icon: 'music',
        gradient: 'from-blue-400 to-blue-500',
        createdBy: user2.id,
      },
    ]);

    console.log('Sample events created');

    return NextResponse.json({ 
      message: 'Database seeded successfully!',
      users: [user1, user2],
      eventsCount: 4
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}