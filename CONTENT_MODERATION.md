# Content Moderation System - Apple App Store Review Documentation

## Overview

This document describes the comprehensive content moderation system implemented to comply with Apple App Store Review Guideline 1.2.0 for user-generated content safety.

## User-Generated Content Areas

Our application allows users to create and share:

1. **Events** - Title, description, location, media (images/videos)
2. **User Profiles** - Names, usernames, profile pictures
3. **Social Interactions** - Following relationships, event attendance

## Content Moderation Features

### 1. Report Offensive Content

Users can report inappropriate content through multiple touchpoints:

#### Reporting Events
- **Location**: Event cards in the main feed
- **Access**: Tap the report flag icon on any event card
- **Process**:
  - User selects a report reason from predefined categories
  - Categories include: Spam, Harassment, Inappropriate Content, Hate Speech, Violence, Other
  - Users can optionally provide additional context
  - Reports are stored in database for review

#### Reporting Users
- **Location**: User cards (followers/following lists, search results)
- **Access**: Tap the three-dot menu → "Report User"
- **Process**: Same as event reporting with appropriate categories

**Implementation**:
- UI Component: `components/ReportDialog.tsx`
- API Endpoint: `app/api/moderation/report/route.ts`
- Database Schema: `reports` table in `lib/db/schema.ts`

### 2. Block Abusive Users

Users can block other users to prevent unwanted interactions:

#### Blocking Functionality
- **Location**: User cards - three-dot menu
- **Access**: Tap three-dot menu → "Block User"
- **Effects of Blocking**:
  - Blocked user's events are hidden from blocker's feed
  - Blocked user cannot interact with blocker
  - All follow relationships are automatically removed
  - Blocking is reversible via "Unblock User" option

**Implementation**:
- UI Components: `components/UserCard.tsx`
- API Endpoint: `app/api/moderation/block/route.ts`
- Database Schema: `blocked_users` table in `lib/db/schema.ts`
- Helper Functions: `lib/moderation.ts`

### 3. Content Filtering

The application automatically filters blocked users' content:

#### Feed Filtering
- Events created by blocked users are excluded from the main feed
- Function `getAllEvents()` in `lib/auth.ts` accepts `currentUserId` parameter
- Queries blocked user list and filters events accordingly
- Ensures users never see content from blocked accounts

#### Database Implementation
- Blocked users table with composite primary key (blockerId, blockedId)
- Cascade deletion when users are deleted
- Efficient querying with proper indexes

**Implementation**:
- Content Filtering: `lib/auth.ts:115` - `getAllEvents()` function
- Database Schema: `lib/db/schema.ts:89-95`

## Technical Architecture

### Database Schema

```sql
-- Reports Table
CREATE TABLE reports (
  id UUID PRIMARY KEY,
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reported_event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP
);

-- Blocked Users Table
CREATE TABLE blocked_users (
  blocker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id)
);
```

### API Endpoints

#### POST /api/moderation/report
Submit a report for offensive content or users
- Required: `reporterId`, `reason`
- Optional: `reportedUserId` OR `reportedEventId` (one required), `description`
- Returns: Report confirmation

#### POST /api/moderation/block
Block a user
- Required: `blockerId`, `blockedId`
- Returns: Block confirmation
- Side effects: Removes follow relationships

#### DELETE /api/moderation/block
Unblock a user
- Required: `blockerId`, `blockedId`
- Returns: Unblock confirmation

#### GET /api/moderation/block?blockerId={id}
Get list of blocked users
- Required: `blockerId` query parameter
- Returns: Array of blocked user IDs

#### GET /api/moderation/report?reporterId={id}&status={status}
Get reports (for moderation dashboard)
- Optional: `reporterId`, `status`
- Returns: Array of reports

## Report Categories

1. **Spam** - Unsolicited or repetitive content
2. **Harassment or Bullying** - Targeted abuse or intimidation
3. **Inappropriate Content** - Content not suitable for the platform
4. **Hate Speech** - Discriminatory or hateful language
5. **Violence or Threats** - Violent content or threatening behavior
6. **Other** - Other policy violations

## User Flow Examples

### Reporting an Event
1. User sees an inappropriate event in their feed
2. User taps the red flag icon on the event card
3. Dialog opens with report reason options
4. User selects reason (e.g., "Inappropriate Content")
5. User optionally adds description
6. User submits report
7. Success message confirms submission
8. Report is logged for moderation team review

### Blocking a User
1. User encounters abusive user in followers list
2. User taps three-dot menu next to user's name
3. User selects "Block User" from dropdown
4. User is blocked immediately
5. Follow relationships are removed
6. Blocked user's content disappears from feed
7. Success toast notification appears

## Moderation Enforcement

### Report Review Process
- All reports are stored with status "pending"
- Reports include: reporter, reported content/user, reason, description, timestamp
- Moderation team can query reports by status
- After review, status updates to "reviewed", "resolved", or "dismissed"

### Content Removal
While not automated to prevent false positives, the system provides:
- Event deletion API: `DELETE /api/events` (owner-only)
- Complete audit trail of all reports
- User blocking as immediate user-side protection

## Privacy & Data Handling

- Reports are stored securely with proper access controls
- Personal data handling complies with privacy standards
- Users can unblock at any time
- No personally identifying information shared in reports beyond necessary context

## Testing for App Review

To demonstrate these features during Apple's review:

1. **Report Feature**:
   - Create a test event
   - Click the flag icon
   - Submit a report with reason "Spam"
   - Verify success message

2. **Block Feature**:
   - Navigate to any user's profile or user card
   - Click three-dot menu
   - Select "Block User"
   - Verify user is blocked and content filtered

3. **Content Filtering**:
   - Block a user who has created events
   - Return to main feed
   - Verify blocked user's events no longer appear

## Files Modified/Created

### New Files
- `app/api/moderation/report/route.ts` - Report submission endpoint
- `app/api/moderation/block/route.ts` - Block/unblock endpoints
- `components/ReportDialog.tsx` - Report UI component
- `lib/moderation.ts` - Helper functions
- `CONTENT_MODERATION.md` - This documentation

### Modified Files
- `lib/db/schema.ts` - Added reports and blocked_users tables
- `components/EventCard.tsx` - Added report button
- `components/UserCard.tsx` - Added block/report menu
- `lib/auth.ts` - Added content filtering to getAllEvents()

## Compliance Statement

This application fully complies with Apple App Store Review Guideline 1.2.0 by providing:

✅ **Method to report offensive content** - Report dialog on events and users
✅ **Method to block abusive users** - Block functionality in user menus
✅ **Ability to filter objectionable material** - Automatic filtering of blocked users' content
✅ **Published policies** - Clear categories and user-facing descriptions
✅ **Enforcement mechanisms** - Report storage, blocking system, content filtering

All features are production-ready and accessible to users from first launch.
