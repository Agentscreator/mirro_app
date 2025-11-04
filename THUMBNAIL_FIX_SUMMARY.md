# Thumbnail Disappearing Issue - Fix Summary

## Problem
Event thumbnails were disappearing after page reload because they were stored as temporary DALL-E URLs that expire after 2 hours.

### Root Cause
When generating AI thumbnails using DALL-E, the API returns a temporary Azure Blob Storage URL with a SAS token that expires. These temporary URLs were being stored directly in the database as `thumbnailUrl`, causing them to break after expiration.

**Error Example:**
```
AuthenticationFailed: Signature not valid in the specified time frame
Start: Mon, 03 Nov 2025 20:00:14 GMT
Expiry: Mon, 03 Nov 2025 22:00:14 GMT  
Current: Tue, 04 Nov 2025 11:40:19 GMT
```

## Solution Implemented

### 1. Modified Image Generation API (`app/api/generate-event-image/route.ts`)
- Now downloads the generated image from DALL-E's temporary URL
- Uploads the image to R2 (Cloudflare) permanent storage
- Returns the permanent R2 URL instead of the temporary DALL-E URL
- Increased timeout to 30 seconds to accommodate download + upload

### 2. Added Graceful Fallback (`components/EventCard.tsx`)
- Added `onError` handler to thumbnail images
- If thumbnail fails to load (expired URL), it falls back to the gradient background
- Prevents broken image icons from showing

### 3. Fixed Data Fetching (`lib/auth.ts`)
- Updated `getUserParticipatingEvents` to include all media fields:
  - `thumbnailUrl`
  - `backgroundUrl`
  - `visualStyling`
  - `visualStylingUrl`
  - `mediaGallery`
- Added attendee data fetching for joined events
- Ensured consistency between created and joined events data

### 4. Created Regeneration Endpoint
- New API: `/api/events/[eventId]/regenerate-thumbnail`
- Allows regenerating thumbnails for existing events with expired URLs
- Can be called from EditEventModal

## For Existing Events

Events created before this fix will have expired thumbnail URLs. To fix them:

### Option 1: Edit the Event
1. Open the event in edit mode
2. Click "Regenerate Thumbnail" button
3. Save the event

### Option 2: Automatic Fallback
- Events with expired thumbnails will automatically fall back to their gradient background
- No action needed, but thumbnails won't show

### Option 3: Bulk Regeneration (Future)
Create a migration script to regenerate all thumbnails at once.

## Technical Details

### Before
```
DALL-E API → Temporary URL (expires in 2 hours) → Database
```

### After
```
DALL-E API → Temporary URL → Download → Upload to R2 → Permanent URL → Database
```

## Files Modified
1. `app/api/generate-event-image/route.ts` - Download and upload to R2
2. `components/EventCard.tsx` - Graceful error handling
3. `lib/auth.ts` - Complete data fetching
4. `app/api/events/[eventId]/regenerate-thumbnail/route.ts` - New endpoint

## Testing
1. Create a new event with AI-generated thumbnail
2. Reload the page multiple times
3. Thumbnail should persist across reloads
4. For old events, thumbnails will gracefully fall back to gradients
