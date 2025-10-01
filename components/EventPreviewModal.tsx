"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Event } from "@/lib/db/schema"

interface EventWithCreator extends Omit<Event, 'icon'> {
  creatorName?: string
  creatorUsername?: string
  icon?: React.ReactNode | string
}

interface EventPreviewModalProps {
  event: EventWithCreator | null
  isOpen: boolean
  onClose: () => void
  currentUserId?: string
}

// Icon components for different event types
const getEventIcon = (iconType?: string) => {
  switch (iconType) {
    case 'music':
      return (
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"></path>
        </svg>
      );
    case 'photography':
      return (
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
        </svg>
      );
    case 'community':
      return (
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
        </svg>
      );
    case 'sports':
      return (
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"></path>
        </svg>
      );
    default:
      return (
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
        </svg>
      );
  }
};

export default function EventPreviewModal({ event, isOpen, onClose, currentUserId }: EventPreviewModalProps) {
  const [isJoining, setIsJoining] = useState(false)

  if (!isOpen || !event) return null

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const day = date.getDate()
    const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
    return { day, month }
  }

  const { day, month } = formatDate(event.date)

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
      <div className="modal-glass-card rounded-3xl max-w-sm w-full max-h-[90vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/30 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Event Media */}
        <div className="relative h-64 overflow-hidden rounded-t-3xl">
          <div className="w-full h-full bg-gradient-to-br from-cream-300 to-cream-400 flex items-center justify-center">
            <div
              className={`w-20 h-20 bg-gradient-to-br ${event.gradient || "from-taupe-400 to-taupe-500"} rounded-2xl flex items-center justify-center shadow-lg`}
            >
              {typeof event.icon === 'string' ? getEventIcon(event.icon) : (event.icon || getEventIcon())}
            </div>
          </div>
        </div>

        {/* Event Content */}
        <div className="p-6">
          {/* Event Title */}
          <h2 className="text-xl font-medium text-text-primary mb-4 text-center">{event.title}</h2>

          {/* Date and Time Info */}
          <div className="flex items-center justify-between mb-6">
            {/* Date Box */}
            <div className="bg-gradient-to-br from-sand-400 to-sand-500 rounded-2xl p-3 text-center text-white shadow-md">
              <div className="text-lg font-bold">{day}</div>
              <div className="text-xs font-medium">{month}</div>
            </div>

            {/* Event Details */}
            <div className="flex-1 ml-4">
              <div className="text-sm text-text-secondary font-medium mb-1">{event.location}</div>
              <div className="text-xs text-text-muted">Time: {event.time}</div>
              {event.creatorName && (
                <div className="text-xs text-text-muted">By: {event.creatorName}</div>
              )}
            </div>

            {/* Creator Avatar */}
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm bg-gradient-to-br from-taupe-400 to-taupe-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="mb-6">
              <p className="text-sm text-text-secondary leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            {currentUserId !== event.createdBy && (
              <button
                onClick={() => setIsJoining(!isJoining)}
                disabled={isJoining}
                className="w-full bg-gradient-to-r from-sand-500 to-sand-600 text-white py-4 rounded-2xl font-semibold text-base modal-button disabled:opacity-50"
              >
                {isJoining ? "Joining..." : "Join Event"}
              </button>
            )}

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: event.title,
                    text: event.description,
                    url: window.location.href,
                  });
                } else {
                  // Fallback: copy to clipboard
                  navigator.clipboard.writeText(`${event.title} - ${event.description} on ${event.date} at ${event.time}`);
                  alert('Event details copied to clipboard!');
                }
              }}
              className="w-full glass-card py-3 rounded-2xl font-medium text-text-secondary hover:bg-white/70 hover:text-text-primary modal-button flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"></path>
              </svg>
              <span>Share Event</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
