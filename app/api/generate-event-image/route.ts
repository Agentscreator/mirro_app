import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Lazy initialize OpenAI only when needed
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, location } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Event title is required' }, { status: 400 });
    }

    // Create a detailed prompt for DALL-E 3
    const prompt = `Create a vibrant, professional event thumbnail image for: "${title}". ${description ? `The event is about: ${description}.` : ''} ${location ? `Location: ${location}.` : ''} Style: Modern, colorful, eye-catching, suitable for social media. No text or words in the image.`;

    console.log('Generating image with DALL-E 3 for:', title);

    // Generate image using DALL-E 3
    const response = await getOpenAIClient().images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid"
    });

    const imageUrl = response.data[0]?.url;

    if (!imageUrl) {
      throw new Error('No image URL returned from DALL-E 3');
    }

    console.log('Successfully generated image:', imageUrl);

    return NextResponse.json({ 
      imageUrl,
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
