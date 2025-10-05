"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { shareEvent } from "@/lib/utils"
import { getVisualStylingAsync } from "@/lib/visual-styling-utils"

interface Attendee {
  id: string
  name: string
  username: string
  profilePicture?: string | null
}

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location?: string
  createdBy: string
  icon: React.ReactNode
  gradient: string | null
  mediaUrl?: string | null
  mediaType?: string | null
  visualStyling?: string | null
  visualStylingUrl?: string | null
  attendees?: Attendee[]
  attendeeCount?: number
}

interface EventCardProps {
  event: Event
  isManageMode: boolean
  currentUserId: string
  onEdit: (eventId: string) => void
  onDelete: (eventId: string) => void
  onPreview: (event: Event) => void
}

export default function EventCard({ event, isManageMode, currentUserId, onEdit, onDelete, onPreview }: EventCardProps) {
  const canEdit = event.createdBy === currentUserId
  const [visualStyling, setVisualStyling] = useState<any>(null)
  const [isLoadingVisualStyling, setIsLoadingVisualStyling] = useState(false)

  // Load visual styling data (from R2 or inline)
  useEffect(() => {
    const loadVisualStyling = async () => {
      if (event.visualStylingUrl || event.visualStyling) {
        setIsLoadingVisualStyling(true)
        try {
          const styling = await getVisualStylingAsync(event)
          setVisualStyling(styling)
        } catch (error) {
          console.error('Error loading visual styling:', error)
          // Fall back to parsing inline visual styling
          if (event.visualStyling) {
            try {
              const parsed = typeof event.visualStyling === 'string' 
                ? JSON.parse(event.visualStyling) 
                : event.visualStyling;
              setVisualStyling(parsed);
            } catch (parseError) {
              console.error('Error parsing inline visual styling:', parseError);
            }
          }
        } finally {
          setIsLoadingVisualStyling(false)
        }
      }
    }

    loadVisualStyling()
  }, [event.visualStyling, event.visualStylingUrl])

  // Use AI-generated gradient if available, otherwise fall back to default
  const displayGradient = visualStyling?.styling?.gradient || event.gradient || 'from-gray-400 to-gray-600'

  // Helper function to format time with AM/PM
  const formatTimeWithAMPM = (timeString: string) => {
    try {
      // Parse the time string (assuming format like "14:30" or "2:30 PM")
      if (timeString.includes('AM') || timeString.includes('PM')) {
        return timeString // Already formatted
      }
      
      const [hours, minutes] = timeString.split(':').map(Number)
      const date = new Date()
      date.setHours(hours, minutes)
      
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } catch (error) {
      return timeString // Return original if parsing fails
    }
  }

  return (
    <div
      className="relative rounded-3xl overflow-hidden soft-shadow hover-lift transition-all duration-300 cursor-pointer h-80"
      onClick={() => onPreview(event)}
    >
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
          <div className={`w-full h-full ${displayGradient.includes('bg-gradient') ? displayGradient : `bg-gradient-to-br ${displayGradient}`}`} />
        )}
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      </div>

      <div className="relative h-full flex flex-col justify-between p-5 text-white">
        {/* Top section with AI indicator and action buttons */}
        <div className="flex justify-between items-start">
          {/* AI Styling Indicator */}
          {visualStyling && (
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-white shadow-lg">
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"/>
                </svg>
                <span>AI</span>
              </div>
            </div>
          )}
          
          <div className="flex space-x-2">
          {isManageMode && canEdit ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(event.id)
                }}
                className="p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm('Are you sure you want to delete this event?')) {
                    onDelete(event.id)
                  }
                }}
                className="p-2 rounded-xl bg-red-500/20 backdrop-blur-sm text-white hover:bg-red-500/30 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                await shareEvent(event.id, event.title);
              }}
              className="p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"></path>
              </svg>
            </button>
          )}
          </div>
        </div>

        {/* Bottom section with event details */}
        <div>
          <h4 className="font-semibold text-xl mb-2 drop-shadow-lg">{event.title}</h4>
          <p className="text-sm text-white/90 mb-3 font-normal leading-relaxed drop-shadow-md line-clamp-2">
            {event.description}
          </p>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-xs text-white/80 drop-shadow-md">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                ></path>
              </svg>
              {event.date} • {formatTimeWithAMPM(event.time)}
            </div>
            
            {/* Attendees */}
            {event.attendeeCount && event.attendeeCount > 0 && (
              <div className="flex items-center space-x-1">
                {event.attendees && event.attendees.length > 0 && (
                  <div className="flex -space-x-1">
                    {event.attendees.slice(0, 3).map((attendee, index) => (
                      <div
                        key={attendee.id}
                        className="w-6 h-6 rounded-full border border-white overflow-hidden shadow-sm"
                        style={{ zIndex: 10 - index }}
                      >
                        {attendee.profilePicture ? (
                          <img
                            src={attendee.profilePicture}
                            alt={attendee.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <span className="text-xs text-white/80">
                  {event.attendeeCount} attending
                </span>
              </div>
            )}
          </div>
          
          {event.location && (
            <div className="flex items-center text-xs text-white/80 drop-shadow-md">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                ></path>
              </svg>
              {event.location}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
