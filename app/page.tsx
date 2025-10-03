"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import ProfilePage from "@/components/ProfilePage"
import CreateEventPage from "@/components/CreateEventPage"
import AuthPage from "@/components/AuthPage"
import BottomNavigation from "@/components/BottomNavigation"

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

  // Handle event parameter from URL
  useEffect(() => {
    const eventId = searchParams.get('event')
    if (eventId) {
      setSelectedEventId(eventId)
    }
  }, [searchParams])

  const handleAuthSuccess = () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
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
          onEventModalClose={() => setSelectedEventId(null)}
        />
      )}
      {currentPage === "create" && <CreateEventPage onEventCreated={() => {
        setRefreshEvents(prev => prev + 1)
        setCurrentPage("profile")
      }} />}

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
