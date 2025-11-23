"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import ProfilePage from "@/components/ProfilePage"
import CreateEventPage from "@/components/CreateEventPage"
import AuthPage from "@/components/AuthPage"
import BottomNavigation from "@/components/BottomNavigation"
import EventPreviewModal from "@/components/EventPreviewModal"
import MessagingPage from "@/components/MessagingPage"
import { useDeepLinking } from "@/hooks/useDeepLinking"

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
  const [currentPage, setCurrentPage] = useState<"profile" | "create" | "messages">("profile")
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshEvents, setRefreshEvents] = useState(0)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [sharedEvent, setSharedEvent] = useState<any>(null)
  const [isLoadingSharedEvent, setIsLoadingSharedEvent] = useState(false)
  const [showAuthFromModal, setShowAuthFromModal] = useState(false)

  // Enable deep linking for mobile apps
  useDeepLinking()

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

  // Function to fetch shared event data
  const fetchSharedEvent = async (eventId: string) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔍 FETCH DEBUG:')
    console.log('   Event ID:', eventId)
    console.log('   Event ID type:', typeof eventId)
    console.log('   Event ID length:', eventId?.length)
    console.log('   Current URL:', window.location.href)
    console.log('   Current pathname:', window.location.pathname)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    setIsLoadingSharedEvent(true)
    try {
      const apiUrl = `/api/events/${eventId}`
      console.log('📡 Fetching from:', apiUrl)
      console.log('📡 Full URL will be:', window.location.origin + apiUrl)

      const response = await fetch(apiUrl)
      console.log('📥 Response status:', response.status)
      console.log('📥 Response statusText:', response.statusText)
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const eventData = await response.json()
        console.log('✅ Event data received:', eventData)
        setSharedEvent(eventData)
      } else if (response.status === 404) {
        console.log('❌ Event not found (404), redirecting')
        const errorBody = await response.text()
        console.log('❌ 404 Response body:', errorBody)
        // Event not found, redirect to main page with error
        window.history.replaceState({}, '', '/?eventNotFound=' + eventId)
        setSelectedEventId(null)
      } else {
        console.error('❌ Failed to fetch shared event, status:', response.status)
        const errorData = await response.text()
        console.error('❌ Error response:', errorData)
        setSelectedEventId(null)
      }
    } catch (error) {
      console.error('❌ Error fetching shared event:', error)
      console.error('❌ Error type:', error?.constructor?.name)
      console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown')
      setSelectedEventId(null)
    } finally {
      setIsLoadingSharedEvent(false)
    }
  }

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
      fetchSharedEvent(eventId)
    } else if (eventNotFound) {
      // Show a toast or alert that the event wasn't found
      console.log('Event not found:', eventNotFound)
      alert(`Event not found: ${eventNotFound}`)
    } else if (error) {
      console.log('Error loading event:', error)
      alert(`Error loading event: ${error}`)
    }
    // No event parameter - normal page load
  }, [searchParams])

  const handleAuthSuccess = () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      // If there was a shared event being viewed, refresh it to show updated join status
      if (selectedEventId) {
        fetchSharedEvent(selectedEventId)
      }
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
    if (selectedEventId && sharedEvent && !showAuthFromModal) {
      return (
        <div
          className="max-w-md mx-auto min-h-screen shadow-xl"
          style={{ background: "linear-gradient(135deg, #F5E8D5 0%, #F0DFC7 50%, #EBD6B9 100%)" }}
        >
          <EventPreviewModal
            event={sharedEvent}
            isOpen={true}
            onClose={() => {
              setSelectedEventId(null)
              setSharedEvent(null)
            }}
            currentUserId=""
            onJoinStatusChange={() => {
              if (selectedEventId) {
                fetchSharedEvent(selectedEventId)
              }
            }}
            onSignUpRequest={() => {
              setShowAuthFromModal(true)
            }}
          />
        </div>
      )
    }

    // Show auth page (either directly or from modal request)
    if (showAuthFromModal || !selectedEventId) {
      return (
        <div
          className="max-w-md mx-auto min-h-screen shadow-xl"
          style={{ background: "linear-gradient(135deg, #F5E8D5 0%, #F0DFC7 50%, #EBD6B9 100%)" }}
        >
          <AuthPage 
            onAuthSuccess={() => {
              handleAuthSuccess()
              setShowAuthFromModal(false)
              // Keep the shared event context after authentication
              if (selectedEventId && !sharedEvent) {
                fetchSharedEvent(selectedEventId)
              }
            }}
            sharedEventTitle={sharedEvent?.title}
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


  }

  return (
    <div
      className="max-w-md mx-auto min-h-screen shadow-xl"
      style={{ background: "linear-gradient(135deg, #F5E8D5 0%, #F0DFC7 50%, #EBD6B9 100%)" }}
    >
      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex items-center justify-between">
        <h1 className="text-xl font-light text-text-primary tracking-wide">
          {currentPage === "create" ? "Create Event" : ""}
        </h1>
        <button
          onClick={handleLogout}
          className="text-xs font-light text-text-muted hover:text-text-secondary transition-all duration-200"
        >
          Logout
        </button>
      </header>

      {/* Pages */}
      {currentPage === "profile" && user && (
        <ProfilePage
          user={user}
          key={refreshEvents}
          initialEventId={sharedEvent ? null : selectedEventId}
          onEventModalClose={() => {
            setSelectedEventId(null)
            setSharedEvent(null)
          }}
          refreshKey={refreshEvents}
          onAccountDeleted={() => {
            // Clear user state and redirect to auth
            setUser(null)
            setSelectedEventId(null)
            setSharedEvent(null)
          }}
        />
      )}
      {currentPage === "create" && <CreateEventPage onEventCreated={() => {
        setRefreshEvents(prev => prev + 1)
        setCurrentPage("profile")
      }} />}
      {currentPage === "messages" && user && <MessagingPage user={user} />}

      {/* Shared Event Modal for authenticated users */}
      {selectedEventId && sharedEvent && user && (
        <EventPreviewModal
          event={sharedEvent}
          isOpen={true}
          onClose={() => {
            setSelectedEventId(null)
            setSharedEvent(null)
          }}
          currentUserId={user.id}
          onJoinStatusChange={() => {
            if (selectedEventId) {
              fetchSharedEvent(selectedEventId)
            }
            // Increment refresh counter to trigger profile refresh
            setRefreshEvents(prev => prev + 1)
          }}
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
