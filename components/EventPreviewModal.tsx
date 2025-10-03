"use client"

import type React from "react"

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location?: string
  createdBy: string
  icon?: React.ReactNode | string
  gradient: string | null
  mediaUrl?: string | null
  mediaType?: string | null
  creatorName?: string
  creatorUsername?: string
  attendees?: Array<{
    id: number
    name: string
    avatar: string
  }>
}

interface EventPreviewModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
  currentUserId: string
}

export default function EventPreviewModal({ event, isOpen, onClose, currentUserId }: EventPreviewModalProps) {
  if (!isOpen || !event) return null

  const sampleAttendees = [
    { id: 1, name: "Sarah", avatar: "/diverse-woman-smiling.png" },
    { id: 2, name: "Mike", avatar: "/casual-man.png" },
    { id: 3, name: "Emma", avatar: "/professional-woman.png" },
  ]

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const day = date.getDate()
    const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
    return { day, month }
  }

  const { day, month } = formatDate(event.date)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative rounded-3xl max-w-sm w-full h-[85vh] overflow-hidden soft-shadow">
        <div className="absolute inset-0">
          {event.mediaUrl && event.mediaType === "image" ? (
            <img
              src={event.mediaUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : event.mediaUrl && event.mediaType === "video" ? (
            <video
              src={event.mediaUrl}
              className="w-full h-full object-cover"
              muted
              loop
              autoPlay
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${event.gradient || 'from-gray-400 to-gray-600'}`} />
          )}
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative h-full flex flex-col justify-between p-6 text-white">
          {/* Top spacing for close button */}
          <div className="h-12" />

          {/* Bottom content */}
          <div>
            {/* Event Title */}
            <h2 className="text-2xl font-semibold text-white mb-4 drop-shadow-lg">{event.title}</h2>

            {/* Date, Location, and Attendees */}
            <div className="flex items-center justify-between mb-4">
              {/* Date Box */}
              <div className="bg-sand-500/90 backdrop-blur-sm rounded-2xl p-3 text-center text-white shadow-lg">
                <div className="text-2xl font-bold">{day}</div>
                <div className="text-xs font-medium">{month}</div>
              </div>

              {/* Event Details */}
              <div className="flex-1 mx-4">
                <div className="text-sm text-white font-medium mb-1 drop-shadow-md">
                  {event.location || "Location TBD"}
                </div>
                <div className="text-xs text-white/80 drop-shadow-md">
                  Venue: {event.location?.split(",")[0] || "TBD"}
                </div>
                <div className="text-xs text-white/80 drop-shadow-md">{event.time}</div>
              </div>

              {/* Attendees */}
              <div className="flex -space-x-2">
                {sampleAttendees.slice(0, 3).map((attendee, index) => (
                  <div
                    key={attendee.id}
                    className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-lg"
                    style={{ zIndex: 10 - index }}
                  >
                    <img
                      src={attendee.avatar || "/placeholder.svg"}
                      alt={attendee.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="mb-6 bg-black/20 backdrop-blur-sm rounded-2xl p-4">
                <p className="text-sm text-white/90 leading-relaxed drop-shadow-md">{event.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-sand-500 to-sand-600 text-white py-4 rounded-2xl font-semibold text-base hover:from-sand-600 hover:to-sand-700 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg">
                Join Event
              </button>

              <button className="w-full bg-white/20 backdrop-blur-md py-3 rounded-2xl font-medium text-white hover:bg-white/30 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"></path>
                </svg>
                <span>Share Event</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
