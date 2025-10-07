import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2 } from '@/lib/storage';

// Configure for file uploads
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for large uploads
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const baseFileType = file.type.split(';')[0].trim();

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ];

    if (!allowedTypes.includes(baseFileType)) {
      return NextResponse.json({
        error: `Invalid file type. Got: ${baseFileType}`
      }, { status: 400 });
    }

    // Check file size (1000MB limit for R2)
    const maxSize = 1000 * 1024 * 1024; // 1000MB
    if (file.size > maxSize) {
      return NextResponse.json({
        error: 'File too large. Maximum size is 1000MB.'
      }, { status: 413 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const uniqueFilename = `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;

    // Convert file to buffer and upload to R2
    const buffer = Buffer.from(await file.arrayBuffer());
    const publicUrl = await uploadToR2(buffer, uniqueFilename, file.type);

    // Return the public URL
    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: uniqueFilename,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Upload error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('PayloadTooLargeError')) {
        return NextResponse.json({
          error: 'File too large. Please reduce file size and try again'
        }, { status: 413 });
      }
    }

    return NextResponse.json({
      error: 'Upload failed. Please try again.'
    }, { status: 500 });
  }
}
