import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

// Configure for file uploads
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for large uploads
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
    const allowedTypes = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
    };

    const isValidType = type === 'image'
      ? allowedTypes.image.includes(file.type)
      : allowedTypes.video.includes(file.type);

    if (!isValidType) {
      return NextResponse.json({
        error: `Invalid file type. Expected ${type} file.`
      }, { status: 400 });
    }

    // Check file size (50MB limit for Vercel Blob)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({
        error: 'File too large. Maximum size is 50MB.'
      }, { status: 413 });
    }

    // Upload to Vercel Blob Storage
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    // Return the blob URL
    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: file.name,
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