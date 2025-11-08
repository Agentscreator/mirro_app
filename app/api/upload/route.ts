import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2, getPresignedUploadUrl } from '@/lib/storage';

// Configure for file uploads
export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const baseFileType = file.type.split(';')[0].trim();
    const allowedTypes = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/avi']
    };

    const isValidType = type === 'image'
      ? allowedTypes.image.includes(baseFileType)
      : allowedTypes.video.includes(baseFileType);

    if (!isValidType) {
      return NextResponse.json({
        error: `Invalid file type. Expected ${type} file. Got: ${baseFileType}`
      }, { status: 400 });
    }

    // Check file size
    const maxSize = 1000 * 1024 * 1024; // 1000MB
    if (file.size > maxSize) {
      return NextResponse.json({
        error: 'File too large. Maximum size is 1000MB.'
      }, { status: 413 });
    }

    // For files under 100MB (Vercel Pro limit), upload directly through server
    const directUploadLimit = 100 * 1024 * 1024; // 100MB
    
    if (file.size < directUploadLimit) {
      // Direct upload for small files
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const uniqueFilename = `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;
      
      const buffer = Buffer.from(await file.arrayBuffer());
      const publicUrl = await uploadToR2(buffer, uniqueFilename, file.type);

      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename: uniqueFilename,
        size: file.size,
        type: file.type
      });
    } else {
      // For large files, return error suggesting client-side upload
      return NextResponse.json({
        error: 'File too large for direct upload. Use chunked upload endpoint.',
        useChunkedUpload: true
      }, { status: 413 });
    }

  } catch (error) {
    console.error('Upload error:', error);

    if (error instanceof Error) {
      if (error.message.includes('PayloadTooLargeError') || error.message.includes('FUNCTION_PAYLOAD_TOO_LARGE')) {
        return NextResponse.json({
          error: 'File too large. Use chunked upload for large videos.',
          useChunkedUpload: true
        }, { status: 413 });
      }
    }

    return NextResponse.json({
      error: 'Upload failed. Please try again.'
    }, { status: 500 });
  }
}