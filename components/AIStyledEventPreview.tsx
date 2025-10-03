"use client"

import React, { useState, useRef } from "react"

interface VisualStyling {
  theme: string
  energy: string
  formality: string
  mood: string
  visualElements: string[]
  colorPalette: string[]
  reasoning: string
  styling: {
    gradient: string
    primaryColor: string
    font: string
    layout: string
    theme: string
  }
}

interface Event {
  id?: string
  title: string
  description: string
  date: string
  time: string
  location: string
  mediaUrl?: string | null
  mediaType?: string | null
  visualStyling?: VisualStyling
}

interface AIStyledEventPreviewProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  onCustomize: (styling: any) => void
}

export default function AIStyledEventPreview({ 
  event, 
  isOpen, 
  onClose, 
  onEdit, 
  onCustomize 
}: AIStyledEventPreviewProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [showCustomization, setShowCustomization] = useState(false)
  const [customStyling, setCustomStyling] = useState<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Helper function to format time with AM/PM
  const formatTimeWithAMPM = (timeString: string) => {
    try {
      if (timeString.includes('AM') || timeString.includes('PM')) {
        return timeString
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
      return timeString
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

  const applyCustomStyling = (newStyling: any) => {
    setCustomStyling(newStyling)
    onCustomize(newStyling)
  }

  if (!isOpen || !event) return null

  const { day, month } = formatDate(event.date)
  const styling = customStyling || event.visualStyling?.styling
  const visualInfo = event.visualStyling

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative rounded-3xl max-w-sm w-full h-[85vh] overflow-hidden soft-shadow bg-white">
        
        {/* AI Styling Indicator */}
        {visualInfo && (
          <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-700 shadow-lg">
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"/>
              </svg>
              <span>AI Styled</span>
            </div>
          </div>
        )}

        {/* Media Section with AI-generated gradient */}
        <div className="relative h-[45%] overflow-hidden rounded-t-3xl">
          {event.mediaUrl && event.mediaType === "image" ? (
            <div className="relative w-full h-full">
              <img
                src={event.mediaUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay based on AI styling */}
              {styling?.gradient && (
                <div className={`absolute inset-0 ${styling.gradient} opacity-20 mix-blend-overlay`} />
              )}
            </div>
          ) : event.mediaUrl && event.mediaType === "video" ? (
            <div
              className="relative w-full h-full cursor-pointer"
              onClick={handleVideoClick}
            >
              <video
                ref={videoRef}
                src={event.mediaUrl}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
              />
              {/* Gradient overlay */}
              {styling?.gradient && (
                <div className={`absolute inset-0 ${styling.gradient} opacity-20 mix-blend-overlay`} />
              )}
              
              {/* Video controls */}
              <div className="absolute inset-0 flex items-center justify-center">
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
            </div>
          ) : (
            <div className={`w-full h-full ${styling?.gradient || 'bg-gradient-to-br from-gray-400 to-gray-600'}`} />
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

        {/* Content Section with AI-styled typography */}
        <div className="h-[55%] p-6 flex flex-col justify-between">
          {/* Event Title with AI font styling */}
          <h2 className={`text-2xl ${styling?.font || 'font-semibold'} text-gray-800 mb-4`}>
            {event.title}
          </h2>

          {/* AI Styling Info Banner */}
          {visualInfo && !showCustomization && (
            <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"/>
                    </svg>
                    <span className="text-sm font-medium text-purple-700">AI Styling Applied</span>
                  </div>
                  <p className="text-xs text-purple-600 mb-2">{visualInfo.mood}</p>
                  <div className="flex flex-wrap gap-1">
                    {visualInfo.colorPalette.slice(0, 3).map((color, index) => (
                      <div
                        key={index}
                        className={`w-4 h-4 rounded-full bg-${color}-500 border border-white shadow-sm`}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setShowCustomization(!showCustomization)}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                >
                  Customize
                </button>
              </div>
            </div>
          )}

          {/* Customization Panel */}
          {showCustomization && visualInfo && (
            <div className="mb-4 p-4 bg-gray-50 rounded-xl">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Customize Visual Style</h4>
              
              {/* Theme Selection */}
              <div className="mb-3">
                <label className="text-xs text-gray-600 mb-1 block">Theme</label>
                <select
                  className="w-full text-xs p-2 border border-gray-200 rounded-lg"
                  value={customStyling?.theme || visualInfo.styling.theme}
                  onChange={(e) => {
                    const themes = {
                      professional: 'from-slate-600 to-slate-800',
                      creative: 'from-purple-500 to-pink-600',
                      social: 'from-pink-400 to-rose-500',
                      formal: 'from-gray-800 to-black',
                      outdoor: 'from-green-500 to-emerald-600',
                      celebration: 'from-yellow-400 to-orange-500'
                    };
                    const newStyling = {
                      ...styling,
                      theme: e.target.value,
                      gradient: `bg-gradient-to-br ${themes[e.target.value as keyof typeof themes]}`
                    };
                    applyCustomStyling(newStyling);
                  }}
                >
                  <option value="professional">Professional</option>
                  <option value="creative">Creative</option>
                  <option value="social">Social</option>
                  <option value="formal">Formal</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="celebration">Celebration</option>
                </select>
              </div>

              {/* Font Weight */}
              <div className="mb-3">
                <label className="text-xs text-gray-600 mb-1 block">Font Style</label>
                <select
                  className="w-full text-xs p-2 border border-gray-200 rounded-lg"
                  value={customStyling?.font || styling?.font}
                  onChange={(e) => {
                    applyCustomStyling({
                      ...styling,
                      font: e.target.value
                    });
                  }}
                >
                  <option value="font-medium">Medium</option>
                  <option value="font-semibold">Semi Bold</option>
                  <option value="font-bold">Bold</option>
                  <option value="font-extrabold">Extra Bold</option>
                </select>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setCustomStyling(null);
                    setShowCustomization(false);
                  }}
                  className="flex-1 text-xs py-2 px-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowCustomization(false)}
                  className="flex-1 text-xs py-2 px-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          )}

          {/* Date, Location, and Time */}
          <div className="flex items-center justify-between mb-4">
            {/* Date Box with AI color theming */}
            <div className={`${styling?.gradient || 'bg-sand-500'} rounded-2xl p-3 text-center text-white shadow-lg`}>
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
          </div>

          {/* Description */}
          {event.description && (
            <div className="mb-6 bg-gray-50 rounded-2xl p-4">
              <p className="text-sm text-gray-700 leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 mt-auto">
            <button 
              onClick={onEdit}
              className={`w-full ${styling?.gradient || 'bg-gradient-to-r from-sand-500 to-sand-600'} text-white py-4 rounded-2xl ${styling?.font || 'font-semibold'} text-base hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg`}
            >
              Edit & Publish
            </button>

            <button className="w-full bg-gray-100 py-3 rounded-2xl font-medium text-gray-700 hover:bg-gray-200 transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"></path>
              </svg>
              <span>Preview Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}