import bcrypt from 'bcryptjs';
import { db } from './db';
import { users, events } from './db/schema';
import { eq } from 'drizzle-orm';

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

export async function updateUserProfile(userId: string, updates: {
  profilePicture?: string;
  followersCount?: string;
  followingCount?: string;
}) {
  const [user] = await db.update(users)
    .set(updates)
    .where(eq(users.id, userId))
    .returning();
  
  return user;
}