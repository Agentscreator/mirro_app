import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, events, eventAttendees } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Start a transaction to ensure data consistency
    await db.transaction(async (tx) => {
      // Delete user's event attendances
      await tx.delete(eventAttendees).where(eq(eventAttendees.userId, userId))
      
      // Delete user's created events (this will cascade to attendees of those events)
      await tx.delete(events).where(eq(events.createdBy, userId))
      
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