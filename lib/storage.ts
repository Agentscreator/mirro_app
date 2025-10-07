import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToR2(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  console.log('R2 Upload attempt:', {
    fileName,
    contentType,
    fileSize: file.length
  });

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: fileName,
      Body: file,
      ContentType: contentType,
    });

    await s3Client.send(command);
    
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
    console.log('R2 Upload successful:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('R2 Upload failed:', error);
    throw error;
  }
}

// Keep the old function name for backward compatibility
export const uploadToBlob = uploadToR2;

export function generateFileName(prefix: string, extension: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}-${timestamp}-${random}.${extension}`;
}