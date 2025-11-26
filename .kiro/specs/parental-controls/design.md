# Design Document: Parental Controls

## Overview

This design document outlines the implementation of parental controls and enhanced age assurance mechanisms for the Mirro social event application. The feature will integrate seamlessly with the existing authentication system, database schema, and settings interface to provide comprehensive age verification and parental control functionality that satisfies Apple's App Store guideline 2.3.6.

The implementation will extend the existing user model with age-related fields, create new database tables for parental control settings, and enhance the SettingsPage component with a dedicated parental controls section.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  AuthPage    │  │SettingsPage  │  │ Event Pages  │      │
│  │ (Age Input)  │  │(PC Controls) │  │ (Restricted) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ /api/auth    │  │/api/parental │  │/api/events   │      │
│  │ /register    │  │  -controls   │  │ (filtered)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ lib/auth.ts  │  │lib/parental  │  │lib/content   │      │
│  │              │  │  -controls.ts│  │  -filter.ts  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    users     │  │  parental    │  │   events     │      │
│  │ +dateOfBirth │  │  _controls   │  │ +isPublic    │      │
│  │ +ageCategory │  │              │  │ +isMature    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```


### Component Interaction Flow

1. **Registration Flow**: User enters date of birth → System calculates age category → Account created with appropriate restrictions
2. **Settings Access Flow**: Minor user opens settings → Parental Controls section visible → Guardian enters PIN → Settings displayed
3. **Content Filtering Flow**: User browses events → System filters based on age/restrictions → Only appropriate content shown
4. **Restriction Enforcement Flow**: User attempts restricted action → System checks parental controls → Action allowed/blocked with message

## Components and Interfaces

### Database Schema Extensions

#### Users Table Extension
```typescript
// Add to existing users table in lib/db/schema.ts
export const users = pgTable('users', {
  // ... existing fields ...
  dateOfBirth: text('date_of_birth'), // ISO date string
  ageCategory: text('age_category'), // 'under_13' | 'minor' | 'adult'
  guardianEmail: text('guardian_email'), // For minors, email for notifications
});
```

#### New Parental Controls Table
```typescript
export const parentalControls = pgTable('parental_controls', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  pin: text('pin').notNull(), // Hashed 4-digit PIN
  messagingRestricted: boolean('messaging_restricted').default(true),
  eventCreationRestricted: boolean('event_creation_restricted').default(true),
  contentFilteringEnabled: boolean('content_filtering_enabled').default(true),
  notificationsEnabled: boolean('notifications_enabled').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

#### PIN Attempts Tracking Table
```typescript
export const pinAttempts = pgTable('pin_attempts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  attemptCount: integer('attempt_count').default(0),
  lockedUntil: timestamp('locked_until'),
  lastAttemptAt: timestamp('last_attempt_at').defaultNow().notNull(),
});
```

#### Events Table Extension
```typescript
// Add to existing events table
export const events = pgTable('events', {
  // ... existing fields ...
  isPublic: boolean('is_public').default(true),
  isMature: boolean('is_mature').default(false), // Flagged by content moderation
});
```


### API Interfaces

#### POST /api/auth/register
```typescript
interface RegisterRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  dateOfBirth: string; // ISO date string
  guardianEmail?: string; // Required if user is minor
}

interface RegisterResponse {
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    ageCategory: 'under_13' | 'minor' | 'adult';
    requiresPinSetup: boolean;
  };
}
```

#### POST /api/parental-controls/setup-pin
```typescript
interface SetupPinRequest {
  userId: string;
  pin: string;
  confirmPin: string;
}

interface SetupPinResponse {
  success: boolean;
  message: string;
}
```

#### POST /api/parental-controls/verify-pin
```typescript
interface VerifyPinRequest {
  userId: string;
  pin: string;
}

interface VerifyPinResponse {
  success: boolean;
  attemptsRemaining?: number;
  lockedUntil?: string; // ISO timestamp
}
```

#### GET /api/parental-controls/settings
```typescript
interface GetSettingsRequest {
  userId: string;
  pin: string; // Required for authentication
}

interface GetSettingsResponse {
  messagingRestricted: boolean;
  eventCreationRestricted: boolean;
  contentFilteringEnabled: boolean;
  notificationsEnabled: boolean;
}
```

#### PUT /api/parental-controls/settings
```typescript
interface UpdateSettingsRequest {
  userId: string;
  pin: string;
  settings: {
    messagingRestricted?: boolean;
    eventCreationRestricted?: boolean;
    contentFilteringEnabled?: boolean;
    notificationsEnabled?: boolean;
  };
}

interface UpdateSettingsResponse {
  success: boolean;
  settings: ParentalControlSettings;
}
```

#### POST /api/parental-controls/reset-pin
```typescript
interface ResetPinRequest {
  email: string; // Guardian email
}

interface ResetPinResponse {
  success: boolean;
  message: string;
}
```


## Data Models

### User Model Extension
```typescript
interface User {
  // ... existing fields ...
  dateOfBirth?: string; // ISO date string
  ageCategory?: 'under_13' | 'minor' | 'adult';
  guardianEmail?: string;
}
```

### Parental Control Settings Model
```typescript
interface ParentalControlSettings {
  id: string;
  userId: string;
  pin: string; // Hashed
  messagingRestricted: boolean;
  eventCreationRestricted: boolean;
  contentFilteringEnabled: boolean;
  notificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### PIN Attempt Model
```typescript
interface PinAttempt {
  id: string;
  userId: string;
  attemptCount: number;
  lockedUntil?: Date;
  lastAttemptAt: Date;
}
```

### Age Category Calculation
```typescript
function calculateAgeCategory(dateOfBirth: string): 'under_13' | 'minor' | 'adult' {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // Adjust age if birthday hasn't occurred this year
  const adjustedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ? age - 1
    : age;
  
  if (adjustedAge < 13) return 'under_13';
  if (adjustedAge < 18) return 'minor';
  return 'adult';
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Under-13 Registration Rejection
*For any* date of birth that calculates to an age under 13 years, account registration should be rejected with an age restriction message.
**Validates: Requirements 1.2**

### Property 2: Minor Account Restrictions
*For any* date of birth that calculates to an age between 13 and 17 years, account creation should succeed and parental control restrictions should be enabled by default.
**Validates: Requirements 1.3**

### Property 3: Adult Account No Restrictions
*For any* date of birth that calculates to an age of 18 years or older, account creation should succeed without parental control restrictions.
**Validates: Requirements 1.4**

### Property 4: Date of Birth Modification Requires Verification
*For any* user attempting to modify their date of birth after registration, the system should require additional verification before allowing the change.
**Validates: Requirements 1.5**

### Property 5: PIN Required for Settings Access
*For any* attempt to access parental control settings, the system should require correct PIN authentication before displaying the settings.
**Validates: Requirements 2.2, 3.4**

### Property 6: Setting Changes Persist
*For any* parental control setting modification by a guardian, the changes should be immediately saved to the database and applied to the user's account.
**Validates: Requirements 2.4**

### Property 7: Automatic Restriction Removal at 18
*For any* user whose age transitions to 18 years, the system should automatically disable parental controls and notify the user.
**Validates: Requirements 2.5**

### Property 8: Mismatched PIN Rejection
*For any* PIN setup attempt where the PIN and confirmation PIN do not match, the system should display an error message and require re-entry.
**Validates: Requirements 3.3**

### Property 9: Messaging Restriction Enforcement
*For any* minor user with messaging restrictions enabled, attempts to initiate conversations with non-followed users should be blocked with an appropriate message.
**Validates: Requirements 4.1, 4.3**

### Property 10: Message Receipt Filtering
*For any* minor user with messaging restrictions enabled, incoming messages should only be allowed from users they follow.
**Validates: Requirements 4.2**

### Property 11: Messaging Restriction Toggle
*For any* minor user, disabling messaging restrictions should restore full messaging capabilities, and enabling them should block non-followed user messaging.
**Validates: Requirements 4.4**

### Property 12: Block Overrides Restrictions
*For any* blocked user, messaging should be prevented regardless of parental control restriction settings.
**Validates: Requirements 4.5**

### Property 13: Public Event Creation Restriction
*For any* minor user with event creation restrictions enabled, attempts to create public events should be blocked with an appropriate message.
**Validates: Requirements 5.1, 5.3**

### Property 14: Private Event Creation Allowed
*For any* minor user with event creation restrictions enabled, creating private events visible only to approved contacts should be allowed.
**Validates: Requirements 5.2**

### Property 15: Event Creation Restriction Toggle
*For any* minor user, disabling event creation restrictions should restore full event creation capabilities.
**Validates: Requirements 5.5**

### Property 16: Mature Content Filtering
*For any* minor user with content filtering enabled, events marked as containing mature content should be hidden from their feed.
**Validates: Requirements 6.1**

### Property 17: Inappropriate Media Blurring
*For any* minor user with content filtering enabled, media attachments flagged as potentially inappropriate should be blurred or hidden.
**Validates: Requirements 6.2**

### Property 18: Filtered Content Message Display
*For any* minor user attempting to view filtered content, the system should display a message indicating the content is restricted by parental controls.
**Validates: Requirements 6.3**

### Property 19: Feed Updates on Filter Changes
*For any* content filtering setting modification, the user's feed should immediately update to reflect the new filtering rules.
**Validates: Requirements 6.4**

### Property 20: Automatic Filtering on Reports
*For any* content reported by multiple users as inappropriate, the system should automatically apply content filtering regardless of individual user settings.
**Validates: Requirements 6.5**

### Property 21: New Contact Notification
*For any* minor user receiving a message from a new contact, the system should send a notification to the guardian's registered email address.
**Validates: Requirements 7.1**

### Property 22: Public Event Join Notification
*For any* minor user joining a public event, the system should send a notification to the guardian's registered email address with event details.
**Validates: Requirements 7.2**

### Property 23: Content Report Notification
*For any* minor user whose content is reported by another user, the system should immediately notify the guardian via email.
**Validates: Requirements 7.3**

### Property 24: Notification Filtering
*For any* guardian who disables notifications, the system should stop sending activity alerts but continue to send critical safety notifications.
**Validates: Requirements 7.5**

### Property 25: PIN Reset Email Delivery
*For any* guardian selecting the "Forgot PIN" option, the system should send a PIN reset link to the guardian's registered email address.
**Validates: Requirements 8.1**

### Property 26: PIN Reset Link Expiration
*For any* PIN reset link generated, the system should expire the link after 24 hours for security purposes.
**Validates: Requirements 8.3**

### Property 27: PIN Creation Confirmation
*For any* successful new PIN creation, the system should send a confirmation email to the guardian.
**Validates: Requirements 8.4**

### Property 28: Reset Locks Modifications
*For any* PIN reset request, the system should temporarily lock parental control modifications until the reset is completed.
**Validates: Requirements 8.5**

### Property 29: Minor Account Indicator Display
*For any* user under 18 who creates an account, the system should display a visible indicator that parental controls are active.
**Validates: Requirements 9.2**

### Property 30: Settings Lock Icon Display
*For any* account with active parental controls, the system should display a lock icon or similar indicator in the settings menu.
**Validates: Requirements 9.3**

### Property 31: Age Category Storage
*For any* completed age verification, the system should store the user's age category for compliance reporting purposes.
**Validates: Requirements 9.5**


## Error Handling

### Age Verification Errors

1. **Invalid Date Format**: If date of birth is not in valid ISO format, return 400 error with message "Invalid date format"
2. **Future Date**: If date of birth is in the future, return 400 error with message "Date of birth cannot be in the future"
3. **Under 13 Registration**: If calculated age is under 13, return 403 error with message "You must be at least 13 years old to create an account"
4. **Missing Guardian Email**: If user is minor and guardian email is not provided, return 400 error with message "Guardian email is required for users under 18"

### PIN Authentication Errors

1. **Invalid PIN Format**: If PIN is not exactly 4 digits, return 400 error with message "PIN must be exactly 4 digits"
2. **Incorrect PIN**: If PIN doesn't match stored hash, return 401 error with message "Incorrect PIN" and remaining attempts count
3. **Account Locked**: If account is locked due to failed attempts, return 423 error with message "Account locked until [timestamp]"
4. **PIN Mismatch**: If PIN and confirmation don't match during setup, return 400 error with message "PINs do not match"

### Restriction Enforcement Errors

1. **Messaging Restricted**: If minor attempts to message non-followed user, return 403 error with message "Messaging is restricted by parental controls. You can only message users you follow."
2. **Event Creation Restricted**: If minor attempts to create public event, return 403 error with message "Public event creation is restricted by parental controls. You can create private events only."
3. **Content Filtered**: If minor attempts to view filtered content, return 403 error with message "This content is restricted by parental controls."

### Database Errors

1. **User Not Found**: If user ID doesn't exist, return 404 error with message "User not found"
2. **Parental Controls Not Found**: If parental controls don't exist for user, return 404 error with message "Parental controls not configured"
3. **Duplicate PIN Setup**: If PIN already exists for user, return 409 error with message "PIN already configured. Use reset PIN to change it."

### Email Notification Errors

1. **Invalid Email**: If guardian email is invalid, log error but don't block operation
2. **Email Send Failure**: If email fails to send, log error and retry up to 3 times
3. **Missing Guardian Email**: If notification required but no guardian email, log warning

## Testing Strategy

### Unit Testing

The implementation will include comprehensive unit tests for:

1. **Age Calculation Logic**: Test calculateAgeCategory function with various dates including edge cases (birthdays today, leap years, etc.)
2. **PIN Hashing and Verification**: Test PIN hashing produces different hashes for same PIN, verification works correctly
3. **Restriction Checking Functions**: Test functions that determine if actions are allowed based on settings
4. **Email Notification Formatting**: Test notification email content generation
5. **Database Query Functions**: Test CRUD operations for parental controls and PIN attempts

### Property-Based Testing

Property-based testing will be implemented using **fast-check** (for TypeScript/JavaScript). Each property-based test will run a minimum of 100 iterations to ensure comprehensive coverage.

Each property-based test MUST be tagged with a comment explicitly referencing the correctness property in this design document using the format: **Feature: parental-controls, Property {number}: {property_text}**

Property-based tests will verify:

1. **Age Category Calculation**: Generate random dates and verify age categories are correctly assigned
2. **PIN Validation**: Generate random 4-digit PINs and verify validation logic
3. **Restriction Enforcement**: Generate random user states and verify restrictions are correctly applied
4. **Setting Persistence**: Generate random setting changes and verify they persist correctly
5. **Content Filtering**: Generate random content with various flags and verify filtering logic
6. **Notification Triggers**: Generate random user actions and verify appropriate notifications are sent

### Integration Testing

Integration tests will verify:

1. **Registration Flow**: Complete registration with various ages and verify correct setup
2. **Settings Access Flow**: Attempt to access settings with correct/incorrect PINs
3. **Restriction Enforcement**: Attempt restricted actions and verify they're blocked
4. **Age Transition**: Simulate user aging to 18 and verify automatic restriction removal

### Manual Testing for App Store Compliance

1. **Reviewer Path**: Document clear steps for App Store reviewers to find and test parental controls
2. **Visual Indicators**: Verify lock icons and indicators are visible in UI
3. **PIN Flow**: Test complete PIN setup, verification, and reset flows
4. **Restriction Testing**: Test each restriction type with minor account

