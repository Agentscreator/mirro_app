import { NextRequest, NextResponse } from 'next/server';
import { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } from '@aws-sdk/client-s3';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// Initialize multipart upload
export async function POST(request: NextRequest) {
  try {
    const { action, filename, contentType, uploadId, partNumber, parts } = await request.json();

    if (action === 'start') {
      // Start multipart upload
      const timestamp = Date.now();
      const extension = filename.split('.').pop();
      const uniqueFilename = `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;

      const command = new CreateMultipartUploadCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: uniqueFilename,
        ContentType: contentType,
      });

      const response = await s3Client.send(command);

      return NextResponse.json({
        success: true,
        uploadId: response.UploadId,
        filename: uniqueFilename,
        publicUrl: `${process.env.R2_PUBLIC_URL}/${uniqueFilename}`,
      });
    }

    if (action === 'complete') {
      // Complete multipart upload
      const command = new CompleteMultipartUploadCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: filename,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts },
      });

      await s3Client.send(command);

      return NextResponse.json({
        success: true,
        publicUrl: `${process.env.R2_PUBLIC_URL}/${filename}`,
      });
    }

    if (action === 'abort') {
      // Abort multipart upload
      const command = new AbortMultipartUploadCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: filename,
        UploadId: uploadId,
      });

      await s3Client.send(command);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Chunked upload error:', error);
    return NextResponse.json(
      { error: 'Chunked upload failed' },
      { status: 500 }
    );
  }
}

// Upload a single part
export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const uploadId = searchParams.get('uploadId');
    const partNumber = searchParams.get('partNumber');
    const filename = searchParams.get('filename');

    if (!uploadId || !partNumber || !filename) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const body = await request.arrayBuffer();
    const buffer = Buffer.from(body);

    const command = new UploadPartCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: filename,
      UploadId: uploadId,
      PartNumber: parseInt(partNumber),
      Body: buffer,
    });

    const response = await s3Client.send(command);

    return NextResponse.json({
      success: true,
      ETag: response.ETag,
      PartNumber: parseInt(partNumber),
    });
  } catch (error) {
    console.error('Part upload error:', error);
    return NextResponse.json(
      { error: 'Part upload failed' },
      { status: 500 }
    );
  }
}
