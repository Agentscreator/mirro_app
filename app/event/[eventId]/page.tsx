import { Metadata } from 'next'
import ClientEventPage from './client-page'

interface EventPageProps {
  params: { eventId: string }
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  // Simplified metadata - just return basic info without database call
  return {
    title: 'Event - Mirro',
    description: 'Check out this event on Mirro',
    openGraph: {
      title: 'Event - Mirro',
      description: 'Check out this event on Mirro',
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://mirro-app.vercel.app'}/event/${params.eventId}`,
      siteName: 'Mirro',
      type: 'website',
    },
  }
}

export default function EventPage({ params }: EventPageProps) {
  return <ClientEventPage eventId={params.eventId} />
}