# R2 Storage Solution for Event URLs

## Problem
The application was experiencing 413: FUNCTION_PAYLOAD_TOO_LARGE errors when creating events with large visual styling data or media content. This happened because all event data was being sent directly to Vercel serverless functions, which have payload size limits.

## Solution
Implemented Cloudflare R2 storage to handle large event data, moving it off the serverless function payload and into cloud storage.

## Implementation

### 1. Database Schema Updates
- Added `visualStylingUrl` field to the events table to store R2 URLs for large visual styling data
- Updated `lib/db/schema.ts` to include the new field
- Created migration script to add the column

### 2. New API Endpoints

#### `/api/upload-event-data`
- Handles uploading large event data (visual styling, metadata) to R2
- Accepts JSON data and stores it as files in R2
- Returns R2 URLs for the stored data
- Size limit: 10MB for JSON data

#### `/api/migrate-visual-styling`
- Database migration endpoint to add the new column
- Can be called via POST request to run the migration

### 3. Utility Libraries

#### `lib/event-upload-utils.ts`
- `prepareEventData()`: Automatically detects large visual styling data and uploads to R2
- `uploadEventDataToR2()`: Uploads data to R2 and returns URL
- `shouldUseR2Storage()`: Determines if data should be stored in R2 (>50KB threshold)

#### `lib/visual-styling-utils.ts`
- `getVisualStylingAsync()`: Fetches visual styling from R2 URL or parses inline data
- `fetchVisualStylingFromR2()`: Retrieves JSON data from R2 URLs

### 4. Component Updates

#### `components/CreateEventPage.tsx`
- Updated to use `prepareEventData()` before sending to events API
- Automatically handles large visual styling data by uploading to R2 first

#### `components/EventCard.tsx`
- Updated to load visual styling from R2 URLs when available
- Falls back to inline data for smaller styling objects

#### `components/EventPreviewModal.tsx`
- Similar updates to handle R2-stored visual styling data

### 5. Backend Updates

#### `app/api/events/route.ts`
- Enhanced to handle `visualStylingUrl` field
- Automatically uploads large visual styling data to R2 (>50KB)
- Rejects base64 data URLs to prevent large payloads

#### `lib/auth.ts`
- Updated `createEvent()` function to support `visualStylingUrl`
- Updated event queries to include the new field

## Usage Flow

### For Event Creation:
1. User creates event with large visual styling data
2. `prepareEventData()` detects large data (>50KB)
3. Large data is uploaded to R2 via `/api/upload-event-data`
4. Event is created with R2 URL instead of inline data
5. Payload to `/api/events` remains small

### For Event Display:
1. Event data is fetched from database
2. If `visualStylingUrl` exists, data is fetched from R2
3. If no R2 URL, falls back to inline `visualStyling` data
4. Visual styling is applied to the event display

## Benefits

1. **Eliminates 413 Errors**: Large data is stored in R2, not sent in API payloads
2. **Better Performance**: Smaller API payloads mean faster responses
3. **Scalable**: R2 can handle much larger files than serverless function payloads
4. **Backward Compatible**: Existing events with inline data continue to work
5. **Automatic**: The system automatically decides when to use R2 storage

## Configuration

The system uses existing R2 configuration from `.env`:
```
R2_ENDPOINT=https://...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=mirro
R2_PUBLIC_URL=https://pub-...
```

## Testing

Use `test-r2-event-storage.html` to test:
1. Database migration
2. Large data upload to R2
3. Event creation with R2 storage
4. Fetching data from R2 URLs

## File Structure

```
lib/
├── event-upload-utils.ts     # Client-side upload utilities
├── visual-styling-utils.ts   # R2 data fetching utilities
└── storage.ts               # Existing R2 upload functions

app/api/
├── upload-event-data/       # New endpoint for event data uploads
├── migrate-visual-styling/  # Migration endpoint
└── events/                  # Updated events API

components/
├── CreateEventPage.tsx      # Updated for R2 storage
├── EventCard.tsx           # Updated to load from R2
└── EventPreviewModal.tsx   # Updated to load from R2

scripts/
├── add-visual-styling-url.ts # Migration script
└── add-visual-styling-url.js # Alternative migration script

test-r2-event-storage.html   # Testing interface
```

## Migration Steps

1. Run the database migration to add the new column
2. Deploy the updated code
3. Test with the provided HTML test page
4. Monitor for any 413 errors (should be eliminated)

The solution is backward compatible and will automatically start using R2 storage for new events with large data while maintaining support for existing events.