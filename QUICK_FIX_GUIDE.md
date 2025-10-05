# Quick Fix Guide for 500 Errors

## Problem
The application is getting 500 errors because the code is trying to use the `visualStylingUrl` column that doesn't exist in the database yet.

## Immediate Fixes Applied

### 1. Made Code Backward Compatible
- Updated `app/api/events/route.ts` to only use `visualStylingUrl` if it exists
- Updated `lib/auth.ts` to handle missing column gracefully
- Updated components to fall back to inline visual styling if R2 fetch fails

### 2. Commented Out Problematic Queries
- Temporarily commented out `visualStylingUrl` selections in database queries
- This prevents SQL errors while maintaining functionality

### 3. Added Error Handling
- Enhanced error handling in visual styling utilities
- Added fallback parsing for inline visual styling data

## To Complete the Fix

### Option 1: Manual Database Migration (Recommended)
1. Open your database console (Neon, pgAdmin, etc.)
2. Run the SQL from `manual-migration.sql`:
   ```sql
   ALTER TABLE events ADD COLUMN IF NOT EXISTS visual_styling_url text;
   ```

### Option 2: Use Debug Endpoint
1. Start your development server: `npm run dev`
2. Visit: `http://localhost:3000/api/debug-schema`
3. Check if the column exists
4. If not, visit: `http://localhost:3000/api/migrate-visual-styling` (POST request)

### Option 3: Use Drizzle Migration
1. Run: `npx drizzle-kit push`
2. This should sync the schema changes

## After Migration

Once the `visual_styling_url` column is added:

1. Uncomment the lines in `lib/auth.ts`:
   ```typescript
   // Change this:
   // visualStylingUrl: events.visualStylingUrl, // Commented out for backward compatibility
   
   // To this:
   visualStylingUrl: events.visualStylingUrl,
   ```

2. The R2 storage system will automatically start working for large visual styling data

## Current Status

✅ **Fixed**: 500 errors should be resolved
✅ **Fixed**: Events can be created without R2 storage
✅ **Fixed**: Existing events continue to work
⏳ **Pending**: Database migration for full R2 functionality

## Testing

1. Try creating an event - should work without errors
2. Check `/api/debug-schema` to see current database state
3. After migration, test large visual styling data uploads

The application should now work without 500 errors, even without the database migration. The R2 storage features will be fully enabled once the migration is complete.