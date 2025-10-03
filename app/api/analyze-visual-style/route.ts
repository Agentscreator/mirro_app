import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Predefined visual themes based on event types and moods
const visualThemes = {
  professional: {
    gradients: [
      'from-slate-600 to-slate-800',
      'from-gray-700 to-gray-900',
      'from-blue-800 to-blue-900',
      'from-indigo-700 to-indigo-900'
    ],
    colors: ['slate', 'gray', 'blue', 'indigo'],
    fonts: ['font-medium', 'font-semibold'],
    layouts: ['minimal', 'structured']
  },
  creative: {
    gradients: [
      'from-purple-500 to-pink-600',
      'from-orange-400 to-red-500',
      'from-yellow-400 to-orange-500',
      'from-green-400 to-blue-500'
    ],
    colors: ['purple', 'pink', 'orange', 'yellow', 'green'],
    fonts: ['font-bold', 'font-extrabold'],
    layouts: ['artistic', 'dynamic']
  },
  social: {
    gradients: [
      'from-pink-400 to-rose-500',
      'from-blue-400 to-cyan-500',
      'from-green-400 to-emerald-500',
      'from-yellow-300 to-amber-400'
    ],
    colors: ['pink', 'rose', 'blue', 'cyan', 'green', 'emerald'],
    fonts: ['font-medium', 'font-semibold'],
    layouts: ['friendly', 'inviting']
  },
  formal: {
    gradients: [
      'from-gray-800 to-black',
      'from-slate-700 to-slate-900',
      'from-blue-900 to-indigo-900',
      'from-purple-900 to-indigo-900'
    ],
    colors: ['gray', 'slate', 'blue', 'purple', 'indigo'],
    fonts: ['font-semibold', 'font-bold'],
    layouts: ['elegant', 'classic']
  },
  outdoor: {
    gradients: [
      'from-green-500 to-emerald-600',
      'from-blue-400 to-teal-500',
      'from-yellow-400 to-green-500',
      'from-orange-400 to-yellow-500'
    ],
    colors: ['green', 'emerald', 'blue', 'teal', 'yellow', 'orange'],
    fonts: ['font-medium', 'font-semibold'],
    layouts: ['natural', 'adventurous']
  },
  celebration: {
    gradients: [
      'from-yellow-400 to-orange-500',
      'from-pink-400 to-purple-500',
      'from-red-400 to-pink-500',
      'from-orange-400 to-red-500'
    ],
    colors: ['yellow', 'orange', 'pink', 'purple', 'red'],
    fonts: ['font-bold', 'font-extrabold'],
    layouts: ['festive', 'joyful']
  }
};

async function analyzeEventStyle(eventData: any) {
  const systemPrompt = `You are a visual design AI that analyzes event content and suggests appropriate visual styling.

Based on the event title, description, location, and time, determine:
1. The overall mood/theme (professional, creative, social, formal, outdoor, celebration)
2. The energy level (low, medium, high)
3. The formality level (casual, semi-formal, formal)
4. Key visual elements that would enhance the invite

Available themes: ${Object.keys(visualThemes).join(', ')}

Return ONLY valid JSON in this exact format:
{
  "theme": "theme_name",
  "energy": "low|medium|high",
  "formality": "casual|semi-formal|formal",
  "mood": "descriptive mood (e.g., 'energetic and fun', 'professional and sleek')",
  "visualElements": ["element1", "element2", "element3"],
  "colorPalette": ["color1", "color2", "color3"],
  "reasoning": "Brief explanation of why these choices fit the event"
}`;

  const userPrompt = `Analyze this event for visual styling:
Title: ${eventData.title}
Description: ${eventData.description}
Location: ${eventData.location}
Time: ${eventData.time}
Date: ${eventData.date}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const analysis = JSON.parse(response);
    
    // Generate visual styling based on analysis
    const theme = visualThemes[analysis.theme as keyof typeof visualThemes] || visualThemes.social;
    const gradient = theme.gradients[Math.floor(Math.random() * theme.gradients.length)];
    const primaryColor = theme.colors[Math.floor(Math.random() * theme.colors.length)];
    const font = theme.fonts[Math.floor(Math.random() * theme.fonts.length)];
    const layout = theme.layouts[Math.floor(Math.random() * theme.layouts.length)];

    return {
      ...analysis,
      styling: {
        gradient: `bg-gradient-to-br ${gradient}`,
        primaryColor,
        font,
        layout,
        theme: analysis.theme
      }
    };

  } catch (error) {
    console.error('Error with OpenAI visual analysis:', error);
    
    // Fallback: Basic analysis based on keywords
    return fallbackVisualAnalysis(eventData);
  }
}

function fallbackVisualAnalysis(eventData: any) {
  const text = `${eventData.title} ${eventData.description} ${eventData.location}`.toLowerCase();
  
  let theme = 'social'; // default
  
  // Simple keyword matching
  if (text.includes('business') || text.includes('meeting') || text.includes('conference') || text.includes('workshop')) {
    theme = 'professional';
  } else if (text.includes('art') || text.includes('music') || text.includes('creative') || text.includes('design')) {
    theme = 'creative';
  } else if (text.includes('formal') || text.includes('gala') || text.includes('ceremony') || text.includes('award')) {
    theme = 'formal';
  } else if (text.includes('outdoor') || text.includes('park') || text.includes('hiking') || text.includes('beach')) {
    theme = 'outdoor';
  } else if (text.includes('party') || text.includes('celebration') || text.includes('birthday') || text.includes('wedding')) {
    theme = 'celebration';
  }

  const themeConfig = visualThemes[theme as keyof typeof visualThemes];
  const gradient = themeConfig.gradients[0];
  const primaryColor = themeConfig.colors[0];
  const font = themeConfig.fonts[0];
  const layout = themeConfig.layouts[0];

  return {
    theme,
    energy: 'medium',
    formality: 'casual',
    mood: 'welcoming and engaging',
    visualElements: ['gradient background', 'clean typography', 'balanced layout'],
    colorPalette: themeConfig.colors.slice(0, 3),
    reasoning: `Based on keywords in the event content, this appears to be a ${theme} event.`,
    styling: {
      gradient: `bg-gradient-to-br ${gradient}`,
      primaryColor,
      font,
      layout,
      theme
    }
  };
}

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json();

    if (!eventData.title || !eventData.description) {
      return NextResponse.json({ error: 'Event title and description are required' }, { status: 400 });
    }

    const visualAnalysis = await analyzeEventStyle(eventData);

    return NextResponse.json(visualAnalysis);
  } catch (error) {
    console.error('Error analyzing visual style:', error);
    return NextResponse.json(
      { error: 'Failed to analyze visual style. Please try again.' },
      { status: 500 }
    );
  }
}