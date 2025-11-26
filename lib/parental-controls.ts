import { db } from './db';
import { users, parentalControls, pinAttempts, pinResetTokens, events, follows, blockedUsers } from './db/schema';
import { eq, and, sql, count } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

export type AgeCategory = 'under_13' | 'minor' | 'adult';

/**
 * Calculate age category from date of birth
 * Feature: parental-controls, Property 1: Under-13 Registration Rejection
 * Feature: parental-controls, Property 2: Minor Account Restrictions
 * Feature: parental-controls, Property 3: Adult Account No Restrictions
 */
export function calculateAgeCategory(dateOfBirth: string): AgeCategory {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // Adjust age if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  if (age < 13) return 'under_13';
  if (age < 18) return 'minor';
  return 'adult';
}

/**
 * Validate date of birth format and value
 */
export function validateDateOfBirth(dateOfBirth: string): { valid: boolean; error?: string } {
  // Check if valid ISO date format
  const date = new Date(dateOfBirth);
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }
  
  // Check if date is in the future
  if (date > new Date()) {
    return { valid: false, error: 'Date of birth cannot be in the future' };
  }
  
  return { valid: true };
}

/**
 * Hash a 4-digit PIN using bcrypt
 */
export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

/**
 * Verify a PIN against a hash
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

/**
 * Validate PIN format (must be exactly 4 digits)
 */
export function validatePinFormat(pin: string): { valid: boolean; error?: string } {
  if (!/^\d{4}$/.test(pin)) {
    return { valid: false, error: 'PIN must be exactly 4 digits' };
  }
  return { valid: true };
}

/**
 * Setup PIN for a user
 * Feature: parental-controls, Property 8: Mismatched PIN Rejection
 */
export async function setupPin(userId: string, pin: string, confirmPin: string) {
  // Validate PIN format
  const formatValidation = validatePinFormat(pin);
  if (!formatValidation.valid) {
    throw new Error(formatValidation.error);
  }
  
  // Check if PINs match
  if (pin !== confirmPin) {
    throw new Error('PINs do not match');
  }
  
  // Check if PIN already exists
  const existing = await db.select().from(parentalControls).where(eq(parentalControls.userId, userId)).limit(1);
  if (existing.length > 0) {
    throw new Error('PIN already configured. Use reset PIN to change it.');
  }
  
  // Hash and store PIN
  const hashedPin = await hashPin(pin);
  
  await db.insert(parentalControls).values({
    userId,
    pin: hashedPin,
    messagingRestricted: true,
    eventCreationRestricted: true,
    contentFilteringEnabled: true,
    notificationsEnabled: true,
  });
  
  // Send confirmation email to guardian
  try {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (user.length > 0 && user[0].guardianEmail) {
      const { sendPinSetupConfirmation } = await import('./guardian-notifications');
      await sendPinSetupConfirmation({
        guardianEmail: user[0].guardianEmail,
        minorName: user[0].name,
        minorUsername: user[0].username,
      });
    }
  } catch (error) {
    console.error('Failed to send PIN setup confirmation email:', error);
    // Don't fail the PIN setup if email fails
  }
  
  return { success: true };
}

/**
 * Verify PIN attempt with rate limiting
 * Feature: parental-controls, Property 5: PIN Required for Settings Access
 */
export async function verifyPinAttempt(userId: string, pin: string) {
  // Check if account is locked
  const attempts = await db.select().from(pinAttempts).where(eq(pinAttempts.userId, userId)).limit(1);
  
  if (attempts.length > 0) {
    const attempt = attempts[0];
    if (attempt.lockedUntil && new Date(attempt.lockedUntil) > new Date()) {
      return {
        success: false,
        error: `Account locked until ${attempt.lockedUntil.toISOString()}`,
        lockedUntil: attempt.lockedUntil.toISOString(),
      };
    }
  }
  
  // Get parental controls
  const controls = await db.select().from(parentalControls).where(eq(parentalControls.userId, userId)).limit(1);
  if (controls.length === 0) {
    throw new Error('Parental controls not configured');
  }
  
  // Verify PIN
  const isValid = await verifyPin(pin, controls[0].pin);
  
  if (!isValid) {
    // Increment attempt count
    let attemptCount = 1;
    let lockedUntil = null;
    
    if (attempts.length > 0) {
      attemptCount = (attempts[0].attemptCount || 0) + 1;
      
      // Lock account after 3 failed attempts
      if (attemptCount >= 3) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await db.update(pinAttempts)
          .set({ attemptCount, lockedUntil, lastAttemptAt: new Date() })
          .where(eq(pinAttempts.userId, userId));
        
        return {
          success: false,
          error: 'Account locked for 15 minutes due to too many failed attempts',
          lockedUntil: lockedUntil.toISOString(),
        };
      }
      
      await db.update(pinAttempts)
        .set({ attemptCount, lastAttemptAt: new Date() })
        .where(eq(pinAttempts.userId, userId));
    } else {
      await db.insert(pinAttempts).values({
        userId,
        attemptCount,
        lastAttemptAt: new Date(),
      });
    }
    
    return {
      success: false,
      error: 'Incorrect PIN',
      attemptsRemaining: 3 - attemptCount,
    };
  }
  
  // Reset attempt count on successful verification
  if (attempts.length > 0) {
    await db.update(pinAttempts)
      .set({ attemptCount: 0, lockedUntil: null })
      .where(eq(pinAttempts.userId, userId));
  }
  
  return { success: true };
}

/**
 * Get parental control settings for a user
 */
export async function getParentalControlSettings(userId: string) {
  const controls = await db.select().from(parentalControls).where(eq(parentalControls.userId, userId)).limit(1);
  
  if (controls.length === 0) {
    return null;
  }
  
  return {
    messagingRestricted: controls[0].messagingRestricted,
    eventCreationRestricted: controls[0].eventCreationRestricted,
    contentFilteringEnabled: controls[0].contentFilteringEnabled,
    notificationsEnabled: controls[0].notificationsEnabled,
  };
}

/**
 * Update parental control settings
 * Feature: parental-controls, Property 6: Setting Changes Persist
 */
export async function updateParentalControlSettings(
  userId: string,
  settings: {
    messagingRestricted?: boolean;
    eventCreationRestricted?: boolean;
    contentFilteringEnabled?: boolean;
    notificationsEnabled?: boolean;
  }
) {
  await db.update(parentalControls)
    .set({ ...settings, updatedAt: new Date() })
    .where(eq(parentalControls.userId, userId));
  
  return getParentalControlSettings(userId);
}

/**
 * Create default parental controls for a minor user
 */
export async function createDefaultParentalControls(userId: string, initialPin: string) {
  const hashedPin = await hashPin(initialPin);
  
  await db.insert(parentalControls).values({
    userId,
    pin: hashedPin,
    messagingRestricted: true,
    eventCreationRestricted: true,
    contentFilteringEnabled: true,
    notificationsEnabled: true,
  });
}

/**
 * Check if user can send message to another user
 * Feature: parental-controls, Property 9: Messaging Restriction Enforcement
 * Feature: parental-controls, Property 10: Message Receipt Filtering
 * Feature: parental-controls, Property 12: Block Overrides Restrictions
 */
export async function canSendMessage(senderId: string, recipientId: string): Promise<{ allowed: boolean; reason?: string }> {
  // Check if blocked
  const blocked = await db.select()
    .from(blockedUsers)
    .where(
      and(
        eq(blockedUsers.blockerId, recipientId),
        eq(blockedUsers.blockedId, senderId)
      )
    )
    .limit(1);
  
  if (blocked.length > 0) {
    return { allowed: false, reason: 'You are blocked by this user' };
  }
  
  // Check sender's parental controls
  const senderControls = await getParentalControlSettings(senderId);
  
  if (senderControls && senderControls.messagingRestricted) {
    // Check if sender follows recipient
    const following = await db.select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, senderId),
          eq(follows.followingId, recipientId)
        )
      )
      .limit(1);
    
    if (following.length === 0) {
      return {
        allowed: false,
        reason: 'Messaging is restricted by parental controls. You can only message users you follow.',
      };
    }
  }
  
  return { allowed: true };
}

/**
 * Check if user can create a public event
 * Feature: parental-controls, Property 13: Public Event Creation Restriction
 * Feature: parental-controls, Property 14: Private Event Creation Allowed
 */
export async function canCreatePublicEvent(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const controls = await getParentalControlSettings(userId);
  
  if (controls && controls.eventCreationRestricted) {
    return {
      allowed: false,
      reason: 'Public event creation is restricted by parental controls. You can create private events only.',
    };
  }
  
  return { allowed: true };
}

/**
 * Check if content should be filtered for a user
 * Feature: parental-controls, Property 16: Mature Content Filtering
 */
export async function shouldFilterContent(userId: string, eventId: string): Promise<boolean> {
  const controls = await getParentalControlSettings(userId);
  
  if (!controls || !controls.contentFilteringEnabled) {
    return false;
  }
  
  // Check if event is marked as mature
  const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  
  if (event.length > 0 && event[0].isMature) {
    return true;
  }
  
  return false;
}

/**
 * Generate PIN reset token
 * Feature: parental-controls, Property 25: PIN Reset Email Delivery
 * Feature: parental-controls, Property 28: Reset Locks Modifications
 */
export async function generatePinResetToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  await db.insert(pinResetTokens).values({
    userId,
    token,
    expiresAt,
  });
  
  return token;
}

/**
 * Verify and use PIN reset token
 * Feature: parental-controls, Property 26: PIN Reset Link Expiration
 */
export async function verifyPinResetToken(token: string): Promise<{ valid: boolean; userId?: string; error?: string }> {
  const tokens = await db.select().from(pinResetTokens).where(eq(pinResetTokens.token, token)).limit(1);
  
  if (tokens.length === 0) {
    return { valid: false, error: 'Invalid reset token' };
  }
  
  const resetToken = tokens[0];
  
  // Check if already used
  if (resetToken.used) {
    return { valid: false, error: 'Reset token already used' };
  }
  
  // Check if expired
  if (new Date(resetToken.expiresAt) < new Date()) {
    return { valid: false, error: 'Reset token expired' };
  }
  
  return { valid: true, userId: resetToken.userId };
}

/**
 * Complete PIN reset
 * Feature: parental-controls, Property 27: PIN Creation Confirmation
 */
export async function completePinReset(token: string, newPin: string, confirmPin: string) {
  // Validate token
  const tokenValidation = await verifyPinResetToken(token);
  if (!tokenValidation.valid) {
    throw new Error(tokenValidation.error);
  }
  
  // Validate PIN format
  const formatValidation = validatePinFormat(newPin);
  if (!formatValidation.valid) {
    throw new Error(formatValidation.error);
  }
  
  // Check if PINs match
  if (newPin !== confirmPin) {
    throw new Error('PINs do not match');
  }
  
  // Hash new PIN
  const hashedPin = await hashPin(newPin);
  
  // Update PIN
  await db.update(parentalControls)
    .set({ pin: hashedPin, updatedAt: new Date() })
    .where(eq(parentalControls.userId, tokenValidation.userId!));
  
  // Mark token as used
  await db.update(pinResetTokens)
    .set({ used: new Date() })
    .where(eq(pinResetTokens.token, token));
  
  // Reset any lockouts
  await db.update(pinAttempts)
    .set({ attemptCount: 0, lockedUntil: null })
    .where(eq(pinAttempts.userId, tokenValidation.userId!));
  
  // Send confirmation email to guardian
  try {
    const user = await db.select().from(users).where(eq(users.id, tokenValidation.userId!)).limit(1);
    if (user.length > 0 && user[0].guardianEmail) {
      const { sendPinResetConfirmation } = await import('./guardian-notifications');
      await sendPinResetConfirmation({
        guardianEmail: user[0].guardianEmail,
        minorName: user[0].name,
        minorUsername: user[0].username,
      });
    }
  } catch (error) {
    console.error('Failed to send PIN reset confirmation email:', error);
    // Don't fail the reset if email fails
  }
  
  return { success: true, userId: tokenValidation.userId };
}

/**
 * Check and handle age transition (minor to adult)
 * Feature: parental-controls, Property 7: Automatic Restriction Removal at 18
 */
export async function checkAndHandleAgeTransition(userId: string): Promise<{ transitioned: boolean }> {
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  
  if (user.length === 0 || !user[0].dateOfBirth) {
    return { transitioned: false };
  }
  
  const currentAgeCategory = calculateAgeCategory(user[0].dateOfBirth);
  
  // If user was a minor but is now an adult
  if (user[0].ageCategory === 'minor' && currentAgeCategory === 'adult') {
    // Update age category
    await db.update(users)
      .set({ ageCategory: currentAgeCategory })
      .where(eq(users.id, userId));
    
    // Delete parental controls
    await db.delete(parentalControls).where(eq(parentalControls.userId, userId));
    
    return { transitioned: true };
  }
  
  return { transitioned: false };
}
