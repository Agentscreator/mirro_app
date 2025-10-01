import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { input, method } = await req.json()

    if (!input || !input.trim()) {
      return NextResponse.json(
        { error: 'Input is required' },
        { status: 400 }
      )
    }

    // Create different prompts based on the method
    let systemPrompt = ''
    let userPrompt = ''

    switch (method) {
      case 'generate':
        systemPrompt = 'You are an AI assistant that helps create event details. Given a brief description, generate a compelling event title and detailed description. Return ONLY a JSON object with "title" and "description" fields. Keep the title concise (max 60 characters) and the description engaging and informative (2-3 sentences).'
        userPrompt = `Create an event based on this idea: ${input}`
        break
      case 'paste':
        systemPrompt = 'You are an AI assistant that helps structure event information. Given event details or notes, extract or generate a clear event title and well-formatted description. Return ONLY a JSON object with "title" and "description" fields. Keep the title concise (max 60 characters) and the description clear and engaging (2-3 sentences).'
        userPrompt = `Structure this into an event: ${input}`
        break
      case 'import':
        systemPrompt = 'You are an AI assistant that helps transform imported content into event details. Given content from a file, link, or text, create an appropriate event title and description. Return ONLY a JSON object with "title" and "description" fields. Keep the title concise (max 60 characters) and the description informative (2-3 sentences).'
        userPrompt = `Create an event from this content: ${input}`
        break
      default:
        systemPrompt = 'You are an AI assistant that helps create event details. Return ONLY a JSON object with "title" and "description" fields.'
        userPrompt = input
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 500,
    })

    const content = completion.choices[0].message.content
    if (!content) {
      return NextResponse.json(
        { error: 'Failed to generate event content' },
        { status: 500 }
      )
    }

    // Parse and validate the response
    const eventData = JSON.parse(content)

    if (!eventData.title || !eventData.description) {
      return NextResponse.json(
        { error: 'Invalid response format from AI' },
        { status: 500 }
      )
    }

    return NextResponse.json(eventData)
  } catch (error) {
    console.error('Error generating event:', error)
    return NextResponse.json(
      { error: 'Failed to generate event content' },
      { status: 500 }
    )
  }
}
