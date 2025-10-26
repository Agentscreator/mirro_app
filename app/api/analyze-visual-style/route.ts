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
    const eventData = await request.json();
    
    if (!eventData.title || !eventData.description) {
      return NextResponse.json({ error: 'Event title and description are required' }, { status: 400 });
    }

    const systemPrompt = `You are a visual design AI that analyzes event content and generates appropriate visual styling. 

Based on the event details provided, generate visual styling that matches the mood, theme, and context of the event.

Return ONLY valid JSON in this exact format:
{
  "styling": {
    "gradient": "linear-gradient(135deg, #color1 0%, #color2 50%, #color3 100%)",
    "font": "font-family-name"
  },
  "theme": "theme-name",
  "mood": "mood-description"
}

Guidelines:
- Use warm, inviting gradients for social events
- Use professional, clean gradients for business events
- Use vibrant, energetic gradients for sports/fitness events
- Use calm, soothing gradients for wellness/meditation events
- Choose fonts that match the event type (elegant, modern, playful, etc.)
- Keep theme names simple (elegant, modern, vibrant, calm, professional, etc.)`;

    const userPrompt = `Generate visual styling for this event:
Title: ${eventData.title}
Description: ${eventData.description}
Location: ${eventData.location}
Date: ${eventData.date}
Time: ${eventData.time}`;

    try {
      const completion = await getOpenAIClient().chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const visualStyling = JSON.parse(response);
      return NextResponse.json(visualStyling);
      
    } catch (openaiError) {
      console.error('OpenAI error:', openaiError);
      
      // Fallback to default styling based on keywords
      const fallbackStyling = generateFallbackStyling(eventData);
      return NextResponse.json(fallbackStyling);
    }

  } catch (error) {
    console.error('Error analyzing visual style:', error);
    
    // Return a basic default styling
    return NextResponse.json({
      styling: {
        gradient: "linear-gradient(135deg, #F5E8D5 0%, #F0DFC7 50%, #EBD6B9 100%)",
        font: "Inter"
      },
      theme: "default",
      mood: "neutral"
    });
  }
}

function generateFallbackStyling(eventData: any) {
  const text = `${eventData.title} ${eventData.description}`.toLowerCase();
  
  // Business/Professional events
  if (text.includes('meeting') || text.includes('conference') || text.includes('business') || text.includes('work')) {
    return {
      styling: {
        gradient: "linear-gradient(135deg, #E8F4FD 0%, #D6EFFC 50%, #C4E9FB 100%)",
        font: "Inter"
      },
      theme: "professional",
      mood: "focused"
    };
  }
  
  // Party/Social events
  if (text.includes('party') || text.includes('celebration') || text.includes('birthday') || text.includes('wedding')) {
    return {
      styling: {
        gradient: "linear-gradient(135deg, #FFE8F5 0%, #FFD6EF 50%, #FFC4E9 100%)",
        font: "Poppins"
      },
      theme: "celebratory",
      mood: "joyful"
    };
  }
  
  // Sports/Fitness events
  if (text.includes('workout') || text.includes('gym') || text.includes('sports') || text.includes('fitness')) {
    return {
      styling: {
        gradient: "linear-gradient(135deg, #E8FFE8 0%, #D6FFD6 50%, #C4FFC4 100%)",
        font: "Roboto"
      },
      theme: "energetic",
      mood: "motivating"
    };
  }
  
  // Food/Dining events
  if (text.includes('dinner') || text.includes('lunch') || text.includes('food') || text.includes('restaurant')) {
    return {
      styling: {
        gradient: "linear-gradient(135deg, #FFF8E8 0%, #FFF0D6 50%, #FFE8C4 100%)",
        font: "Playfair Display"
      },
      theme: "warm",
      mood: "inviting"
    };
  }
  
  // Default styling
  return {
    styling: {
      gradient: "linear-gradient(135deg, #F5E8D5 0%, #F0DFC7 50%, #EBD6B9 100%)",
      font: "Inter"
    },
    theme: "default",
    mood: "neutral"
  };
}