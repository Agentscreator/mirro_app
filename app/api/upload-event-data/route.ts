import { NextRequest, NextResponse } from 'next/server';
import { uploadToBlob, generateFileName } from '@/lib/storage';

export const runtime = 'nodejs';
export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { data, type } = await request.json();

    if (!data || !type) {
      return NextResponse.json({ error: 'Missing data or type' }, { status: 400 });
    }

    // Validate type
    const allowedTypes = ['visual-styling', 'event-metadata'];
    if (!allowedTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid data type' }, { status: 400 });
    }

    // Check data size (limit to 10MB for JSON data)
    const dataString = JSON.stringify(data);
    const dataSize = Buffer.byteLength(dataString, 'utf8');
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (dataSize > maxSize) {
      return NextResponse.json({
        error: 'Data too large. Maximum size is 10MB.'
      }, { status: 413 });
    }

    // Generate filename based on type
    const fileName = generateFileName(`event-${type}`, 'json');
    
    // Convert data to buffer
    const buffer = Buffer.from(dataString, 'utf-8');

    // Upload to Vercel Blob
    const url = await uploadToBlob(buffer, fileName, 'application/json');

    return NextResponse.json({
      success: true,
      url,
      filename: fileName,
      size: dataSize,
      type: 'application/json'
    });

  } catch (error) {
    console.error('Event data upload error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('PayloadTooLargeError')) {
        return NextResponse.json({ 
          error: 'Data too large. Please reduce data size and try again' 
        }, { status: 413 });
      }
    }

    return NextResponse.json({ 
      error: 'Upload failed. Please try again.' 
    }, { status: 500 });
  }
}