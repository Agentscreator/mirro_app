import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getEventById } from '@/lib/auth'

interface EventPageProps {
  params: { eventId: string }
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  try {
    const event = await getEventById(params.eventId)
    
    if (!event) {
      return {
        title: 'Event Not Found',
        description: 'The requested event could not be found.'
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mirro-app.vercel.app'
    const eventUrl = `${baseUrl}/event/${params.eventId}`
    
    // Format date for display
    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const title = `${event.title} - Mirro`
    const description = `${event.description} | ${eventDate} at ${event.time} | ${event.location}`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: eventUrl,
        siteName: 'Mirro',
        type: 'website',
        images: event.mediaUrl && event.mediaType === 'image' ? [
          {
            url: event.mediaUrl,
            width: 1200,
            height: 630,
            alt: event.title,
          }
        ] : [
          {
            url: `${baseUrl}/api/og?title=${encodeURIComponent(event.title)}&date=${encodeURIComponent(eventDate)}&location=${encodeURIComponent(event.location)}`,
            width: 1200,
            height: 630,
            alt: event.title,
          }
        ],
        videos: event.mediaUrl && event.mediaType === 'video' ? [
          {
            url: event.mediaUrl,
            width: 1200,
            height: 630,
          }
        ] : undefined,
      },
      twitter: {
        card: event.mediaUrl ? (event.mediaType === 'video' ? 'player' : 'summary_large_image') : 'summary_large_image',
        title,
        description,
        images: event.mediaUrl && event.mediaType === 'image' ? [event.mediaUrl] : [
          `${baseUrl}/api/og?title=${encodeURIComponent(event.title)}&date=${encodeURIComponent(eventDate)}&location=${encodeURIComponent(event.location)}`
        ],
        players: event.mediaUrl && event.mediaType === 'video' ? [
          {
            playerUrl: event.mediaUrl,
            streamUrl: event.mediaUrl,
            width: 1200,
            height: 630,
          }
        ] : undefined,
      },
      other: {
        'og:video:type': event.mediaType === 'video' ? 'video/mp4' : undefined,
        'og:image:type': event.mediaType === 'image' ? 'image/jpeg' : undefined,
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Event - Mirro',
      description: 'Check out this event on Mirro'
    }
  }
}

export default async function EventPage({ params }: EventPageProps) {
  try {
    console.log('Loading event with ID:', params.eventId)
    const event = await getEventById(params.eventId)
    
    if (!event) {
      console.log('Event not found:', params.eventId)
      // Instead of showing 404, redirect to main page with a message
      redirect(`/?eventNotFound=${params.eventId}`)
    }

    console.log('Event found, redirecting to main page with event modal')
    // Redirect to the main app with the event modal open
    redirect(`/?event=${params.eventId}`)
  } catch (error) {
    console.error('Error loading event:', error)
    // Redirect to main page instead of showing 404
    redirect(`/?error=event-load-failed`)
  }
}