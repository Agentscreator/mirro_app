import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2, generateFileName } from '@/lib/storage';

// Configure route for larger file uploads
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout for uploads

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    console.log('Upload request received:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      type: type
    });

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      console.error('File too large:', file.size, 'bytes (max:', maxSize, 'bytes)');
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 50MB.',
        fileSize: file.size,
        maxSize: maxSize
      }, { status: 413 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate filename based on type and actual file type
    let extension = 'webm';
    if (type === 'video') {
      // Handle different video formats from different devices
      if (file.type.includes('mp4')) {
        extension = 'mp4';
      } else if (file.type.includes('webm')) {
        extension = 'webm';
      } else if (file.type.includes('quicktime') || file.type.includes('mov')) {
        extension = 'mov';
      } else {
        extension = 'webm'; // default
      }
    } else if (type === 'image') {
      // For images, determine from file type
      if (file.type.includes('jpeg') || file.type.includes('jpg')) {
        extension = 'jpg';
      } else if (file.type.includes('png')) {
        extension = 'png';
      } else if (file.type.includes('heic') || file.type.includes('heif')) {
        extension = 'heic'; // iOS format
      } else {
        extension = 'jpg'; // default
      }
    }

    const prefix = type === 'video' ? 'video' : 'image';
    const fileName = generateFileName(prefix, extension);

    console.log('Uploading to R2:', {
      fileName,
      bufferSize: buffer.length,
      contentType: file.type || `${type}/${extension}`
    });

    // Upload to R2
    const publicUrl = await uploadToR2(buffer, fileName, file.type || `${type}/${extension}`);

    console.log('Upload successful:', publicUrl);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
      fileSize: buffer.length,
      contentType: file.type || `${type}/${extension}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Upload failed';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('NetworkingError') || error.message.includes('timeout')) {
        errorMessage = 'Network error during upload. Please check your connection and try again.';
        statusCode = 503;
      } else if (error.message.includes('AccessDenied')) {
        errorMessage = 'Storage access denied. Please contact support.';
        statusCode = 403;
      } else if (error.message.includes('NoSuchBucket')) {
        errorMessage = 'Storage configuration error. Please contact support.';
        statusCode = 500;
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json({
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: statusCode });
  }
}