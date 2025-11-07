"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { shareEvent } from "@/lib/utils"
import { getVisualStylingAsync } from "@/lib/visual-styling-utils"
import ReportDialog from "@/components/ReportDialog"

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
  thumbnailUrl?: string | null
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
  const [showReportDialog, setShowReportDialog] = useState(false)

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
      className="relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer h-80 group"
      onClick={() => onPreview(event)}
    >
      <div className="absolute inset-0">
        {event.thumbnailUrl ? (
          <>
            {/* Gradient placeholder that shows while thumbnail loads */}
            <div className={`absolute inset-0 w-full h-full ${displayGradient.includes('bg-gradient') ? displayGradient : `bg-gradient-to-br ${displayGradient}`}`} />
            {/* AI-generated thumbnail with optimized loading */}
            <img
              src={event.thumbnailUrl}
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="eager"
              fetchPriority="high"
              onLoad={(e) => {
                // Fade in smoothly when loaded
                e.currentTarget.style.opacity = '1'
              }}
              onError={(e) => {
                // If thumbnail fails to load (e.g., expired URL), hide it and fall back to gradient
                console.warn('Thumbnail failed to load:', event.thumbnailUrl);
                e.currentTarget.style.display = 'none';
              }}
              style={{ opacity: 0, transition: 'opacity 0.4s ease-in-out' }}
            />
          </>
        ) : event.mediaUrl && event.mediaType === "image" ? (
          <img
            src={event.mediaUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : event.mediaUrl && event.mediaType === "video" ? (
          // Show a static thumbnail for videos instead of playing them
          <div className="relative w-full h-full">
            <video
              src={event.mediaUrl}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              muted
              playsInline
            />
            {/* Play icon overlay to indicate it's a video */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl">
                <svg className="w-8 h-8 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className={`w-full h-full ${displayGradient.includes('bg-gradient') ? displayGradient : `bg-gradient-to-br ${displayGradient}`} transition-transform duration-500 group-hover:scale-105`} />
        )}
        {/* Refined gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {/* Subtle inner border for premium feel */}
        <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />
      </div>

      <div className="relative h-full flex flex-col justify-between p-5 text-white">
        {/* Top section with action buttons */}
        <div className="flex justify-end items-start">
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
            <>
              {/* Report Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReportDialog(true);
                }}
                className="p-2.5 rounded-xl bg-red-500/30 backdrop-blur-md text-white hover:bg-red-500/40 transition-all duration-200 shadow-lg ring-1 ring-white/20"
                title="Report event"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
              </button>
              {/* Share Button with Pulsing Animation */}
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  await shareEvent(event.id, event.title);
                }}
                className="p-2.5 rounded-xl bg-white/30 backdrop-blur-md text-white hover:bg-white/40 transition-all duration-200 shadow-lg ring-1 ring-white/20 animate-pulse-subtle"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </>
          )}
          </div>
        </div>

        {/* Bottom section with event details */}
        <div>
          <h4 className="font-semibold text-xl mb-2 drop-shadow-lg tracking-tight">{event.title}</h4>
          <p className="text-sm text-white/95 mb-3 font-light leading-relaxed drop-shadow-md line-clamp-2">
            {event.description}
          </p>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-xs text-white/90 drop-shadow-md font-medium">
              <svg className="w-4 h-4 mr-1.5 opacity-90" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="tracking-wide">{event.date} • {formatTimeWithAMPM(event.time)}</span>
            </div>
            
            {/* Attendees - Refined Design */}
            {event.attendeeCount && event.attendeeCount > 0 && (
              <div className="flex items-center space-x-2">
                {event.attendees && event.attendees.length > 0 && (
                  <div className="flex -space-x-2">
                    {event.attendees.slice(0, 3).map((attendee, index) => (
                      <div
                        key={attendee.id}
                        className="w-7 h-7 rounded-full border-2 border-white overflow-hidden shadow-md ring-1 ring-black/10"
                        style={{ zIndex: 10 - index }}
                      >
                        {attendee.profilePicture ? (
                          <img
                            src={attendee.profilePicture}
                            alt={attendee.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <span className="text-xs text-white/90 font-medium tracking-wide">
                  {event.attendeeCount} attending
                </span>
              </div>
            )}
          </div>
          
          {event.location && (
            <div className="flex items-center text-xs text-white/90 drop-shadow-md font-medium">
              <svg className="w-4 h-4 mr-1.5 opacity-90" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="tracking-wide">{event.location}</span>
            </div>
          )}
        </div>
      </div>

      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        reporterId={currentUserId}
        reportedEventId={event.id}
        contentType="event"
        contentName={event.title}
      />
    </div>
  )
}
