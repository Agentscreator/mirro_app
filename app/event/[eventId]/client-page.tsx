'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ClientEventPageProps {
  eventId: string
}

export default function ClientEventPage({ eventId }: ClientEventPageProps) {
  const router = useRouter()
  const [status, setStatus] = useState('Checking event...')

  useEffect(() => {
    // Verify event exists via API call
    const checkEventAndRedirect = async () => {
      try {
        console.log('Checking event:', eventId)
        setStatus('Verifying event exists...')

        const response = await fetch(`/api/events/${eventId}`)
        console.log('Event check response:', response.status)

        if (response.ok) {
          const eventData = await response.json()
          console.log('Event found:', eventData.title)
          setStatus('Event found! Redirecting...')

          // Event exists, redirect to main app with event modal
          const redirectUrl = `/?event=${eventId}`
          console.log('Redirecting to:', redirectUrl)

          // Use window.location.href for a more reliable redirect
          setTimeout(() => {
            window.location.href = redirectUrl
          }, 500)
        } else if (response.status === 404) {
          console.log('Event not found (404)')
          setStatus('Event not found. Redirecting...')
          // Event doesn't exist, redirect with error
          setTimeout(() => {
            window.location.href = `/?eventNotFound=${eventId}`
          }, 500)
        } else {
          console.log('Unexpected response status:', response.status)
          setStatus('Error loading event. Redirecting...')
          setTimeout(() => {
            window.location.href = `/?error=event-load-failed`
          }, 500)
        }
      } catch (error) {
        console.error('Error checking event:', error)
        setStatus('Network error. Redirecting...')
        setTimeout(() => {
          window.location.href = `/?error=network-error`
        }, 500)
      }
    }

    if (eventId) {
      checkEventAndRedirect()
    }
  }, [eventId, router])

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #F5E8D5 0%, #F0DFC7 50%, #EBD6B9 100%)" }}
    >
      <div className="text-center glass-card rounded-2xl p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-taupe-600 mx-auto mb-4"></div>
        <p className="text-taupe-600 mb-2">{status}</p>
        <p className="text-sm text-taupe-500">Event ID: {eventId}</p>
      </div>
    </div>
  )
}