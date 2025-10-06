'use client'

import { useEffect, useState } from 'react'
import EventPreviewModal from '@/components/EventPreviewModal'

interface ClientEventPageProps {
  eventId: string
}

interface User {
  id: string
  name: string
  username: string
  profilePicture?: string | null
}

export default function ClientEventPage({ eventId }: ClientEventPageProps) {
  const [status, setStatus] = useState('Loading event...')
  const [event, setEvent] = useState<any>(null)
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Check if user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('user')
      }
    }
  }, [])

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        console.log('Fetching event:', eventId)
        setStatus('Loading event details...')

        const response = await fetch(`/api/events/${eventId}`)
        console.log('Event fetch response:', response.status)

        if (response.ok) {
          const eventData = await response.json()
          console.log('Event loaded:', eventData.title)
          setEvent(eventData)
          setStatus('Event loaded successfully')
        } else if (response.status === 404) {
          console.log('Event not found (404)')
          setError('Event not found')
          setStatus('Event not found')
        } else {
          console.log('Unexpected response status:', response.status)
          setError('Failed to load event')
          setStatus('Error loading event')
        }
      } catch (error) {
        console.error('Error fetching event:', error)
        setError('Network error')
        setStatus('Network error')
      }
    }

    if (eventId) {
      fetchEvent()
    }
  }, [eventId])





  const handleCloseModal = () => {
    // Redirect to main app
    window.location.href = '/'
  }

  // Loading state
  if (!event && !error) {
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

  // Error state
  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #F5E8D5 0%, #F0DFC7 50%, #EBD6B9 100%)" }}
      >
        <div className="text-center glass-card rounded-2xl p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-taupe-700 mb-2">Event Not Found</h2>
          <p className="text-taupe-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="glass-card rounded-xl px-6 py-3 text-taupe-700 hover:bg-white/60 transition-all duration-200"
          >
            Go to Mirro
          </button>
        </div>
      </div>
    )
  }

  // Show event with auth overlay if needed
  return (
    <div
      className="max-w-md mx-auto min-h-screen shadow-xl relative"
      style={{ background: "linear-gradient(135deg, #F5E8D5 0%, #F0DFC7 50%, #EBD6B9 100%)" }}
    >
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between">
        <h1 className="text-2xl font-normal text-text-primary">Shared Event</h1>
        <button
          onClick={() => window.location.href = '/'}
          className="glass-card rounded-xl px-4 py-2 text-sm text-text-secondary hover:bg-white/60 transition-all duration-200"
        >
          Go to App
        </button>
      </header>

      {/* Event Preview Modal */}
      <EventPreviewModal
        event={event}
        isOpen={true}
        onClose={handleCloseModal}
        currentUserId={user?.id || ''}
        onJoinStatusChange={() => {
          // Refresh event data after join/leave
          window.location.reload()
        }}
      />


    </div>
  )
}