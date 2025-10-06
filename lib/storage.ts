import { put } from '@vercel/blob';

export async function uploadToBlob(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  console.log('Vercel Blob Upload attempt:', {
    fileName,
    contentType,
    fileSize: file.length
  });

  try {
    const blob = await put(fileName, file, {
      access: 'public',
      contentType,
    });
    
    console.log('Vercel Blob Upload successful:', blob);
    console.log('Public URL:', blob.url);
    return blob.url;
  } catch (error) {
    console.error('Vercel Blob Upload failed:', error);
    throw error;
  }
}

export function generateFileName(prefix: string, extension: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}-${timestamp}-${random}.${extension}`;
}