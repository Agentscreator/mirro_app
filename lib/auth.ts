import bcrypt from 'bcryptjs';
import { db } from './db';
import { users } from './db/schema';
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