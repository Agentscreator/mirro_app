import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'Event'
    const date = searchParams.get('date') || ''
    const location = searchParams.get('location') || ''

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8f9fa',
            backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Logo/Brand */}
          <div
            style={{
              position: 'absolute',
              top: 40,
              left: 40,
              display: 'flex',
              alignItems: 'center',
              color: 'white',
              fontSize: 24,
              fontWeight: 'bold',
            }}
          >
            Mirro
          </div>

          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '0 60px',
              maxWidth: '80%',
            }}
          >
            {/* Event Title */}
            <h1
              style={{
                fontSize: 64,
                fontWeight: 'bold',
                color: 'white',
                marginBottom: 20,
                lineHeight: 1.1,
                textShadow: '0 4px 8px rgba(0,0,0,0.3)',
              }}
            >
              {title}
            </h1>

            {/* Event Details */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                color: 'rgba(255,255,255,0.9)',
                fontSize: 28,
              }}
            >
              {date && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>📅</span>
                  <span>{date}</span>
                </div>
              )}
              {location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>📍</span>
                  <span>{location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom decoration */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 8,
              background: 'linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3)',
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}