"use client"

import { useState, useEffect } from "react"
import ProfilePage from "@/components/ProfilePage"
import CreateEventPage from "@/components/CreateEventPage"
import AuthPage from "@/components/AuthPage"
import BottomNavigation from "@/components/BottomNavigation"

interface User {
  id: string
  name: string
  username: string
  createdAt: string
  updatedAt: string
}

export default function EventsApp() {
  const [currentPage, setCurrentPage] = useState<"profile" | "create">("profile")
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

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
      {currentPage === "profile" && <ProfilePage user={user} />}
      {currentPage === "create" && <CreateEventPage />}

      {/* Bottom Navigation */}
      <BottomNavigation currentPage={currentPage} onPageChange={setCurrentPage} />
    </div>
  )
}
