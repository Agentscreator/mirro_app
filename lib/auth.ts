import bcrypt from 'bcryptjs';
import { db } from './db';
import { users, events, follows } from './db/schema';
import { eq, count, sql } from 'drizzle-orm';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser(name: string, username: string, password: string) {
  const hashedPassword = await hashPassword(password);
  
  const [user] = await db.insert(users).values({
    name,
    username,
    password: hashedPassword,
  }).returning();
  
  return user;
}

export async function getUserByUsername(username: string) {
  const [user] = await db.select().from(users).where(eq(users.username, username));
  return user;
}

export async function getUserById(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return user;
}

export async function getUserWithCounts(userId: string) {
  // Get user data
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  
  if (!user) return null;

  // Get followers count
  const [followersResult] = await db
    .select({ count: count() })
    .from(follows)
    .where(eq(follows.followingId, userId));

  // Get following count
  const [followingResult] = await db
    .select({ count: count() })
    .from(follows)
    .where(eq(follows.followerId, userId));

  return {
    ...user,
    followersCount: followersResult.count.toString(),
    followingCount: followingResult.count.toString(),
  };
}

export async function getUserEvents(userId: string) {
  return await db.select().from(events).where(eq(events.createdBy, userId));
}

export async function getAllEvents() {
  return await db.select({
    id: events.id,
    title: events.title,
    description: events.description,
    date: events.date,
    time: events.time,
    location: events.location,
    icon: events.icon,
    gradient: events.gradient,
    createdBy: events.createdBy,
    createdAt: events.createdAt,
    creatorName: users.name,
    creatorUsername: users.username,
  }).from(events).leftJoin(users, eq(events.createdBy, users.id));
}

export async function createEvent(eventData: {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  icon?: string;
  gradient?: string;
  createdBy: string;
}) {
  const [event] = await db.insert(events).values({
    title: eventData.title,
    description: eventData.description,
    date: eventData.date,
    time: eventData.time,
    location: eventData.location,
    icon: eventData.icon || 'calendar',
    gradient: eventData.gradient || 'from-taupe-400 to-taupe-500',
    createdBy: eventData.createdBy,
  }).returning();
  
  return event;
}

export async function updateUserProfile(userId: string, updates: {
  profilePicture?: string;
  name?: string;
  username?: string;
}) {
  // If username is being updated, check for uniqueness
  if (updates.username) {
    const existingUser = await getUserByUsername(updates.username);
    if (existingUser && existingUser.id !== userId) {
      throw new Error('Username already exists');
    }
  }

  const [user] = await db.update(users)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();
  
  return user;
}

export async function checkUsernameAvailability(username: string, currentUserId?: string) {
  const existingUser = await getUserByUsername(username);
  
  // If no user found, username is available
  if (!existingUser) return true;
  
  // If user found but it's the current user, username is available for them
  if (currentUserId && existingUser.id === currentUserId) return true;
  
  // Username is taken by someone else
  return false;
}

export async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new Error('Cannot follow yourself');
  }

  try {
    await db.insert(follows).values({
      followerId,
      followingId,
    });
    return true;
  } catch (error) {
    // Handle duplicate follow attempt
    return false;
  }
}

export async function unfollowUser(followerId: string, followingId: string) {
  await db.delete(follows)
    .where(
      sql`${follows.followerId} = ${followerId} AND ${follows.followingId} = ${followingId}`
    );
  return true;
}

export async function isFollowing(followerId: string, followingId: string) {
  const [result] = await db
    .select()
    .from(follows)
    .where(
      sql`${follows.followerId} = ${followerId} AND ${follows.followingId} = ${followingId}`
    );
  
  return !!result;
}

export async function getFollowers(userId: string) {
  return await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      profilePicture: users.profilePicture,
    })
    .from(follows)
    .innerJoin(users, eq(follows.followerId, users.id))
    .where(eq(follows.followingId, userId));
}

export async function getFollowing(userId: string) {
  return await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      profilePicture: users.profilePicture,
    })
    .from(follows)
    .innerJoin(users, eq(follows.followingId, users.id))
    .where(eq(follows.followerId, userId));
}