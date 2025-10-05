import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (
        pathname: string,
        /* clientPayload?: string, */
      ) => {
        // Generate a client token for the browser to upload the file
        // ⚠️ Authenticate users before generating the token.
        // Otherwise, you're allowing anonymous uploads.

        // TODO: Add authentication check here
        // const { user } = await auth(request);
        // if (!user) {
        //   throw new Error('Not authorized');
        // }

        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'video/mp4',
            'video/webm',
            'video/quicktime',
          ],
          tokenPayload: JSON.stringify({
            // optional, sent to your server on upload completion
            // userId: user.id,
            uploadedAt: new Date().toISOString(),
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Get notified of client upload completion
        // ⚠️ This will not work on `localhost` websites,
        // Use ngrok or similar to get the full upload flow

        console.log('blob upload completed', blob, tokenPayload);

        try {
          // Run any logic after the file upload completed
          // const { userId } = JSON.parse(tokenPayload);
          // await db.update({ mediaUrl: blob.url, userId });
        } catch (error) {
          throw new Error('Could not process upload completion');
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }, // The webhook will retry 5 times waiting for a 200
    );
  }
}
