import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { blockedUsers, follows } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// Block a user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { blockerId, blockedId } = body;

    // Validation
    if (!blockerId || !blockedId) {
      return NextResponse.json(
        { error: 'Blocker ID and blocked user ID are required' },
        { status: 400 }
      );
    }

    // Can't block yourself
    if (blockerId === blockedId) {
      return NextResponse.json(
        { error: 'You cannot block yourself' },
        { status: 400 }
      );
    }

    // Check if already blocked
    const existingBlock = await db
      .select()
      .from(blockedUsers)
      .where(
        and(
          eq(blockedUsers.blockerId, blockerId),
          eq(blockedUsers.blockedId, blockedId)
        )
      )
      .limit(1);

    if (existingBlock.length > 0) {
      return NextResponse.json(
        { error: 'User is already blocked' },
        { status: 409 }
      );
    }

    // Create block
    const [block] = await db
      .insert(blockedUsers)
      .values({
        blockerId,
        blockedId,
      })
      .returning();

    // Remove any follow relationships
    await db
      .delete(follows)
      .where(
        or(
          and(eq(follows.followerId, blockerId), eq(follows.followingId, blockedId)),
          and(eq(follows.followerId, blockedId), eq(follows.followingId, blockerId))
        )
      );

    return NextResponse.json({
      message: 'User blocked successfully',
      block,
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    return NextResponse.json(
      { error: 'Failed to block user' },
      { status: 500 }
    );
  }
}

// Unblock a user
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { blockerId, blockedId } = body;

    // Validation
    if (!blockerId || !blockedId) {
      return NextResponse.json(
        { error: 'Blocker ID and blocked user ID are required' },
        { status: 400 }
      );
    }

    // Remove block
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
      return NextResponse.json(
        { error: 'Block not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User unblocked successfully',
    });
  } catch (error) {
    console.error('Error unblocking user:', error);
    return NextResponse.json(
      { error: 'Failed to unblock user' },
      { status: 500 }
    );
  }
}

// Get blocked users for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blockerId = searchParams.get('blockerId');

    if (!blockerId) {
      return NextResponse.json(
        { error: 'Blocker ID is required' },
        { status: 400 }
      );
    }

    const blocked = await db
      .select()
      .from(blockedUsers)
      .where(eq(blockedUsers.blockerId, blockerId));

    return NextResponse.json(blocked);
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blocked users' },
      { status: 500 }
    );
  }
}
