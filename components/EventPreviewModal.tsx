"use client"

import React, { useState, useRef, useEffect } from "react"
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
  icon?: React.ReactNode | string
  gradient: string | null
  mediaUrl?: string | null
  mediaType?: string | null
  visualStyling?: string | null
  visualStylingUrl?: string | null
  creatorName?: string
  creatorUsername?: string
  attendees?: Attendee[]
  attendeeCount?: number
}

interface EventPreviewModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
  currentUserId: string
  onJoinStatusChange?: () => void
  onSignUpRequest?: () => void
}

export default function EventPreviewModal({ event, isOpen, onClose, currentUserId, onJoinStatusChange, onSignUpRequest }: EventPreviewModalProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [showVideoControls, setShowVideoControls] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const [isVideoLoading, setIsVideoLoading] = useState(true)
  const [videoError, setVideoError] = useState(false)
  const [videoDuration, setVideoDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isJoined, setIsJoined] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [visualStyling, setVisualStyling] = useState<any>(null)
  const [, setIsLoadingVisualStyling] = useState(false)
  const [showAttendeeList, setShowAttendeeList] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Load visual styling data (from R2 or inline)
  useEffect(() => {
    const loadVisualStyling = async () => {
      if (event && (event.visualStylingUrl || event.visualStyling)) {
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

    if (isOpen) {
      loadVisualStyling()
    }
  }, [event, isOpen])

  // Use AI-generated gradient if available, otherwise fall back to default
  const displayGradient = visualStyling?.styling?.gradient || event?.gradient || 'from-gray-400 to-gray-600'

  // Helper functions
  const updateVideoProgress = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100
      setVideoProgress(progress || 0)
      setCurrentTime(videoRef.current.currentTime)
      setVideoDuration(videoRef.current.duration)
    }
  }

  // Check if user is joined when modal opens
  React.useEffect(() => {
    if (isOpen && event && currentUserId) {
      // If current user is the host, they're automatically considered joined
      if (event.createdBy === currentUserId) {
        setIsJoined(true);
      } else {
        fetch(`/api/events/${event.id}/join?userId=${currentUserId}`)
          .then(res => res.json())
          .then(data => setIsJoined(data.joined))
          .catch(console.error);
      }
    }
  }, [isOpen, event, currentUserId]);

  // Reset video state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setIsVideoPlaying(false)
      setVideoProgress(0)
      setShowVideoControls(false)
      setIsVideoLoading(true)
      setVideoError(false)
      setVideoDuration(0)
      setCurrentTime(0)
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.currentTime = 0
      }
    }
  }, [isOpen])

  // Update progress while video is playing
  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isVideoPlaying && videoRef.current) {
      interval = setInterval(updateVideoProgress, 100)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isVideoPlaying])

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const day = date.getDate()
    const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
    return { day, month }
  }

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause()
        setIsVideoPlaying(false)
      } else {
        videoRef.current.play()
        setIsVideoPlaying(true)
      }
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(videoRef.current.muted)
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        videoRef.current.requestFullscreen()
      }
    }
  }

  const handleVideoEnded = () => {
    setIsVideoPlaying(false)
    setVideoProgress(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleJoinEvent = async () => {
    if (!currentUserId || !event) return;

    // Prevent host from leaving their own event
    if (event.createdBy === currentUserId && isJoined) {
      alert("You can't leave your own event as the host!");
      return;
    }

    setIsJoining(true);
    try {
      const method = isJoined ? 'DELETE' : 'POST';
      const response = await fetch(`/api/events/${event.id}/join`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUserId }),
      });

      if (response.ok) {
        setIsJoined(!isJoined);
        // Notify parent component to refresh event data
        if (onJoinStatusChange) {
          onJoinStatusChange();
        } else {
          // Fallback to reload if no callback provided
          window.location.reload();
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update event participation');
      }
    } catch (error) {
      console.error('Error updating event participation:', error);
      alert('Failed to update event participation');
    } finally {
      setIsJoining(false);
    }
  };

  const handleShareEvent = async () => {
    if (!event) return;
    await shareEvent(event.id, event.title);
  };

  // Early return after all hooks
  if (!isOpen || !event) return null

  const { day, month } = formatDate(event.date)
  const attendeesToShow = event.attendees || []
  const maxVisibleAvatars = 3
  const hasMoreAttendees = attendeesToShow.length > maxVisibleAvatars

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="relative rounded-3xl max-w-sm w-full h-[85vh] overflow-hidden shadow-2xl bg-white animate-slide-up ring-1 ring-black/5">


        {/* Media Section - Upper portion */}
        <div className="relative h-[45%] overflow-hidden rounded-t-3xl">
          {event.mediaUrl && event.mediaType === "image" ? (
            <img
              src={event.mediaUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : event.mediaUrl && event.mediaType === "video" ? (
            <div
              className="relative w-full h-full cursor-pointer"
              onClick={handleVideoClick}
              onMouseEnter={() => setShowVideoControls(true)}
              onMouseLeave={() => setShowVideoControls(false)}
            >
              <video
                ref={videoRef}
                src={event.mediaUrl}
                className="w-full h-full object-cover"
                muted={isMuted}
                autoPlay
                loop
                playsInline
                onEnded={handleVideoEnded}
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
                onLoadStart={() => setIsVideoLoading(true)}
                onCanPlay={() => setIsVideoLoading(false)}
                onError={() => {
                  setVideoError(true)
                  setIsVideoLoading(false)
                }}
              />

              {/* Video Loading Indicator */}
              {isVideoLoading && !videoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}

              {/* Video Error State */}
              {videoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-center text-white">
                    <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    <p className="text-sm opacity-75">Unable to load video</p>
                  </div>
                </div>
              )}

              {/* Video Controls Overlay */}
              <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${showVideoControls || !isVideoPlaying ? 'opacity-100' : 'opacity-0'
                }`}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleVideoClick()
                  }}
                  className="w-16 h-16 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all duration-200 shadow-lg"
                >
                  {isVideoPlaying ? (
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Video Control Buttons */}
              <div className={`absolute top-4 left-4 flex space-x-2 transition-opacity duration-300 ${showVideoControls ? 'opacity-100' : 'opacity-0'
                }`}>
                {/* Volume Control */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleMute()
                  }}
                  className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all duration-200 shadow-lg"
                >
                  {isMuted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                  )}
                </button>

                {/* Fullscreen Control */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFullscreen()
                  }}
                  className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all duration-200 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                  </svg>
                </button>
              </div>

              {/* Video Progress Indicator */}
              {(isVideoPlaying || showVideoControls) && videoDuration > 0 && (
                <div className="absolute bottom-4 left-4 right-4">
                  {/* Time Display */}
                  <div className="flex justify-between text-xs text-white/80 mb-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(videoDuration)}</span>
                  </div>

                  {/* Progress Bar */}
                  <div
                    className="w-full h-2 bg-white/30 rounded-full overflow-hidden cursor-pointer hover:h-3 transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (videoRef.current) {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const clickX = e.clientX - rect.left
                        const percentage = clickX / rect.width
                        const newTime = percentage * videoRef.current.duration
                        videoRef.current.currentTime = newTime
                        setVideoProgress(percentage * 100)
                      }
                    }}
                  >
                    <div
                      className="h-full bg-white rounded-full transition-all duration-100"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={`w-full h-full ${displayGradient.includes('bg-gradient') ? displayGradient : `bg-gradient-to-br ${displayGradient}`}`} />
          )}
        </div>

        {/* Close Button - Refined */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-11 h-11 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all duration-200 shadow-xl active:scale-95 ring-1 ring-white/20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content Section - Lower portion */}
        <div className="h-[55%] overflow-y-auto">
          <div className="p-6 flex flex-col min-h-full">
            {/* Event Title with AI font styling */}
            <h2 className={`text-2xl ${visualStyling?.styling?.font || 'font-semibold'} text-gray-900 tracking-tight mb-4`}>
              {event.title}
            </h2>



            {/* Date, Location, and Attendees */}
            <div className="flex items-center justify-between mb-4">
              {/* Date Box with AI color theming - Refined */}
              <div className={`${displayGradient.includes('bg-gradient') ? displayGradient : `bg-gradient-to-br ${displayGradient}`} rounded-2xl p-4 text-center shadow-xl relative ring-1 ring-black/10`}>
                {/* Dark overlay for better text contrast */}
                <div className="absolute inset-0 bg-black/25 rounded-2xl"></div>
                <div className="relative z-10 text-white">
                  <div className="text-3xl font-bold drop-shadow-md tracking-tight">{day}</div>
                  <div className="text-xs font-semibold drop-shadow-sm uppercase tracking-wider mt-0.5">{month}</div>
                </div>
              </div>

              {/* Event Details - Refined Typography */}
              <div className="flex-1 mx-4">
                <div className="text-sm text-gray-900 font-semibold mb-1.5 tracking-tight">
                  {event.location || "Location TBD"}
                </div>
                <div className="text-xs text-gray-600 font-medium mb-0.5">
                  Venue: {event.location?.split(",")[0] || "TBD"}
                </div>
                <div className="text-xs text-gray-500 font-medium">{formatTimeWithAMPM(event.time)}</div>
              </div>

              {/* Attendees - Clickable to expand */}
              <div className="flex flex-col items-end relative">
                <button
                  onClick={() => setShowAttendeeList(!showAttendeeList)}
                  className="flex -space-x-2 mb-1 hover:scale-105 transition-transform duration-200 cursor-pointer"
                  disabled={attendeesToShow.length === 0}
                >
                  {attendeesToShow.slice(0, maxVisibleAvatars).map((attendee, index) => (
                    <div
                      key={attendee.id}
                      className="w-11 h-11 rounded-full border-2 border-white overflow-hidden shadow-xl ring-1 ring-black/10"
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
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                  {hasMoreAttendees && (
                    <div
                      className="w-11 h-11 rounded-full border-2 border-white bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-xl ring-1 ring-black/10"
                      style={{ zIndex: 5 }}
                    >
                      <span className="text-xs font-bold text-gray-700">
                        +{attendeesToShow.length - maxVisibleAvatars}
                      </span>
                    </div>
                  )}
                </button>
                {event.attendeeCount && event.attendeeCount > 0 && (
                  <div className="text-xs text-gray-600">
                    {event.attendeeCount} attending
                  </div>
                )}

                {/* Attendee List Dropdown */}
                {showAttendeeList && attendeesToShow.length > 0 && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowAttendeeList(false)}
                    />

                    {/* Dropdown Panel */}
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Header */}
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                        <h3 className="text-sm font-semibold text-gray-800">
                          Attendees ({attendeesToShow.length})
                        </h3>
                        <button
                          onClick={() => setShowAttendeeList(false)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Attendee List */}
                      <div className="max-h-80 overflow-y-auto">
                        {attendeesToShow.map((attendee, index) => (
                          <div
                            key={attendee.id}
                            className={`px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors ${index !== attendeesToShow.length - 1 ? 'border-b border-gray-100' : ''
                              }`}
                          >
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 shadow-sm">
                              {attendee.profilePicture ? (
                                <img
                                  src={attendee.profilePicture}
                                  alt={attendee.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* Name and Username */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {attendee.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                @{attendee.username}
                              </p>
                            </div>

                            {/* Host Badge */}
                            {attendee.id === event.createdBy && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                Host
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="mb-6 bg-gray-50 rounded-2xl p-4">
                <p className="text-sm text-gray-700 leading-relaxed">{event.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 mt-6 sticky bottom-0 bg-white pt-4 -mx-6 px-6">
              {currentUserId ? (
                <button
                  onClick={handleJoinEvent}
                  disabled={isJoining || (event.createdBy === currentUserId && isJoined)}
                  className={`w-full py-4 rounded-2xl ${visualStyling?.styling?.font || 'font-semibold'} text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${event.createdBy === currentUserId
                    ? 'bg-green-100 text-green-700 cursor-default'
                    : isJoined
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                >
                  {isJoining ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>{isJoined ? 'Leaving...' : 'Joining...'}</span>
                    </div>
                  ) : event.createdBy === currentUserId ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Hosting Event</span>
                    </div>
                  ) : (
                    isJoined ? 'Leave Event' : 'Join Event'
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      if (onSignUpRequest) {
                        onSignUpRequest()
                      } else {
                        onClose()
                      }
                    }}
                    className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-2xl ${visualStyling?.styling?.font || 'font-semibold'} text-base hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg`}
                  >
                    Sign Up to Join Event
                  </button>
                  <button
                    onClick={() => {
                      if (onSignUpRequest) {
                        onSignUpRequest()
                      } else {
                        onClose()
                      }
                    }}
                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-2xl font-medium hover:bg-gray-200 transition-all duration-200"
                  >
                    Sign In
                  </button>
                </div>
              )}

              <button
                onClick={handleShareEvent}
                className="w-full bg-gradient-to-r from-taupe-600 to-taupe-700 py-3.5 rounded-2xl font-semibold text-white hover:from-taupe-700 hover:to-taupe-800 transition-all duration-300 flex items-center justify-center space-x-2.5 shadow-lg hover:shadow-xl active:scale-[0.98] ring-1 ring-taupe-800/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span className="tracking-wide">Share Event</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
