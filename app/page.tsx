"use client"

import { useState } from "react"
import ProfilePage from "@/components/ProfilePage"
import CreateEventPage from "@/components/CreateEventPage"
import BottomNavigation from "@/components/BottomNavigation"

export default function EventsApp() {
  const [currentPage, setCurrentPage] = useState<"profile" | "create">("profile")

  return (
    <div
      className="max-w-md mx-auto min-h-screen shadow-xl"
      style={{ background: "linear-gradient(135deg, #F5E8D5 0%, #F0DFC7 50%, #EBD6B9 100%)" }}
    >
      {/* Header */}
      <header className="px-6 py-6">
        <h1 className="text-2xl font-normal text-text-primary text-center">
          {currentPage === "profile" ? "My Events" : "Create Event"}
        </h1>
      </header>

      {/* Pages */}
      {currentPage === "profile" && <ProfilePage />}
      {currentPage === "create" && <CreateEventPage />}

      {/* Bottom Navigation */}
      <BottomNavigation currentPage={currentPage} onPageChange={setCurrentPage} />
    </div>
  )
}
