import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { extractDateTime } from '@/lib/dateTimeUtils';

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

// Helper function to extract structured data from text
async function extractEventData(input: string, method: string) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();
  
  const systemPrompt = `You are an AI assistant that extracts event information from text and generates complete event details. 

Current date context: ${currentDate.toDateString()}

Your task is to:
1. Extract or infer date, time, and location from the user's text
2. Generate a compelling title and description
3. Return structured JSON data

For date extraction:
- Look for explicit dates (e.g., "December 15", "12/15/2024", "next Friday")
- Look for relative dates (e.g., "tomorrow", "next week", "in 3 days")
- If no date is mentioned, suggest a reasonable future date
- Always return date in YYYY-MM-DD format

For time extraction:
- Look for explicit times (e.g., "7 PM", "19:00", "7:30 in the evening")
- Look for relative times (e.g., "morning", "afternoon", "evening")
- If no time is mentioned, suggest an appropriate time based on event type
- Always return time in HH:MM format (24-hour)

For location extraction:
- Look for specific addresses, venues, or place names
- Look for general locations (e.g., "downtown", "my house", "the park")
- If no location is mentioned, suggest "TBD" or a generic appropriate location

Return ONLY valid JSON in this exact format:
{
  "title": "Event Title",
  "description": "Detailed event description",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "location": "Event Location"
}`;

  const userPrompt = method === 'generate' 
    ? `Generate a complete event from this idea: "${input}"`
    : `Extract event details and enhance this text: "${input}"`;

  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const eventData = JSON.parse(response);
    
    // Validate required fields
    if (!eventData.title || !eventData.description || !eventData.date || !eventData.time || !eventData.location) {
      throw new Error('Incomplete event data generated');
    }

    return eventData;
  } catch (error) {
    console.error('Error with OpenAI:', error);
    
    // Fallback: Basic text parsing if OpenAI fails
    return fallbackExtraction(input, method);
  }
}

// Fallback extraction using enhanced text parsing
function fallbackExtraction(input: string, method: string) {
  const currentDate = new Date();
  
  // Use the enhanced extraction utility
  const extracted = extractDateTime(input);
  
  // Set defaults if not found
  const extractedDate = extracted.date || (() => {
    const nextWeek = new Date(currentDate);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  })();
  
  const extractedTime = extracted.time || '18:00'; // Default to 6 PM
  const extractedLocation = extracted.location || 'TBD';

  // Generate title and description
  const title = method === 'generate' 
    ? input.charAt(0).toUpperCase() + input.slice(1)
    : extractTitleFromText(input);
    
  const description = method === 'generate'
    ? `Join us for ${input}. This will be an amazing event that you won't want to miss!`
    : input;

  return {
    title,
    description,
    date: extractedDate,
    time: extractedTime,
    location: extractedLocation,
  };
}



// Helper function to extract title from text
function extractTitleFromText(text: string): string {
  // Take first sentence or first 50 characters
  const firstSentence = text.split(/[.!?]/)[0];
  if (firstSentence.length <= 50) {
    return firstSentence.trim();
  }
  
  const truncated = text.substring(0, 50);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

export async function POST(request: NextRequest) {
  try {
    const { input, method, generateImage } = await request.json();

    if (!input || !method) {
      return NextResponse.json({ error: 'Input and method are required' }, { status: 400 });
    }

    const eventData = await extractEventData(input, method);

    // Generate visual styling based on the event content
    try {
      const visualResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/analyze-visual-style`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (visualResponse.ok) {
        const visualAnalysis = await visualResponse.json();
        eventData.visualStyling = visualAnalysis;
      }
    } catch (visualError) {
      console.error('Error getting visual styling:', visualError);
      // Continue without visual styling if it fails
    }

    // Generate AI images if requested and no media was uploaded
    if (generateImage) {
      try {
        console.log('Generating AI images for event:', eventData.title);
        
        // Generate thumbnail
        const thumbnailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/generate-event-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: eventData.title,
            description: eventData.description,
            location: eventData.location,
            type: 'thumbnail',
          }),
        });

        if (thumbnailResponse.ok) {
          const thumbnailData = await thumbnailResponse.json();
          eventData.aiGeneratedImage = thumbnailData.imageUrl;
          console.log('AI thumbnail generated successfully');
        } else {
          console.error('Failed to generate AI thumbnail:', await thumbnailResponse.text());
        }

        // Generate background for modal
        const backgroundResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/generate-event-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: eventData.title,
            description: eventData.description,
            location: eventData.location,
            type: 'background',
          }),
        });

        if (backgroundResponse.ok) {
          const backgroundData = await backgroundResponse.json();
          eventData.aiGeneratedBackground = backgroundData.imageUrl;
          console.log('AI background generated successfully');
        } else {
          console.error('Failed to generate AI background:', await backgroundResponse.text());
        }
      } catch (imageError) {
        console.error('Error generating AI images:', imageError);
        // Continue without AI images if it fails
      }
    }

    return NextResponse.json(eventData);
  } catch (error) {
    console.error('Error generating event:', error);
    return NextResponse.json(
      { error: 'Failed to generate event. Please try again.' },
      { status: 500 }
    );
  }
}