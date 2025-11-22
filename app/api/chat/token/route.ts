import { NextRequest, NextResponse } from 'next/server'
import { StreamChat } from 'stream-chat'

export async function POST(request: NextRequest) {
  try {
    const { userId, userName } = await request.json()

    if (!userId || !userName) {
      return NextResponse.json(
        { error: 'userId and userName are required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY
    const apiSecret = process.env.STREAM_SECRET_KEY

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Stream API credentials not configured' },
        { status: 500 }
      )
    }

    const serverClient = StreamChat.getInstance(apiKey, apiSecret)

    // Create or update user
    await serverClient.upsertUser({
      id: userId,
      name: userName,
    })

    // Generate token
    const token = serverClient.createToken(userId)

    return NextResponse.json({ token, apiKey })
  } catch (error) {
    console.error('Error generating Stream token:', error)
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    )
  }
}
