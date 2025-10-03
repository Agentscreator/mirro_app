"use client"

import React, { useState, useRef } from "react"

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
}

export default function EventPreviewModal({ event, isOpen, onClose, currentUserId }: EventPreviewModalProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [showVideoControls, setShowVideoControls] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const [isVideoLoading, setIsVideoLoading] = useState(true)
  const [videoError, setVideoError] = useState(false)
  const [videoDuration, setVideoDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Parse visual styling if available
  let visualStyling = null
  try {
    if (event?.visualStyling) {
      visualStyling = JSON.parse(event.visualStyling)
    }
  } catch (error) {
    console.error('Error parsing visual styling:', error)
  }

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

  // Early return after all hooks
  if (!isOpen || !event) return null

  const { day, month } = formatDate(event.date)
  const attendeesToShow = event.attendees || []

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative rounded-3xl max-w-sm w-full h-[85vh] overflow-hidden soft-shadow bg-white">
        {/* AI Styling Indicator */}
        {visualStyling && (
          <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-700 shadow-lg">
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" />
              </svg>
              <span>AI Styled</span>
            </div>
          </div>
        )}

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

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content Section - Lower portion */}
        <div className="h-[55%] p-6 flex flex-col justify-between">
          {/* Event Title with AI font styling */}
          <h2 className={`text-2xl ${visualStyling?.styling?.font || 'font-semibold'} text-gray-800 mb-4`}>
            {event.title}
          </h2>

          {/* AI Styling Info */}
          {visualStyling && (
            <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
              <div className="flex items-center space-x-2 mb-1">
                <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" />
                </svg>
                <span className="text-sm font-medium text-purple-700">AI Enhanced Design</span>
              </div>
              <p className="text-xs text-purple-600 mb-2">{visualStyling.mood}</p>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-purple-600">Theme:</span>
                <span className="text-xs font-medium text-purple-700 capitalize">{visualStyling.styling.theme}</span>
                <div className="flex space-x-1 ml-2">
                  {visualStyling.colorPalette?.slice(0, 3).map((color: string, index: number) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full bg-${color}-500 border border-white shadow-sm`}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Date, Location, and Attendees */}
          <div className="flex items-center justify-between mb-4">
            {/* Date Box with AI color theming */}
            <div className={`${displayGradient.includes('bg-gradient') ? displayGradient : `bg-gradient-to-br ${displayGradient}`} rounded-2xl p-3 text-center text-white shadow-lg`}>
              <div className="text-2xl font-bold">{day}</div>
              <div className="text-xs font-medium">{month}</div>
            </div>

            {/* Event Details */}
            <div className="flex-1 mx-4">
              <div className="text-sm text-gray-800 font-medium mb-1">
                {event.location || "Location TBD"}
              </div>
              <div className="text-xs text-gray-600">
                Venue: {event.location?.split(",")[0] || "TBD"}
              </div>
              <div className="text-xs text-gray-600">{formatTimeWithAMPM(event.time)}</div>
            </div>

            {/* Attendees */}
            <div className="flex flex-col items-end">
              <div className="flex -space-x-2 mb-1">
                {attendeesToShow.slice(0, 3).map((attendee, index) => (
                  <div
                    key={attendee.id}
                    className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-lg"
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
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {event.attendeeCount && event.attendeeCount > 0 && (
                <div className="text-xs text-gray-600">
                  {event.attendeeCount} attending
                </div>
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
          <div className="space-y-3 mt-auto">
            <button className={`w-full ${displayGradient.includes('bg-gradient') ? displayGradient : `bg-gradient-to-r ${displayGradient.replace('from-', 'from-').replace('to-', 'to-')}`} text-white py-4 rounded-2xl ${visualStyling?.styling?.font || 'font-semibold'} text-base hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg`}>
              Join Event
            </button>

            <button className="w-full bg-gray-100 py-3 rounded-2xl font-medium text-gray-700 hover:bg-gray-200 transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm">
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
