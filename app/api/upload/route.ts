import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2, generateFileName } from '@/lib/storage';

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
      return NextResponse.json({ error: 'File too large. Maximum size is 50MB.' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate filename based on type and actual file type
    let extension = 'webm';
    if (type === 'video') {
      // For videos, always use webm since that's what we record
      extension = 'webm';
    } else if (type === 'image') {
      // For images, determine from file type
      if (file.type.includes('jpeg') || file.type.includes('jpg')) {
        extension = 'jpg';
      } else if (file.type.includes('png')) {
        extension = 'png';
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
      fileName: fileName
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}