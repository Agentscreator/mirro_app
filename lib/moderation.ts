import { db } from '@/lib/db';
import { blockedUsers } from '@/lib/db/schema';
import { eq, and, or } from 'drizzle-orm';

/**
 * Check if a user has blocked another user
 */
export async function isUserBlocked(blockerId: string, blockedId: string): Promise<boolean> {
  const result = await db
    .select()
    .from(blockedUsers)
    .where(
      and(
        eq(blockedUsers.blockerId, blockerId),
        eq(blockedUsers.blockedId, blockedId)
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Check if two users have blocked each other (in either direction)
 */
export async function areUsersBlocked(userId1: string, userId2: string): Promise<boolean> {
  const result = await db
    .select()
    .from(blockedUsers)
    .where(
      or(
        and(
          eq(blockedUsers.blockerId, userId1),
          eq(blockedUsers.blockedId, userId2)
        ),
        and(
          eq(blockedUsers.blockerId, userId2),
          eq(blockedUsers.blockedId, userId1)
        )
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Get all users blocked by a specific user
 */
export async function getBlockedUserIds(blockerId: string): Promise<string[]> {
  const blocked = await db
    .select({ blockedId: blockedUsers.blockedId })
    .from(blockedUsers)
    .where(eq(blockedUsers.blockerId, blockerId));

  return blocked.map(b => b.blockedId);
}

/**
 * Block a user
 */
export async function blockUser(blockerId: string, blockedId: string) {
  if (blockerId === blockedId) {
    throw new Error('Cannot block yourself');
  }

  // Check if already blocked
  const alreadyBlocked = await isUserBlocked(blockerId, blockedId);
  if (alreadyBlocked) {
    throw new Error('User is already blocked');
  }

  const [block] = await db
    .insert(blockedUsers)
    .values({
      blockerId,
      blockedId,
    })
    .returning();

  return block;
}

/**
 * Unblock a user
 */
export async function unblockUser(blockerId: string, blockedId: string) {
  const deleted = await db
    .delete(blockedUsers)
    .where(
      and(
        eq(blockedUsers.blockerId, blockerId),
        eq(blockedUsers.blockedId, blockedId)
      )
    )
    .returning();

  if (deleted.length === 0) {
    throw new Error('Block not found');
  }

  return deleted[0];
}

/**
 * Report reason options for UI
 */
export const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment or Bullying' },
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'hate_speech', label: 'Hate Speech' },
  { value: 'violence', label: 'Violence or Threats' },
  { value: 'other', label: 'Other' },
] as const;
