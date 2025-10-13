import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from './db';
import { users, events, follows, eventParticipants, blockedUsers, passwordResetTokens } from './db/schema';
import { eq, count, sql, notInArray, and, gt } from 'drizzle-orm';
import { sendWelcomeEmail } from './email';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser(name: string, username: string, email: string, password: string) {
  const hashedPassword = await hashPassword(password);
  
  const [user] = await db.insert(users).values({
    name,
    username,
    email,
    password: hashedPassword,
  }).returning();
  
  // Send welcome email (don't await to avoid blocking user registration)
  if (user) {
    sendWelcomeEmail(email, name).catch((error: any) => {
      console.error('Failed to send welcome email:', error);
    });
  }
  
  return user;
}

export async function getUserByUsername(username: string) {
  const [user] = await db.select().from(users).where(eq(users.username, username));
  return user;
}

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
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
  const eventsData = await db.select({
    id: events.id,
    title: events.title,
    description: events.description,
    date: events.date,
    time: events.time,
    location: events.location,
    icon: events.icon,
    gradient: events.gradient,
    mediaUrl: events.mediaUrl,
    mediaType: events.mediaType,
    visualStyling: events.visualStyling,
    visualStylingUrl: events.visualStylingUrl,
    createdBy: events.createdBy,
    createdAt: events.createdAt,
    creatorName: users.name,
    creatorUsername: users.username,
    creatorProfilePicture: users.profilePicture,
  }).from(events).leftJoin(users, eq(events.createdBy, users.id)).where(eq(events.createdBy, userId));

  // Get attendees for each event
  const eventsWithAttendees = await Promise.all(
    eventsData.map(async (event) => {
      const participants = await getEventParticipants(event.id);
      
      // Include creator as an attendee if they're not already in participants
      const creatorAsAttendee = {
        id: event.createdBy,
        name: event.creatorName || 'Unknown',
        username: event.creatorUsername || 'unknown',
        profilePicture: event.creatorProfilePicture || null,
        joinedAt: event.createdAt,
      };

      // Check if creator is already in participants list
      const isCreatorInParticipants = participants.some(p => p.id === event.createdBy);
      
      // Combine creator and participants, ensuring creator is first
      const allAttendees = isCreatorInParticipants 
        ? participants 
        : [creatorAsAttendee, ...participants];

      return {
        ...event,
        attendees: allAttendees,
        attendeeCount: allAttendees.length,
      };
    })
  );

  return eventsWithAttendees;
}

export async function getAllEvents(currentUserId?: string) {
  let eventsData;

  if (currentUserId) {
    // Get list of blocked user IDs
    const blockedUsersList = await db
      .select({ blockedId: blockedUsers.blockedId })
      .from(blockedUsers)
      .where(eq(blockedUsers.blockerId, currentUserId));

    const blockedUserIds = blockedUsersList.map(b => b.blockedId);

    // If there are blocked users, filter them out
    if (blockedUserIds.length > 0) {
      eventsData = await db.select({
        id: events.id,
        title: events.title,
        description: events.description,
        date: events.date,
        time: events.time,
        location: events.location,
        icon: events.icon,
        gradient: events.gradient,
        mediaUrl: events.mediaUrl,
        mediaType: events.mediaType,
        visualStyling: events.visualStyling,
        visualStylingUrl: events.visualStylingUrl,
        createdBy: events.createdBy,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        creatorName: users.name,
        creatorUsername: users.username,
        creatorProfilePicture: users.profilePicture,
      }).from(events)
        .leftJoin(users, eq(events.createdBy, users.id))
        .where(notInArray(events.createdBy, blockedUserIds));
    } else {
      eventsData = await db.select({
        id: events.id,
        title: events.title,
        description: events.description,
        date: events.date,
        time: events.time,
        location: events.location,
        icon: events.icon,
        gradient: events.gradient,
        mediaUrl: events.mediaUrl,
        mediaType: events.mediaType,
        visualStyling: events.visualStyling,
        visualStylingUrl: events.visualStylingUrl,
        createdBy: events.createdBy,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        creatorName: users.name,
        creatorUsername: users.username,
        creatorProfilePicture: users.profilePicture,
      }).from(events).leftJoin(users, eq(events.createdBy, users.id));
    }
  } else {
    eventsData = await db.select({
      id: events.id,
      title: events.title,
      description: events.description,
      date: events.date,
      time: events.time,
      location: events.location,
      icon: events.icon,
      gradient: events.gradient,
      mediaUrl: events.mediaUrl,
      mediaType: events.mediaType,
      visualStyling: events.visualStyling,
      visualStylingUrl: events.visualStylingUrl,
      createdBy: events.createdBy,
      createdAt: events.createdAt,
      updatedAt: events.updatedAt,
      creatorName: users.name,
      creatorUsername: users.username,
      creatorProfilePicture: users.profilePicture,
    }).from(events).leftJoin(users, eq(events.createdBy, users.id));
  }

  // Get attendees for each event
  const eventsWithAttendees = await Promise.all(
    eventsData.map(async (event) => {
      const participants = await getEventParticipants(event.id);

      // Include creator as an attendee if they're not already in participants
      const creatorAsAttendee = {
        id: event.createdBy,
        name: event.creatorName || 'Unknown',
        username: event.creatorUsername || 'unknown',
        profilePicture: event.creatorProfilePicture || null,
        joinedAt: event.createdAt,
      };

      // Check if creator is already in participants list
      const isCreatorInParticipants = participants.some(p => p.id === event.createdBy);

      // Combine creator and participants, ensuring creator is first
      const allAttendees = isCreatorInParticipants
        ? participants
        : [creatorAsAttendee, ...participants];

      return {
        ...event,
        attendees: allAttendees,
        attendeeCount: allAttendees.length,
      };
    })
  );

  return eventsWithAttendees;
}

export async function createEvent(eventData: {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  icon?: string;
  gradient?: string;
  mediaUrl?: string;
  mediaType?: string;
  visualStyling?: any;
  visualStylingUrl?: string;
  createdBy: string;
}) {
  const insertData: any = {
    title: eventData.title,
    description: eventData.description,
    date: eventData.date,
    time: eventData.time,
    location: eventData.location,
    icon: eventData.icon || null,
    gradient: eventData.gradient || 'bg-gray-50',
    mediaUrl: eventData.mediaUrl,
    mediaType: eventData.mediaType,
    visualStyling: eventData.visualStyling ? JSON.stringify(eventData.visualStyling) : null,
    createdBy: eventData.createdBy,
  };

  // Only add visualStylingUrl if it's provided (for backward compatibility)
  if (eventData.visualStylingUrl) {
    insertData.visualStylingUrl = eventData.visualStylingUrl;
  }

  const [event] = await db.insert(events).values(insertData).returning();
  
  // Automatically add the creator as a participant
  try {
    await db.insert(eventParticipants).values({
      eventId: event.id,
      userId: eventData.createdBy,
    });
  } catch (error) {
    // If there's an error adding the creator as participant, log it but don't fail the event creation
    console.error('Error adding creator as participant:', error);
  }
  
  return event;
}

export async function updateEvent(eventId: string, eventData: {
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  icon?: string;
  gradient?: string;
}, userId: string) {
  // First check if the user owns this event
  const [existingEvent] = await db.select().from(events).where(eq(events.id, eventId));
  
  if (!existingEvent) {
    throw new Error('Event not found');
  }
  
  if (existingEvent.createdBy !== userId) {
    throw new Error('You can only edit your own events');
  }

  const [updatedEvent] = await db.update(events)
    .set({
      ...eventData,
      updatedAt: new Date(),
    })
    .where(eq(events.id, eventId))
    .returning();
  
  return updatedEvent;
}

export async function getEventById(eventId: string) {
  try {
    console.log('getEventById: Attempting to fetch event with ID:', eventId);
    console.log('getEventById: Database URL exists:', !!process.env.DATABASE_URL);
    
    const [eventData] = await db.select({
      id: events.id,
      title: events.title,
      description: events.description,
      date: events.date,
      time: events.time,
      location: events.location,
      icon: events.icon,
      gradient: events.gradient,
      mediaUrl: events.mediaUrl,
      mediaType: events.mediaType,
      visualStyling: events.visualStyling,
      visualStylingUrl: events.visualStylingUrl,
      createdBy: events.createdBy,
      createdAt: events.createdAt,
      updatedAt: events.updatedAt,
      creatorName: users.name,
      creatorUsername: users.username,
      creatorProfilePicture: users.profilePicture,
    }).from(events).leftJoin(users, eq(events.createdBy, users.id)).where(eq(events.id, eventId));
    
    if (!eventData) {
      console.log('getEventById: Event not found');
      return null;
    }

    // Get attendees for the event
    const participants = await getEventParticipants(eventData.id);
    
    // Include creator as an attendee if they're not already in participants
    const creatorAsAttendee = {
      id: eventData.createdBy,
      name: eventData.creatorName || 'Unknown',
      username: eventData.creatorUsername || 'unknown',
      profilePicture: eventData.creatorProfilePicture || null,
      joinedAt: eventData.createdAt,
    };

    // Check if creator is already in participants list
    const isCreatorInParticipants = participants.some(p => p.id === eventData.createdBy);
    
    // Combine creator and participants, ensuring creator is first
    const allAttendees = isCreatorInParticipants 
      ? participants 
      : [creatorAsAttendee, ...participants];

    const event = {
      ...eventData,
      attendees: allAttendees,
      attendeeCount: allAttendees.length,
    };

    console.log('getEventById: Event found:', event.title);
    return event;
  } catch (error) {
    console.error('getEventById: Database query failed:', error);
    throw error;
  }
}

export async function deleteEvent(eventId: string, userId: string) {
  // First check if the user owns this event
  const [existingEvent] = await db.select().from(events).where(eq(events.id, eventId));
  
  if (!existingEvent) {
    throw new Error('Event not found');
  }
  
  if (existingEvent.createdBy !== userId) {
    throw new Error('You can only delete your own events');
  }

  await db.delete(events).where(eq(events.id, eventId));
  return true;
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

export async function joinEvent(eventId: string, userId: string) {
  // Check if event exists
  const [event] = await db.select().from(events).where(eq(events.id, eventId));
  if (!event) {
    throw new Error('Event not found');
  }

  // Check if user is already joined
  const [existingParticipation] = await db
    .select()
    .from(eventParticipants)
    .where(
      sql`${eventParticipants.eventId} = ${eventId} AND ${eventParticipants.userId} = ${userId}`
    );

  if (existingParticipation) {
    throw new Error('Already joined this event');
  }

  // Add user to event participants
  await db.insert(eventParticipants).values({
    eventId,
    userId,
  });

  return true;
}

export async function leaveEvent(eventId: string, userId: string) {
  await db.delete(eventParticipants)
    .where(
      sql`${eventParticipants.eventId} = ${eventId} AND ${eventParticipants.userId} = ${userId}`
    );
  return true;
}

export async function isParticipating(eventId: string, userId: string) {
  const [result] = await db
    .select()
    .from(eventParticipants)
    .where(
      sql`${eventParticipants.eventId} = ${eventId} AND ${eventParticipants.userId} = ${userId}`
    );
  
  return !!result;
}

export async function getEventParticipants(eventId: string) {
  return await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      profilePicture: users.profilePicture,
      joinedAt: eventParticipants.joinedAt,
    })
    .from(eventParticipants)
    .innerJoin(users, eq(eventParticipants.userId, users.id))
    .where(eq(eventParticipants.eventId, eventId));
}

export async function getUserParticipatingEvents(userId: string) {
  return await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      date: events.date,
      time: events.time,
      location: events.location,
      icon: events.icon,
      gradient: events.gradient,
      mediaUrl: events.mediaUrl,
      mediaType: events.mediaType,
      createdBy: events.createdBy,
      createdAt: events.createdAt,
      updatedAt: events.updatedAt,
      creatorName: users.name,
      creatorUsername: users.username,
      joinedAt: eventParticipants.joinedAt,
    })
    .from(eventParticipants)
    .innerJoin(events, eq(eventParticipants.eventId, events.id))
    .leftJoin(users, eq(events.createdBy, users.id))
    .where(eq(eventParticipants.userId, userId));
}

// Password Reset Functions
export async function createPasswordResetToken(email: string): Promise<string | null> {
  // Check if user exists
  const user = await getUserByEmail(email);
  if (!user) {
    return null; // Don't reveal if email exists or not
  }

  // Generate secure random token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Set expiration to 1 hour from now
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  // Delete any existing tokens for this user
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));

  // Create new token
  await db.insert(passwordResetTokens).values({
    userId: user.id,
    token,
    expiresAt,
  });

  return token;
}

export async function validatePasswordResetToken(token: string): Promise<string | null> {
  const [resetToken] = await db
    .select({
      userId: passwordResetTokens.userId,
      used: passwordResetTokens.used,
      expiresAt: passwordResetTokens.expiresAt,
    })
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token));

  if (!resetToken) {
    return null; // Token doesn't exist
  }

  if (resetToken.used) {
    return null; // Token already used
  }

  if (resetToken.expiresAt < new Date()) {
    return null; // Token expired
  }

  return resetToken.userId;
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const userId = await validatePasswordResetToken(token);
  if (!userId) {
    return false;
  }

  // Hash the new password
  const hashedPassword = await hashPassword(newPassword);

  // Update user's password
  await db.update(users)
    .set({ 
      password: hashedPassword,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  // Mark token as used
  await db.update(passwordResetTokens)
    .set({ used: new Date() })
    .where(eq(passwordResetTokens.token, token));

  return true;
}

export async function cleanupExpiredTokens(): Promise<void> {
  // Delete expired tokens (older than 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await db.delete(passwordResetTokens)
    .where(
      sql`${passwordResetTokens.expiresAt} < ${oneDayAgo} OR ${passwordResetTokens.used} IS NOT NULL`
    );
}