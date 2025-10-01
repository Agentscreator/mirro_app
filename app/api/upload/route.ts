import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2, generateFileName } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate filename based on type
    const extension = type === 'video' ? 'webm' : 'jpg';
    const prefix = type === 'video' ? 'video' : 'image';
    const fileName = generateFileName(prefix, extension);

    // Upload to R2
    const publicUrl = await uploadToR2(buffer, fileName, file.type);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}