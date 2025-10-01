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

// Calendar icon with exact colors from the provided image
const getEventIcon = () => {
    return (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#CD8B6B' }}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                {/* Calendar body with rounded corners */}
                <path 
                    d="M19 4H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" 
                    fill="#F5E8D5" 
                />
                {/* Spiral binding rings */}
                <rect x="7" y="1" width="2" height="4" rx="1" fill="#F5E8D5" />
                <rect x="15" y="1" width="2" height="4" rx="1" fill="#F5E8D5" />
                {/* Calendar grid - subtle squares */}
                <rect x="6" y="9" width="2" height="2" rx="0.3" fill="#CD8B6B" opacity="0.3" />
                <rect x="9" y="9" width="2" height="2" rx="0.3" fill="#CD8B6B" opacity="0.3" />
                <rect x="12" y="9" width="2" height="2" rx="0.3" fill="#CD8B6B" opacity="0.3" />
                <rect x="15" y="9" width="2" height="2" rx="0.3" fill="#CD8B6B" opacity="0.3" />
                <rect x="6" y="12" width="2" height="2" rx="0.3" fill="#CD8B6B" opacity="0.3" />
                <rect x="9" y="12" width="2" height="2" rx="0.3" fill="#CD8B6B" opacity="0.3" />
                <rect x="12" y="12" width="2" height="2" rx="0.3" fill="#CD8B6B" opacity="0.3" />
                <rect x="15" y="12" width="2" height="2" rx="0.3" fill="#CD8B6B" opacity="0.3" />
                <rect x="6" y="15" width="2" height="2" rx="0.3" fill="#CD8B6B" opacity="0.3" />
                <rect x="9" y="15" width="2" height="2" rx="0.3" fill="#CD8B6B" opacity="0.3" />
            </svg>
        </div>
    );
};

export default function EventPreviewModal({ event, isOpen, onClose, currentUserId }: EventPreviewModalProps) {
  const [isJoining, setIsJoining] = useState(false)
  const [isParticipating, setIsParticipating] = useState(false)
  const [isCheckingParticipation, setIsCheckingParticipation] = useState(false)
  const [participantCount, setParticipantCount] = useState(0)

  // Check if user is already participating and get participant count when modal opens
  useEffect(() => {
    if (isOpen && event) {
      // Get participant count
      fetch(`/api/events/${event.id}/participants`)
        .then(res => res.json())
        .then(data => {
          setParticipantCount(data.count || 0)
        })
        .catch(error => {
          console.error('Error fetching participant count:', error)
        })

      // Check if current user is participating
      if (currentUserId && currentUserId !== event.createdBy) {
        setIsCheckingParticipation(true)
        fetch(`/api/events/join?eventId=${event.id}&userId=${currentUserId}`)
          .then(res => res.json())
          .then(data => {
            setIsParticipating(data.participating)
          })
          .catch(error => {
            console.error('Error checking participation:', error)
          })
          .finally(() => {
            setIsCheckingParticipation(false)
          })
      }
    }
  }, [isOpen, event, currentUserId])

  const handleJoinToggle = async () => {
    if (!event || !currentUserId) return

    setIsJoining(true)
    try {
      const method = isParticipating ? 'DELETE' : 'POST'
      const response = await fetch('/api/events/join', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          userId: currentUserId,
        }),
      })

      if (response.ok) {
        setIsParticipating(!isParticipating)
        // Update participant count
        setParticipantCount(prev => isParticipating ? prev - 1 : prev + 1)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update event participation')
      }
    } catch (error) {
      console.error('Error updating participation:', error)
      alert('Failed to update event participation')
    } finally {
      setIsJoining(false)
    }
  }

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
          {event.mediaUrl && event.mediaType ? (
            // Show actual media if available
            event.mediaType === 'image' ? (
              <img
                src={event.mediaUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : event.mediaType === 'video' ? (
              <video
                src={event.mediaUrl}
                className="w-full h-full object-cover"
                controls
                poster=""
              />
            ) : (
              // Fallback to icon if media type is unknown
              <div className="w-full h-full bg-gradient-to-br from-cream-300 to-cream-400 flex items-center justify-center">
                <div
                  className={`w-20 h-20 bg-gradient-to-br ${event.gradient || "from-taupe-400 to-taupe-500"} rounded-2xl flex items-center justify-center shadow-lg`}
                >
                  {typeof event.icon === 'string' ? getEventIcon() : (event.icon || getEventIcon())}
                </div>
              </div>
            )
          ) : (
            // Show icon if no media available
            <div className="w-full h-full bg-gradient-to-br from-cream-300 to-cream-400 flex items-center justify-center">
              <div
                className={`w-20 h-20 bg-gradient-to-br ${event.gradient || "from-taupe-400 to-taupe-500"} rounded-2xl flex items-center justify-center shadow-lg`}
              >
                {typeof event.icon === 'string' ? getEventIcon() : (event.icon || getEventIcon())}
              </div>
            </div>
          )}
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
              <div className="text-xs text-text-muted">
                {participantCount} {participantCount === 1 ? 'person' : 'people'} joined
              </div>
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
                onClick={handleJoinToggle}
                disabled={isJoining || isCheckingParticipation}
                className={`w-full py-4 rounded-2xl font-semibold text-base modal-button disabled:opacity-50 ${isParticipating
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                  : "bg-gradient-to-r from-sand-500 to-sand-600 text-white"
                  }`}
              >
                {isCheckingParticipation
                  ? "Loading..."
                  : isJoining
                    ? (isParticipating ? "Leaving..." : "Joining...")
                    : (isParticipating ? "Leave Event" : "Join Event")
                }
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
