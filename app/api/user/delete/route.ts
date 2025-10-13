import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, events, eventParticipants, follows, blockedUsers, reports, passwordResetTokens } from '@/lib/db/schema'
import { eq, or } from 'drizzle-orm'

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Start a transaction to ensure data consistency
    await db.transaction(async (tx) => {
      // Delete user's event participations
      await tx.delete(eventParticipants).where(eq(eventParticipants.userId, userId))
      
      // Delete user's created events (this will cascade to participants of those events)
      await tx.delete(events).where(eq(events.createdBy, userId))
      
      // Delete follow relationships (both as follower and following)
      await tx.delete(follows).where(
        or(
          eq(follows.followerId, userId),
          eq(follows.followingId, userId)
        )
      )
      
      // Delete blocked user relationships (both as blocker and blocked)
      await tx.delete(blockedUsers).where(
        or(
          eq(blockedUsers.blockerId, userId),
          eq(blockedUsers.blockedId, userId)
        )
      )
      
      // Delete reports made by or against this user
      await tx.delete(reports).where(
        or(
          eq(reports.reporterId, userId),
          eq(reports.reportedUserId, userId)
        )
      )
      
      // Delete password reset tokens
      await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId))
      
      // Finally, delete the user
      await tx.delete(users).where(eq(users.id, userId))
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Account deleted successfully' 
    })

  } catch (error) {
    console.error('Error deleting user account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}