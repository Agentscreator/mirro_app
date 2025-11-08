import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { uploadToR2, generateFileName } from '@/lib/storage';

// Configure route for faster responses
export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds max to allow for image download and upload

// Lazy initialize OpenAI only when needed
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 18000, // 18 second timeout for OpenAI API calls (DALL-E needs time)
    });
  }
  return openai;
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, location, type = 'thumbnail', visualStyling } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Event title is required' }, { status: 400 });
    }

    // Extract styling context from visualStyling
    let styleContext = '';
    if (visualStyling) {
      const theme = visualStyling.theme || '';
      const colors = visualStyling.styling?.gradient || '';
      const mood = visualStyling.mood || '';

      if (theme) styleContext += `Theme: ${theme}. `;
      if (mood) styleContext += `Mood: ${mood}. `;
      if (colors && typeof colors === 'string') {
        // Extract color names from gradient classes
        const colorMatch = colors.match(/(purple|blue|green|red|yellow|pink|indigo|teal|orange|gray)/gi);
        if (colorMatch) {
          styleContext += `Primary colors: ${colorMatch.join(', ')}. `;
        }
      }
    }

    // Create different prompts based on type
    let prompt: string;
    if (type === 'background') {
      // For modal backgrounds - more atmospheric and immersive, incorporating event styling
      prompt = `Create an immersive, atmospheric background image for an event titled: "${title}". ${description ? `The event is about: ${description}.` : ''} ${location ? `Location: ${location}.` : ''} ${styleContext}Style: Cinematic, wide-angle, ambient, professional, suitable as a full-screen background. No text or words. Focus on mood and atmosphere that matches the event's theme.`;
    } else {
      // For thumbnails - more compact and eye-catching, incorporating event styling
      prompt = `Create a vibrant, professional event thumbnail image for: "${title}". ${description ? `The event is about: ${description}.` : ''} ${location ? `Location: ${location}.` : ''} ${styleContext}Style: Modern, colorful, eye-catching, suitable for social media and event cards. No text or words in the image. Make it visually appealing and match the event's theme.`;
    }

    console.log(`Generating ${type} image with DALL-E 3 for:`, title);

    // Generate image using DALL-E 3
    // DALL-E 3 typically takes 10-15 seconds
    const response = await getOpenAIClient().images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard", // Use standard quality for faster generation
      style: "vivid"
    });

    const tempImageUrl = response.data?.[0]?.url;

    if (!tempImageUrl) {
      throw new Error('No image URL returned from DALL-E 3');
    }

    console.log('Successfully generated image, now uploading to R2:', tempImageUrl);

    // Download the image from DALL-E's temporary URL
    const imageResponse = await fetch(tempImageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to download generated image');
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // Upload to R2 for permanent storage
    const fileName = generateFileName(`event-${type}`, 'png');
    const permanentUrl = await uploadToR2(imageBuffer, fileName, 'image/png');

    console.log('Image uploaded to R2:', permanentUrl);

    return NextResponse.json({
      imageUrl: permanentUrl, // Return the permanent R2 URL instead of temporary DALL-E URL
      prompt: prompt // Return prompt for debugging
    });

  } catch (error: any) {
    console.error('Error generating event image:', error);

    // Handle specific OpenAI errors
    if (error?.status === 400) {
      return NextResponse.json(
        { error: 'Invalid request to image generation API' },
        { status: 400 }
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate event image. Please try again.' },
      { status: 500 }
    );
  }
}
