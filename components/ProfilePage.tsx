"use client"

import type React from "react"

import { useState } from "react"
import EventCard from "./EventCard"
import ManageEventsToggle from "./ManageEventsToggle"

const upcomingEvents = [
  {
    id: 1,
    title: "Summer Music Festival",
    description: "Join us for an amazing outdoor music experience",
    date: "July 15, 2024",
    time: "6:00 PM",
    location: "Central Park",
    createdBy: "user",
    icon: (
      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
          clipRule="evenodd"
        ></path>
      </svg>
    ),
    gradient: "from-sand-400 to-sand-500",
  },
  {
    id: 2,
    title: "Photography Workshop",
    description: "Learn professional photography techniques",
    date: "August 3, 2024",
    time: "2:00 PM",
    location: "Studio Downtown",
    createdBy: "user",
    icon: (
      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"></path>
      </svg>
    ),
    gradient: "from-taupe-400 to-taupe-500",
  },
  {
    id: 3,
    title: "Community Meetup",
    description: "Connect with local community members",
    date: "August 10, 2024",
    time: "7:00 PM",
    location: "Community Center",
    createdBy: "other",
    icon: (
      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 6a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
      </svg>
    ),
    gradient: "from-cream-400 to-cream-500",
  },
]

export default function ProfilePage() {
  const [isManageMode, setIsManageMode] = useState(false)
  const [profilePicture, setProfilePicture] = useState<string | null>(null)

  const handleEditEvent = (eventId: number) => {
    console.log("Editing event:", eventId)
    // Here you would implement the edit functionality
  }

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfilePicture(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const userCreatedEvents = upcomingEvents.filter((event) => event.createdBy === "user")
  const eventsToShow = isManageMode ? userCreatedEvents : upcomingEvents

  return (
    <div className="px-6 py-4 pb-24">
      {/* Profile Header */}
      <div className="text-center mb-8">
        <div className="relative inline-block">
          <div className="w-24 h-24 glass-card rounded-full mx-auto mb-6 flex items-center justify-center soft-shadow hover-lift overflow-hidden">
            {profilePicture ? (
              <img src={profilePicture || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-12 h-12 text-taupe-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                ></path>
              </svg>
            )}
          </div>
          <label className="absolute bottom-6 right-0 w-8 h-8 bg-gradient-to-br from-taupe-400 to-taupe-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
            </svg>
            <input type="file" accept="image/*" className="hidden" onChange={handleProfilePictureUpload} />
          </label>
        </div>
        <h2 className="text-2xl font-normal text-text-primary mb-2">Alex Morgan</h2>
        <p className="text-text-secondary font-normal">Event Organizer</p>

        {/* Followers/Following */}
        <div className="flex items-center justify-center space-x-6 mt-4">
          <div className="text-center">
            <div className="text-lg font-medium text-text-primary">1.2k</div>
            <div className="text-xs text-text-muted font-normal">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-medium text-text-primary">342</div>
            <div className="text-xs text-text-muted font-normal">Following</div>
          </div>
        </div>
      </div>

      {/* Events Section with Manage Toggle */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-text-secondary">{isManageMode ? "My Events" : "Upcoming Events"}</h3>
          <ManageEventsToggle isManageMode={isManageMode} onToggle={setIsManageMode} />
        </div>

        <div className="space-y-3">
          {eventsToShow.map((event) => (
            <EventCard key={event.id} event={event} isManageMode={isManageMode} onEdit={handleEditEvent} />
          ))}
        </div>

        {isManageMode && userCreatedEvents.length === 0 && (
          <div className="glass-card rounded-3xl p-8 text-center soft-shadow">
            <p className="text-text-muted">You haven't created any events yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
