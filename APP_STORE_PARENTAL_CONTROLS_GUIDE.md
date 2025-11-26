# App Store Reviewer Guide: Parental Controls

## Overview
This guide demonstrates how Mirro complies with Apple's App Store guideline 2.3.6 regarding In-App Controls for age ratings. Our app implements comprehensive parental controls and age assurance mechanisms to protect minor users.

## Quick Access for Reviewers

### Testing Credentials
For App Store review purposes, you can test the parental controls feature using these steps:

1. **Create a Minor Account** (Age 13-17)
2. **Create an Adult Account** (Age 18+)
3. **Test Parental Controls Access**

## Feature Location

### 1. Age Verification (Registration)
**Location:** Sign Up flow
**Path:** App Launch → Sign Up

**Steps to Test:**
1. Launch the app
2. Tap "SIGN UP" at the top of the screen
3. Fill in Name, Username, Email
4. **Enter Date of Birth** - This is where age verification occurs
5. Observe behavior based on age:
   - **Under 13:** Registration is rejected with message "You must be at least 13 years old to create an account"
   - **13-17 years:** Registration proceeds, guardian email field appears, message shows "Parental controls will be enabled for your account"
   - **18+ years:** Registration proceeds normally without restrictions

**Screenshot Locations:**
- Registration form with Date of Birth field
- Guardian email field (for minors)
- Age restriction message (for under-13)
- Parental controls notification (for 13-17)

### 2. PIN Setup (For Minor Accounts)
**Location:** Immediately after minor account registration
**Automatic:** Appears automatically for users aged 13-17

**Steps to Test:**
1. Complete registration with age 13-17
2. PIN Setup Modal appears automatically
3. Enter a 4-digit PIN (e.g., 1234)
4. Confirm the PIN by entering it again
5. PIN is now set and required to access parental control settings

**Features:**
- Double-entry confirmation prevents typos
- Error message if PINs don't match
- PIN is hashed using bcrypt for security

### 3. Parental Controls Settings
**Location:** Settings → Parental Controls
**Path:** Main App → Profile Icon (bottom right) → Settings Icon (top right) → Parental Controls

**Steps to Test:**
1. Log in with a minor account (age 13-17)
2. Tap Profile icon in bottom navigation
3. Tap Settings icon (gear) in top right
4. Look for "Parental Controls" section with blue background and lock icon
5. Tap "Parental Controls"
6. Enter the 4-digit PIN you set during registration
7. View and toggle restriction settings

**Visual Indicators:**
- Blue highlighted section in settings menu
- Lock icon next to "Parental Controls" text
- Shield icon in parental controls interface
- Clear labeling: "Parental Controls"

**Available Settings:**
1. **Messaging Restrictions**
   - Icon: Message bubble
   - Description: "Only allow messaging with followed users"
   - Default: ON

2. **Event Creation Restrictions**
   - Icon: Calendar
   - Description: "Prevent creating public events"
   - Default: ON

3. **Content Filtering**
   - Icon: Filter
   - Description: "Hide mature or inappropriate content"
   - Default: ON

4. **Guardian Notifications**
   - Icon: Bell
   - Description: "Receive activity alerts via email"
   - Default: ON

### 4. PIN Security Features
**Location:** Parental Controls access

**Security Measures:**
1. **Rate Limiting:** 3 failed attempts locks access for 15 minutes
2. **PIN Reset:** "Forgot PIN?" link sends reset email to guardian
3. **Secure Storage:** PINs are hashed using bcrypt, never stored in plain text

**Steps to Test Rate Limiting:**
1. Access Parental Controls
2. Enter incorrect PIN 3 times
3. Observe lockout message with countdown timer
4. Verify access is blocked for 15 minutes

### 5. Restriction Enforcement

#### Messaging Restrictions
**When:** Messaging restrictions are enabled
**Effect:** User can only message people they follow

**Steps to Test:**
1. Enable messaging restrictions in parental controls
2. Try to send a message to a user you don't follow
3. Observe restriction message: "Messaging is restricted by parental controls. You can only message users you follow."

#### Event Creation Restrictions
**When:** Event creation restrictions are enabled
**Effect:** User cannot create public events

**Steps to Test:**
1. Enable event creation restrictions in parental controls
2. Try to create a new event
3. Observe restriction check before event creation
4. Alert appears: "Public event creation is restricted by parental controls"

#### Content Filtering
**When:** Content filtering is enabled
**Effect:** Events marked as mature are hidden from feed

**Steps to Test:**
1. Enable content filtering in parental controls
2. Browse event feed
3. Mature content is automatically filtered out
4. Only age-appropriate events are displayed

### 6. Age Transition (Automatic Restriction Removal)
**When:** User turns 18 years old
**Effect:** Parental controls are automatically removed

**How It Works:**
- Age is recalculated on every login
- When user reaches 18, restrictions are automatically disabled
- User is notified of the change
- Parental control settings are removed from database

## Compliance Checklist

✅ **Age Verification at Registration**
- Date of birth required during sign-up
- Under-13 users are rejected
- Minors (13-17) have restrictions enabled by default

✅ **PIN-Protected Settings**
- 4-digit PIN required to access parental controls
- PIN setup mandatory for minor accounts
- Secure PIN storage (bcrypt hashing)

✅ **Configurable Restrictions**
- Messaging restrictions (follow-only)
- Event creation restrictions (no public events)
- Content filtering (hide mature content)
- Guardian notifications

✅ **Visual Indicators**
- Lock icon in settings menu
- Blue highlighted parental controls section
- Clear labeling and descriptions
- Shield icon in controls interface

✅ **Security Features**
- Rate limiting (3 attempts, 15-minute lockout)
- PIN reset via guardian email
- Secure token-based reset process

✅ **Automatic Age Transition**
- Restrictions removed at age 18
- User notification
- Database cleanup

## Technical Implementation

### Database Schema
- `users` table extended with `dateOfBirth`, `ageCategory`, `guardianEmail`
- `parental_controls` table stores PIN and restriction settings
- `pin_attempts` table tracks failed attempts for rate limiting
- `pin_reset_tokens` table manages PIN recovery

### API Endpoints
- `POST /api/auth/register` - Age verification during registration
- `POST /api/parental-controls/setup-pin` - Initial PIN setup
- `POST /api/parental-controls/verify-pin` - PIN verification
- `GET /api/parental-controls/settings` - Retrieve settings
- `PUT /api/parental-controls/settings` - Update settings
- `POST /api/parental-controls/reset-pin` - Request PIN reset
- `POST /api/parental-controls/complete-reset` - Complete PIN reset

### Security Measures
- PINs hashed with bcrypt (10 rounds)
- Rate limiting on PIN attempts
- Token-based PIN reset with 24-hour expiration
- Single-use reset tokens
- Automatic lockout after failed attempts

## Screenshots for App Store Submission

### Required Screenshots:
1. **Registration with Date of Birth**
   - Shows DOB input field
   - Shows guardian email field (for minors)
   - Shows age restriction message

2. **PIN Setup Modal**
   - Shows PIN entry interface
   - Shows confirmation step
   - Shows error handling

3. **Settings Menu with Parental Controls**
   - Shows lock icon indicator
   - Shows blue highlighted section
   - Shows clear labeling

4. **Parental Controls Settings Panel**
   - Shows all four restriction toggles
   - Shows icons and descriptions
   - Shows shield icon

5. **Restriction Enforcement**
   - Shows messaging restriction message
   - Shows event creation restriction alert
   - Shows content filtering in action

## Support Contact

For questions about parental controls:
- **Email:** mirrosocial@gmail.com
- **In-App:** Settings → Contact Support

## Privacy & Data Handling

- Date of birth is stored securely and used only for age verification
- Guardian email is used only for parental control notifications
- PINs are hashed and never stored in plain text
- No data is shared with third parties
- Users can request data deletion at any time

## Compliance Statement

Mirro implements comprehensive parental controls that comply with Apple's App Store guideline 2.3.6. Our age verification system ensures that:

1. Users under 13 cannot create accounts
2. Users aged 13-17 have parental controls enabled by default
3. Parents/guardians can configure restrictions via PIN-protected settings
4. Restrictions are automatically removed when users turn 18
5. All features are clearly documented and easily accessible

The parental controls are prominently displayed in the Settings menu with clear visual indicators (lock icon, blue highlighting) and are protected by a secure PIN system with rate limiting and recovery options.
