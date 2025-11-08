# Large Video Upload Fix

## Problem
Videos longer than 10 minutes were failing with a 413 "Request Entity Too Large" error because Vercel has a **4.5MB payload limit** for serverless functions (100MB on Pro plan).

## Solution
Implemented **direct client-to-R2 uploads** using presigned URLs to bypass Vercel's serverless function limits.

### How It Works

1. **Small files (< 4MB)**: Upload through the server as before
2. **Large files (≥ 4MB)**: 
   - Client requests a presigned URL from `/api/upload/presigned`
   - Client uploads directly to R2 using the presigned URL
   - No data passes through Vercel's serverless functions

### New Endpoints

- **`/api/upload/presigned`** - Generates presigned URLs for direct R2 uploads
- **`/api/upload/chunked`** - For future multipart upload support (not currently used)

### Files Modified

- `app/api/upload/route.ts` - Updated to handle small files only
- `app/api/upload/presigned/route.ts` - New endpoint for presigned URLs
- `app/api/upload/chunked/route.ts` - New endpoint for chunked uploads
- `lib/storage.ts` - Added presigned URL generation function
- `components/UnifiedCamera.tsx` - Updated to use presigned URLs for large videos

### Benefits

- ✅ No file size limits (up to 1000MB)
- ✅ Faster uploads (direct to R2, no proxy)
- ✅ No Vercel bandwidth costs for large files
- ✅ Automatic fallback to data URLs if upload fails

### Testing

Record a video longer than 10 minutes and verify:
1. Upload completes successfully
2. Video URL is returned and works
3. No 413 errors in console
