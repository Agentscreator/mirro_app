"use client"

import React, { useState, useRef, useEffect } from "react"
import { shareEvent } from "@/lib/utils"
import { getVisualStylingAsync } from "@/lib/visual-styling-utils"
import ReportDialog from "@/components/ReportDialog"

interface Attendee {
  id: string
  name: string
  username: string
  profilePicture?: string | null
}

interface MediaGalleryItem {
  url: string
  type: 'image' | 'video'
  uploadedAt: string
  uploadedBy: string
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
  thumbnailUrl?: string | null
  backgroundUrl?: string | null
  visualStyling?: string | null
  visualStylingUrl?: string | null
  mediaGallery?: MediaGalleryItem[] | null | string
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
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [lightboxMedia, setLightboxMedia] = useState<MediaGalleryItem | null>(null)
  const [mediaGallery, setMediaGallery] = useState<MediaGalleryItem[]>([])
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)
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
      
      // Preload background image for instant display
      if (event?.backgroundUrl) {
        const img = new Image()
        img.src = event.backgroundUrl
      }
    }
  }, [event, isOpen])

  // Load media gallery
  useEffect(() => {
    const allMedia: MediaGalleryItem[] = []
    
    // Add media from gallery
    if (event?.mediaGallery) {
      try {
        const gallery = typeof event.mediaGallery === 'string'
          ? JSON.parse(event.mediaGallery)
          : event.mediaGallery
        if (gallery && Array.isArray(gallery)) {
          allMedia.push(...gallery)
        }
      } catch (e) {
        console.error('Error parsing media gallery:', e)
      }
    }
    
    // Also add the primary mediaUrl if it exists and isn't already in gallery
    if (event?.mediaUrl && event?.mediaType) {
      const mediaExists = allMedia.some(item => item.url === event.mediaUrl)
      if (!mediaExists) {
        allMedia.unshift({
          url: event.mediaUrl,
          type: event.mediaType as 'image' | 'video',
          uploadedAt: new Date().toISOString(),
          uploadedBy: event.createdBy
        })
      }
    }
    
    setMediaGallery(allMedia)
  }, [event])

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
      setBackgroundLoaded(false)
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
      <div className="relative rounded-3xl max-w-sm w-full h-[85vh] overflow-hidden shadow-2xl animate-slide-up ring-1 ring-black/5">
        {/* Full Screen Stylized Background - Inspired by Thumbnail */}
        {event.backgroundUrl ? (
          <div className="absolute inset-0 z-0">
            {/* Gradient placeholder that shows immediately with shimmer animation */}
            <div className={`absolute inset-0 ${visualStyling?.styling?.gradient || event.gradient || 'bg-gradient-to-br from-taupe-400 via-taupe-500 to-taupe-600'}`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              {/* Shimmer effect while loading */}
              {!backgroundLoaded && (
                <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" 
                     style={{ backgroundSize: '200% 100%' }}></div>
              )}
            </div>
            {/* AI background image with optimized loading */}
            <img
              src={event.backgroundUrl}
              alt="Event background"
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
              fetchPriority="high"
              onLoad={(e) => {
                // Fade in smoothly when loaded
                e.currentTarget.style.opacity = '1'
                setBackgroundLoaded(true)
              }}
              style={{ opacity: 0, transition: 'opacity 0.5s ease-in-out' }}
            />
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>
          </div>
        ) : event.thumbnailUrl ? (
          // If no background, use thumbnail as artistic blurred background
          <div className="absolute inset-0 z-0">
            {/* Gradient placeholder with shimmer */}
            <div className={`absolute inset-0 ${visualStyling?.styling?.gradient || event.gradient || 'bg-gradient-to-br from-taupe-400 via-taupe-500 to-taupe-600'}`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              {/* Shimmer effect while loading */}
              {!backgroundLoaded && (
                <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" 
                     style={{ backgroundSize: '200% 100%' }}></div>
              )}
            </div>
            {/* Blurred thumbnail with optimized loading */}
            <img
              src={event.thumbnailUrl}
              alt="Event background"
              className="absolute inset-0 w-full h-full object-cover scale-125 blur-3xl"
              loading="eager"
              fetchPriority="high"
              onLoad={(e) => {
                e.currentTarget.style.opacity = '1'
                setBackgroundLoaded(true)
              }}
              style={{ opacity: 0, transition: 'opacity 0.5s ease-in-out' }}
            />
            {/* Strong overlay for better text readability on blurred background */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70"></div>
            {/* Subtle color wash for artistic effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20"></div>
          </div>
        ) : (
          // Fallback: Use visual styling gradient or elegant default
          <div className={`absolute inset-0 z-0 ${visualStyling?.styling?.gradient || event.gradient || 'bg-gradient-to-br from-taupe-400 via-taupe-500 to-taupe-600'}`}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>
        )}

        {/* Close Button - Refined */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-50 w-11 h-11 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all duration-200 shadow-xl active:scale-95 ring-1 ring-white/20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content Section - Full height, overlaid on background */}
        <div className="relative h-full overflow-y-auto z-10">
          <div className="relative pt-20 px-6 pb-6 flex flex-col min-h-full">
            {/* Event Title with AI font styling - White text with shadow for readability */}
            <h2 className={`text-4xl ${visualStyling?.styling?.font || 'font-bold'} text-white tracking-tight mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]`}>
              {event.title}
            </h2>



            {/* Date, Location, and Attendees */}
            <div className="flex items-start gap-3 mb-5">
              {/* Date Box with semi-transparent white background */}
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3.5 text-center shadow-lg relative ring-1 ring-white/30 flex-shrink-0">
                <div className="relative z-10 text-white">
                  <div className="text-3xl font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-tight leading-none">{day}</div>
                  <div className="text-xs font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] uppercase tracking-wider mt-1">{month}</div>
                </div>
              </div>

              {/* Event Details - White text with shadows */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-1.5 mb-2">
                  <svg className="w-4 h-4 text-white/90 mt-0.5 flex-shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-semibold tracking-tight truncate drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                      {event.location || "Location TBD"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  <svg className="w-4 h-4 text-white/90 flex-shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-white/95 font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">{formatTimeWithAMPM(event.time)}</div>
                </div>
                {/* Attendees Count */}
                {event.attendeeCount && event.attendeeCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-white/90 flex-shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    <div className="text-sm text-white/95 font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">{event.attendeeCount} attending</div>
                  </div>
                )}
              </div>

              {/* Attendees Avatars - Clickable to expand */}
              <div className="flex flex-col items-end relative flex-shrink-0">
                {attendeesToShow.length > 0 && (
                  <button
                    onClick={() => setShowAttendeeList(!showAttendeeList)}
                    className="flex -space-x-2 hover:scale-105 transition-transform duration-200 cursor-pointer"
                  >
                    {attendeesToShow.slice(0, maxVisibleAvatars).map((attendee, index) => (
                      <div
                        key={attendee.id}
                        className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-lg ring-1 ring-black/10"
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
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                    {hasMoreAttendees && (
                      <div
                        className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-lg ring-1 ring-black/10"
                        style={{ zIndex: 5 }}
                      >
                        <span className="text-xs font-bold text-gray-700">
                          +{attendeesToShow.length - maxVisibleAvatars}
                        </span>
                      </div>
                    )}
                  </button>
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
              <div className="mb-5 bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-lg">
                <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">About</h3>
                <p className="text-sm text-white/95 leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">{event.description}</p>
              </div>
            )}

            {/* Media Gallery - Aesthetic Masonry Layout */}
            {mediaGallery.length > 0 && (
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-3 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Photos & Videos</h3>
                <div className="grid grid-cols-2 gap-2 -mx-6 px-6">
                  {mediaGallery.map((item, index) => {
                    // Create varying heights for aesthetic layout
                    const heights = ['h-32', 'h-40', 'h-36', 'h-44', 'h-32', 'h-48', 'h-36', 'h-40']
                    const height = heights[index % heights.length]
                    // Some items span 2 columns for variety
                    const span = (index === 0 || (index > 0 && index % 5 === 0)) ? 'col-span-2' : 'col-span-1'
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setLightboxMedia(item)}
                        className={`relative ${span} ${height} rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 group`}
                      >
                        {item.type === 'image' ? (
                          <img src={item.url} alt="Gallery" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <>
                            <video src={item.url} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <svg className="w-10 h-10 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                              </svg>
                            </div>
                          </>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons - More Subtle */}
            <div className="space-y-2.5 mt-8 sticky bottom-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent backdrop-blur-md pt-5 -mx-6 px-6 pb-3">
              {currentUserId ? (
                <>
                  {/* Primary Action Button - Join/Leave/Hosting */}
                  <button
                    onClick={handleJoinEvent}
                    disabled={isJoining || (event.createdBy === currentUserId && isJoined)}
                    className={`w-full py-3 rounded-xl font-medium text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 ${event.createdBy === currentUserId
                      ? 'bg-white/15 text-white/80 cursor-default backdrop-blur-sm border border-white/20'
                      : isJoined
                        ? 'bg-white/15 text-white/90 hover:bg-white/20 backdrop-blur-sm border border-white/20'
                        : 'bg-white/15 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20'
                      }`}
                  >
                    {isJoining ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        <span>{isJoined ? 'Leaving...' : 'Joining...'}</span>
                      </div>
                    ) : event.createdBy === currentUserId ? (
                      <div className="flex items-center justify-center space-x-1.5">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span>You're Hosting</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-1.5">
                        {isJoined ? (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>You're Going</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                            </svg>
                            <span>Join Event</span>
                          </>
                        )}
                      </div>
                    )}
                  </button>

                  {/* Secondary Actions - Share and Report */}
                  <div className="flex gap-2">
                    {/* Share Button */}
                    <button
                      onClick={handleShareEvent}
                      className="flex-1 bg-white/10 backdrop-blur-sm py-2.5 rounded-lg font-medium text-sm text-white/80 hover:bg-white/15 hover:text-white transition-all duration-200 flex items-center justify-center gap-1.5 border border-white/10"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      <span>Share</span>
                    </button>

                    {/* Report Button - Only show if not the creator */}
                    {event.createdBy !== currentUserId && (
                      <button
                        onClick={() => setShowReportDialog(true)}
                        className="px-3 py-2.5 bg-white/10 backdrop-blur-sm hover:bg-red-500/15 rounded-lg flex items-center justify-center text-white/80 hover:text-white transition-all duration-200 font-medium text-sm border border-white/10 hover:border-red-400/30"
                        title="Report event"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Join Button for Non-logged in Users - Gold */}
                  <button
                    onClick={() => {
                      if (onSignUpRequest) {
                        onSignUpRequest()
                      } else {
                        onClose()
                      }
                    }}
                    className={`w-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-gray-900 py-3.5 rounded-xl ${visualStyling?.styling?.font || 'font-semibold'} text-base hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] shadow-lg`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                      </svg>
                      <span>Join Event</span>
                    </div>
                  </button>

                  {/* Share Button for Non-logged in Users */}
                  <button
                    onClick={handleShareEvent}
                    className="w-full bg-white/10 backdrop-blur-sm py-2.5 rounded-lg font-medium text-sm text-white/80 hover:bg-white/15 hover:text-white transition-all duration-200 flex items-center justify-center gap-1.5 border border-white/10"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>Share Event</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Dialog */}
      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        reporterId={currentUserId}
        reportedEventId={event.id}
        contentType="event"
        contentName={event.title}
      />

      {/* Media Lightbox */}
      {lightboxMedia && (
        <div
          className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxMedia(null)}
        >
          <button
            onClick={() => setLightboxMedia(null)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200 z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            {lightboxMedia.type === 'image' ? (
              <img
                src={lightboxMedia.url}
                alt="Full size"
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <video
                src={lightboxMedia.url}
                controls
                autoPlay
                className="w-full h-full object-contain rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
