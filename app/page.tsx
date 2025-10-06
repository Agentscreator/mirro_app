"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import ProfilePage from "@/components/ProfilePage"
import CreateEventPage from "@/components/CreateEventPage"
import AuthPage from "@/components/AuthPage"
import BottomNavigation from "@/components/BottomNavigation"
import EventPreviewModal from "@/components/EventPreviewModal"

interface User {
  id: string
  name: string
  username: string
  profilePicture?: string | null
  followersCount?: string
  followingCount?: string
  createdAt: string
  updatedAt: string
}

function EventsAppContent() {
  const searchParams = useSearchParams()
  const [currentPage, setCurrentPage] = useState<"profile" | "create">("profile")
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshEvents, setRefreshEvents] = useState(0)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [sharedEvent, setSharedEvent] = useState<any>(null)
  const [isLoadingSharedEvent, setIsLoadingSharedEvent] = useState(false)

  useEffect(() => {
    // Check if user is logged in and validate session
    const validateSession = async () => {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)

          // Validate the session with the server
          const response = await fetch('/api/auth/validate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: userData.id }),
          })

          if (response.ok) {
            const data = await response.json()
            // Update user data with fresh information from server
            setUser(data.user)
            localStorage.setItem('user', JSON.stringify(data.user))
          } else {
            // Invalid session, clear localStorage
            localStorage.removeItem('user')
            setUser(null)
          }
        } catch (error) {
          console.error('Session validation error:', error)
          // Clear invalid session data
          localStorage.removeItem('user')
          setUser(null)
        }
      }
      setIsLoading(false)
    }

    validateSession()
  }, [])

  // Handle event parameter from URL - fetch shared event data
  useEffect(() => {
    const eventId = searchParams.get('event')
    const eventNotFound = searchParams.get('eventNotFound')
    const error = searchParams.get('error')

    console.log('URL Parameters:', {
      eventId,
      eventNotFound,
      error,
      fullURL: window.location.href,
      searchParams: searchParams.toString()
    })

    if (eventId) {
      console.log('Found event ID in URL:', eventId)
      setSelectedEventId(eventId)
      // Fetch shared event data for non-authenticated users
      const fetchSharedEvent = async () => {
        console.log('Starting to fetch shared event:', eventId)
        setIsLoadingSharedEvent(true)
        try {
          const apiUrl = `/api/events/${eventId}`
          console.log('Fetching from:', apiUrl)
          const response = await fetch(apiUrl)
          console.log('Response status:', response.status)
          
          if (response.ok) {
            const eventData = await response.json()
            console.log('Event data received:', eventData)
            setSharedEvent(eventData)
          } else if (response.status === 404) {
            console.log('Event not found (404), redirecting')
            // Event not found, redirect to main page with error
            window.history.replaceState({}, '', '/?eventNotFound=' + eventId)
            setSelectedEventId(null)
          } else {
            console.error('Failed to fetch shared event, status:', response.status)
            const errorData = await response.text()
            console.error('Error response:', errorData)
            setSelectedEventId(null)
          }
        } catch (error) {
          console.error('Error fetching shared event:', error)
          setSelectedEventId(null)
        } finally {
          setIsLoadingSharedEvent(false)
        }
      }
      fetchSharedEvent()
    } else if (eventNotFound) {
      // Show a toast or alert that the event wasn't found
      console.log('Event not found:', eventNotFound)
      alert(`Event not found: ${eventNotFound}`)
    } else if (error) {
      console.log('Error loading event:', error)
      alert(`Error loading event: ${error}`)
    } else {
      console.log('No event parameter found in URL')
    }
  }, [searchParams])

  const handleAuthSuccess = () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      // If there was a shared event being viewed, keep it open after login
      // The EventPreviewModal will now show join/leave buttons since user is authenticated
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  if (isLoading) {
    return (
      <div
        className="max-w-md mx-auto min-h-screen shadow-xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #F5E8D5 0%, #F0DFC7 50%, #EBD6B9 100%)" }}
      >
        <div className="glass-card rounded-full p-6">
          <svg className="animate-spin h-8 w-8 text-taupe-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    )
  }

  if (!user) {
    // If there's a shared event, show it without requiring authentication
    if (selectedEventId && sharedEvent) {
      return (
        <div
          className="max-w-md mx-auto min-h-screen shadow-xl"
          style={{ background: "linear-gradient(135deg, #F5E8D5 0%, #F0DFC7 50%, #EBD6B9 100%)" }}
        >
          <AuthPage onAuthSuccess={handleAuthSuccess} />
          <EventPreviewModal
            event={sharedEvent}
            isOpen={true}
            onClose={() => {
              setSelectedEventId(null)
              setSharedEvent(null)
            }}
            currentUserId=""
          />
        </div>
      )
    }

    // If loading shared event, show loading state
    if (selectedEventId && isLoadingSharedEvent) {
      return (
        <div
          className="max-w-md mx-auto min-h-screen shadow-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #F5E8D5 0%, #F0DFC7 50%, #EBD6B9 100%)" }}
        >
          <div className="glass-card rounded-2xl p-8 text-center">
            <svg className="animate-spin h-8 w-8 text-taupe-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-taupe-600">Loading shared event...</p>
            <p className="text-sm text-taupe-500 mt-2">Event ID: {selectedEventId}</p>
          </div>
        </div>
      )
    }

    return (
      <div
        className="max-w-md mx-auto min-h-screen shadow-xl"
        style={{ background: "linear-gradient(135deg, #F5E8D5 0%, #F0DFC7 50%, #EBD6B9 100%)" }}
      >
        <AuthPage onAuthSuccess={handleAuthSuccess} />
      </div>
    )
  }

  return (
    <div
      className="max-w-md mx-auto min-h-screen shadow-xl"
      style={{ background: "linear-gradient(135deg, #F5E8D5 0%, #F0DFC7 50%, #EBD6B9 100%)" }}
    >
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between">
        <h1 className="text-2xl font-normal text-text-primary">
          {currentPage === "profile" ? "My Events" : "Create Event"}
        </h1>
        <button
          onClick={handleLogout}
          className="glass-card rounded-xl px-4 py-2 text-sm text-text-secondary hover:bg-white/60 transition-all duration-200"
        >
          Logout
        </button>
      </header>

      {/* Pages */}
      {currentPage === "profile" && (
        <ProfilePage
          user={user}
          key={refreshEvents}
          initialEventId={selectedEventId}
          onEventModalClose={() => {
            setSelectedEventId(null)
            setSharedEvent(null)
          }}
        />
      )}
      {currentPage === "create" && <CreateEventPage onEventCreated={() => {
        setRefreshEvents(prev => prev + 1)
        setCurrentPage("profile")
      }} />}

      {/* Shared Event Modal for authenticated users */}
      {selectedEventId && sharedEvent && (
        <EventPreviewModal
          event={sharedEvent}
          isOpen={true}
          onClose={() => {
            setSelectedEventId(null)
            setSharedEvent(null)
          }}
          currentUserId={user.id}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNavigation currentPage={currentPage} onPageChange={setCurrentPage} />
    </div>
  )
}

export default function EventsApp() {
  return (
    <Suspense fallback={
      <div
        className="max-w-md mx-auto min-h-screen shadow-xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #F5E8D5 0%, #F0DFC7 50%, #EBD6B9 100%)" }}
      >
        <div className="glass-card rounded-full p-6">
          <svg className="animate-spin h-8 w-8 text-taupe-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    }>
      <EventsAppContent />
    </Suspense>
  )
}
