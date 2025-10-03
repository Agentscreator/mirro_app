'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ClientEventPageProps {
  eventId: string
}

export default function ClientEventPage({ eventId }: ClientEventPageProps) {
  const router = useRouter()

  useEffect(() => {
    // Verify event exists via API call
    const checkEventAndRedirect = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`)
        
        if (response.ok) {
          // Event exists, redirect to main app with event modal
          router.push(`/?event=${eventId}`)
        } else {
          // Event doesn't exist, redirect with error
          router.push(`/?eventNotFound=${eventId}`)
        }
      } catch (error) {
        console.error('Error checking event:', error)
        router.push(`/?error=event-load-failed`)
      }
    }

    checkEventAndRedirect()
  }, [eventId, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sand-100 to-cream-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-taupe-600 mx-auto mb-4"></div>
        <p className="text-taupe-600">Loading event...</p>
      </div>
    </div>
  )
}