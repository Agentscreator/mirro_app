import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Configure for file uploads
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for large uploads
export const dynamic = 'force-dynamic';

// Initialize Cloudflare R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type (handle MIME types with codecs like video/webm;codecs=vp9)
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

    // Check file size (100MB limit for R2)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json({
        error: 'File too large. Maximum size is 100MB.'
      }, { status: 413 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const uniqueFilename = `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudflare R2
    await r2Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: uniqueFilename,
        Body: buffer,
        ContentType: file.type,
      })
    );

    // Construct the public URL using R2_PUBLIC_URL
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${uniqueFilename}`;

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