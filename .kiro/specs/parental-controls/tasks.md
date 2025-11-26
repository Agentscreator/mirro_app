# Implementation Plan

- [x] 1. Database schema setup and migrations
- [x] 1.1 Extend users table with age-related fields
  - Add dateOfBirth, ageCategory, and guardianEmail columns to users table in schema.ts
  - Create migration file for users table extension
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 1.2 Create parental controls table
  - Define parentalControls table with PIN, restriction settings, and timestamps
  - Add relations to users table
  - Create migration file for parental_controls table
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 1.3 Create PIN attempts tracking table
  - Define pinAttempts table for rate limiting
  - Add relations to users table
  - Create migration file for pin_attempts table
  - _Requirements: 3.5_

- [x] 1.4 Extend events table with content flags
  - Add isPublic and isMature boolean columns to events table
  - Create migration file for events table extension
  - _Requirements: 5.1, 5.2, 6.1_

- [x] 1.5 Run database migrations
  - Execute all migration files against the database
  - Verify schema changes are applied correctly
  - _Requirements: All database-related requirements_

- [x] 2. Core business logic implementation
- [x] 2.1 Create age calculation utility
  - Implement calculateAgeCategory function in lib/parental-controls.ts
  - Handle edge cases (leap years, birthdays today, timezone considerations)
  - _Requirements: 1.2, 1.3, 1.4_

- [ ]* 2.2 Write property test for age calculation
  - **Property 1: Under-13 Registration Rejection**
  - **Property 2: Minor Account Restrictions**
  - **Property 3: Adult Account No Restrictions**
  - **Validates: Requirements 1.2, 1.3, 1.4**

- [x] 2.3 Create PIN management functions
  - Implement hashPin and verifyPin functions using bcrypt
  - Implement setupPin, verifyPinAttempt, and resetPin functions
  - Handle PIN attempt tracking and lockout logic
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 2.4 Write property test for PIN validation
  - **Property 5: PIN Required for Settings Access**
  - **Property 8: Mismatched PIN Rejection**
  - **Validates: Requirements 2.2, 3.3, 3.4**

- [x] 2.5 Create parental control settings management
  - Implement getParentalControlSettings function
  - Implement updateParentalControlSettings function
  - Implement createDefaultParentalControls for new minor accounts
  - _Requirements: 2.3, 2.4_

- [ ]* 2.6 Write property test for settings persistence
  - **Property 6: Setting Changes Persist**
  - **Validates: Requirements 2.4**

- [x] 2.7 Create restriction checking functions
  - Implement canSendMessage function (checks messaging restrictions and follow status)
  - Implement canCreatePublicEvent function (checks event creation restrictions)
  - Implement shouldFilterContent function (checks content filtering settings)
  - _Requirements: 4.1, 4.2, 5.1, 5.2, 6.1, 6.2_

- [ ]* 2.8 Write property tests for restriction enforcement
  - **Property 9: Messaging Restriction Enforcement**
  - **Property 10: Message Receipt Filtering**
  - **Property 11: Messaging Restriction Toggle**
  - **Property 12: Block Overrides Restrictions**
  - **Property 13: Public Event Creation Restriction**
  - **Property 14: Private Event Creation Allowed**
  - **Property 15: Event Creation Restriction Toggle**
  - **Validates: Requirements 4.1, 4.2, 4.4, 4.5, 5.1, 5.2, 5.5**

- [x] 3. Authentication and registration updates
- [x] 3.1 Update registration API to accept date of birth
  - Modify /api/auth/register route to accept dateOfBirth and guardianEmail
  - Add age calculation and validation logic
  - Reject under-13 registrations with appropriate error
  - Create default parental controls for minor accounts
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ]* 3.2 Write property tests for registration age handling
  - **Property 1: Under-13 Registration Rejection**
  - **Property 2: Minor Account Restrictions**
  - **Property 3: Adult Account No Restrictions**
  - **Property 31: Age Category Storage**
  - **Validates: Requirements 1.2, 1.3, 1.4, 9.5**

- [x] 3.3 Update AuthPage component with date of birth input
  - Add date of birth input field to registration form
  - Add conditional guardian email field for minors (shown after DOB entered)
  - Add client-side age validation
  - Display age restriction message for under-13 attempts
  - _Requirements: 1.1, 1.2_

- [x] 3.4 Create PIN setup flow for new minor accounts
  - Create PinSetupModal component for first-time PIN creation
  - Show modal after successful minor account registration
  - Implement double-entry PIN confirmation
  - Display error for mismatched PINs
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 4. Parental controls API endpoints
- [x] 4.1 Create POST /api/parental-controls/setup-pin endpoint
  - Accept userId, pin, and confirmPin
  - Validate PIN format (4 digits)
  - Check for PIN mismatch
  - Hash and store PIN in database
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 4.2 Create POST /api/parental-controls/verify-pin endpoint
  - Accept userId and pin
  - Check for account lockout
  - Verify PIN against stored hash
  - Track failed attempts and implement lockout
  - Return attempts remaining or lockout time
  - _Requirements: 3.4, 3.5_

- [x] 4.3 Create GET /api/parental-controls/settings endpoint
  - Require PIN authentication via query parameter or header
  - Return current parental control settings
  - _Requirements: 2.3_

- [x] 4.4 Create PUT /api/parental-controls/settings endpoint
  - Require PIN authentication
  - Accept partial settings updates
  - Validate and save settings
  - Return updated settings
  - _Requirements: 2.4_

- [x] 4.5 Create POST /api/parental-controls/reset-pin endpoint
  - Accept guardian email
  - Generate secure reset token
  - Send reset link via email
  - Temporarily lock parental control modifications
  - _Requirements: 8.1, 8.5_

- [x] 4.6 Create POST /api/parental-controls/complete-reset endpoint
  - Accept reset token and new PIN
  - Validate token (not expired, not used)
  - Update PIN and unlock modifications
  - Send confirmation email
  - _Requirements: 8.2, 8.3, 8.4_

- [ ]* 4.7 Write property tests for PIN reset flow
  - **Property 25: PIN Reset Email Delivery**
  - **Property 26: PIN Reset Link Expiration**
  - **Property 27: PIN Creation Confirmation**
  - **Property 28: Reset Locks Modifications**
  - **Validates: Requirements 8.1, 8.3, 8.4, 8.5**

- [x] 5. Settings page UI implementation
- [x] 5.1 Add parental controls section to SettingsPage
  - Add conditional rendering for users under 18
  - Display lock icon indicator when parental controls are active
  - Add "Parental Controls" button in settings menu
  - _Requirements: 2.1, 9.3_

- [ ]* 5.2 Write property test for UI indicators
  - **Property 29: Minor Account Indicator Display**
  - **Property 30: Settings Lock Icon Display**
  - **Validates: Requirements 9.2, 9.3**

- [x] 5.3 Create PinVerificationModal component
  - Create modal for PIN entry before accessing settings
  - Display 4-digit PIN input with masking
  - Show error messages for incorrect PIN
  - Display lockout message with countdown timer
  - Show "Forgot PIN?" link
  - _Requirements: 2.2, 3.4, 3.5_

- [x] 5.4 Create ParentalControlsSettings component
  - Create settings panel with toggle switches
  - Add messaging restrictions toggle
  - Add event creation restrictions toggle
  - Add content filtering toggle
  - Add guardian notifications toggle
  - Display current guardian email
  - Save changes immediately on toggle
  - _Requirements: 2.3, 2.4_

- [ ] 5.5 Create PinResetFlow component
  - Create UI for forgot PIN flow
  - Email input for guardian email
  - Success message after email sent
  - Link handler for reset email
  - New PIN entry form
  - Confirmation message
  - _Requirements: 8.1, 8.2, 8.4_

- [x] 6. Content filtering implementation
- [x] 6.1 Update event fetching to apply content filters
  - Modify getAllEvents in lib/auth.ts to accept userId and check age/settings
  - Filter out mature content for minors with filtering enabled
  - Apply filtering based on parental control settings
  - _Requirements: 6.1_

- [ ]* 6.2 Write property tests for content filtering
  - **Property 16: Mature Content Filtering**
  - **Property 17: Inappropriate Media Blurring**
  - **Property 18: Filtered Content Message Display**
  - **Property 19: Feed Updates on Filter Changes**
  - **Property 20: Automatic Filtering on Reports**
  - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

- [ ] 6.3 Add content filtering UI indicators
  - Add blur effect to filtered media in EventCard component
  - Display "Content Restricted" message for filtered events
  - Add "Why am I seeing this?" info tooltip
  - _Requirements: 6.2, 6.3_

- [ ] 6.4 Integrate with content moderation system
  - Update reports table to flag content as mature when threshold reached
  - Automatically set isMature flag on events with multiple reports
  - Apply filtering regardless of individual settings for flagged content
  - _Requirements: 6.5_

- [x] 7. Messaging restrictions implementation
- [x] 7.1 Update messaging API to enforce restrictions
  - Modify message sending endpoint to check parental controls
  - Check if sender is minor with messaging restrictions
  - Verify recipient is followed if restrictions enabled
  - Return appropriate error for restricted messaging
  - _Requirements: 4.1, 4.3_

- [x] 7.2 Update message receiving logic
  - Filter incoming messages based on follow status for restricted minors
  - Only allow messages from followed users when restricted
  - _Requirements: 4.2_

- [x] 7.3 Add messaging restriction UI feedback
  - Display restriction message in messaging interface
  - Show "Messaging Restricted" badge for minor accounts
  - Add info tooltip explaining restrictions
  - _Requirements: 4.3_

- [ ]* 7.4 Write property tests for messaging restrictions
  - **Property 9: Messaging Restriction Enforcement**
  - **Property 10: Message Receipt Filtering**
  - **Property 11: Messaging Restriction Toggle**
  - **Property 12: Block Overrides Restrictions**
  - **Validates: Requirements 4.1, 4.2, 4.4, 4.5**

- [x] 8. Event creation restrictions implementation
- [x] 8.1 Update event creation API to enforce restrictions
  - Modify createEvent in lib/auth.ts to check parental controls
  - Check if creator is minor with event creation restrictions
  - Block public event creation if restricted
  - Allow private event creation
  - Return appropriate error for restricted creation
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 8.2 Update CreateEventPage with restriction handling
  - Disable public event option for restricted minors
  - Display restriction message when public option is disabled
  - Add info tooltip explaining restrictions
  - _Requirements: 5.3_

- [ ]* 8.3 Write property tests for event creation restrictions
  - **Property 13: Public Event Creation Restriction**
  - **Property 14: Private Event Creation Allowed**
  - **Property 15: Event Creation Restriction Toggle**
  - **Validates: Requirements 5.1, 5.2, 5.5**

- [ ] 9. Guardian notification system
- [ ] 9.1 Create email notification templates
  - Create template for new contact message notification
  - Create template for public event join notification
  - Create template for content report notification
  - Create template for weekly activity summary
  - Create template for critical safety alerts
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 9.2 Implement notification trigger functions
  - Create sendNewContactNotification function
  - Create sendEventJoinNotification function
  - Create sendContentReportNotification function
  - Check notification settings before sending
  - Always send critical safety notifications
  - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [ ] 9.3 Integrate notifications with existing actions
  - Add notification trigger to message sending
  - Add notification trigger to event joining
  - Add notification trigger to content reporting
  - _Requirements: 7.1, 7.2, 7.3_

- [ ]* 9.4 Write property tests for notifications
  - **Property 21: New Contact Notification**
  - **Property 22: Public Event Join Notification**
  - **Property 23: Content Report Notification**
  - **Property 24: Notification Filtering**
  - **Validates: Requirements 7.1, 7.2, 7.3, 7.5**

- [ ] 10. Age transition handling
- [ ] 10.1 Create age transition check function
  - Implement checkAndHandleAgeTransition function
  - Calculate current age from date of birth
  - Detect transition from minor to adult
  - Disable parental controls automatically
  - Send notification to user
  - _Requirements: 2.5_

- [ ] 10.2 Add age transition check to login flow
  - Call checkAndHandleAgeTransition on user login
  - Update user's ageCategory if changed
  - _Requirements: 2.5_

- [ ]* 10.3 Write property test for age transition
  - **Property 7: Automatic Restriction Removal at 18**
  - **Validates: Requirements 2.5**

- [ ] 11. Date of birth modification protection
- [ ] 11.1 Create date of birth update endpoint
  - Create PUT /api/user/date-of-birth endpoint
  - Require additional verification (email confirmation or PIN)
  - Send verification email with confirmation link
  - Only update after confirmation
  - _Requirements: 1.5_

- [ ]* 11.2 Write property test for DOB modification
  - **Property 4: Date of Birth Modification Requires Verification**
  - **Validates: Requirements 1.5**

- [x] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. App Store compliance documentation
- [x] 13.1 Create reviewer guide document
  - Document step-by-step path to access parental controls
  - Include screenshots of key features
  - Explain age verification process
  - List all restriction types and how to test them
  - _Requirements: 9.1, 9.4_

- [x] 13.2 Add in-app help documentation
  - Create help section explaining parental controls
  - Add FAQ for common questions
  - Include contact information for support
  - _Requirements: 9.1_

- [ ] 14. Final integration and testing
- [ ] 14.1 End-to-end testing of complete flows
  - Test complete registration flow for all age categories
  - Test PIN setup, verification, and reset flows
  - Test all restriction types with minor accounts
  - Test age transition from minor to adult
  - Test guardian notification delivery
  - _Requirements: All requirements_

- [ ]* 14.2 Write integration tests
  - Test registration with various ages
  - Test settings access with correct/incorrect PINs
  - Test restriction enforcement across features
  - Test notification triggers

- [ ] 15. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
