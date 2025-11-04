"use client"

import type React from "react"
import { useState, useEffect } from "react"

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
  location: string
  icon?: string
  gradient?: string
  thumbnailUrl?: string | null
  backgroundUrl?: string | null
  visualStyling?: any
  mediaGallery?: MediaGalleryItem[] | null
  createdBy: string
}

interface EditEventModalProps {
  isOpen: boolean
  onClose: () => void
  eventId: string | null
  onEventUpdated: () => void
}

export default function EditEventModal({ isOpen, onClose, eventId, onEventUpdated }: EditEventModalProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [event, setEvent] = useState<Event | null>(null)
  const [isRegeneratingThumbnail, setIsRegeneratingThumbnail] = useState(false)
  const [isRegeneratingBackground, setIsRegeneratingBackground] = useState(false)
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const [mediaGallery, setMediaGallery] = useState<MediaGalleryItem[]>([])
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
  })

  // Fetch event data when modal opens
  useEffect(() => {
    if (isOpen && eventId) {
      fetchEvent()
    }
  }, [isOpen, eventId])

  const fetchEvent = async () => {
    if (!eventId) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/events/${eventId}`)
      if (response.ok) {
        const eventData = await response.json()
        setEvent(eventData)
        setEventData({
          title: eventData.title,
          description: eventData.description,
          date: eventData.date,
          time: eventData.time,
          location: eventData.location,
        })
        // Load media gallery
        if (eventData.mediaGallery) {
          try {
            const gallery = typeof eventData.mediaGallery === 'string'
              ? JSON.parse(eventData.mediaGallery)
              : eventData.mediaGallery
            setMediaGallery(gallery || [])
          } catch (e) {
            console.error('Error parsing media gallery:', e)
            setMediaGallery([])
          }
        }
      } else {
        console.error('Failed to fetch event')
      }
    } catch (error) {
      console.error('Error fetching event:', error)
    } finally {
      setLoading(false)
    }
  }

  // Function to regenerate thumbnail
  const handleRegenerateThumbnail = async () => {
    if (!event) return

    setIsRegeneratingThumbnail(true)
    try {
      const response = await fetch('/api/generate-event-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventData.title,
          description: eventData.description,
          location: eventData.location,
          type: 'thumbnail',
          visualStyling: event.visualStyling
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Update event with new thumbnail
        setEvent({ ...event, thumbnailUrl: data.imageUrl })
        alert('Thumbnail regenerated successfully!')
      } else {
        alert('Failed to regenerate thumbnail')
      }
    } catch (error) {
      console.error('Error regenerating thumbnail:', error)
      alert('Error regenerating thumbnail')
    } finally {
      setIsRegeneratingThumbnail(false)
    }
  }

  // Function to upload custom thumbnail
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !event) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setIsRegeneratingThumbnail(true)
    try {
      // Upload to server
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'image')

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json()
        // Update event with new thumbnail
        setEvent({ ...event, thumbnailUrl: uploadResult.url })
        alert('Thumbnail uploaded successfully!')
      } else {
        alert('Failed to upload thumbnail')
      }
    } catch (error) {
      console.error('Error uploading thumbnail:', error)
      alert('Error uploading thumbnail')
    } finally {
      setIsRegeneratingThumbnail(false)
      // Reset input
      e.target.value = ''
    }
  }

  // Function to regenerate background
  const handleRegenerateBackground = async () => {
    if (!event) return

    setIsRegeneratingBackground(true)
    try {
      const response = await fetch('/api/generate-event-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventData.title,
          description: eventData.description,
          location: eventData.location,
          type: 'background',
          visualStyling: event.visualStyling
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Update event with new background
        setEvent({ ...event, backgroundUrl: data.imageUrl })
        alert('Background regenerated successfully!')
      } else {
        alert('Failed to regenerate background')
      }
    } catch (error) {
      console.error('Error regenerating background:', error)
      alert('Error regenerating background')
    } finally {
      setIsRegeneratingBackground(false)
    }
  }

  // Function to handle media upload to gallery
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !event) return

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    setIsUploadingMedia(true)
    try {
      // Upload to server
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', file.type.startsWith('video/') ? 'video' : 'image')

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json()

        // Get current user
        const storedUser = localStorage.getItem('user')
        if (!storedUser) return

        const user = JSON.parse(storedUser)

        // Add to gallery
        const newItem: MediaGalleryItem = {
          url: uploadResult.url,
          type: file.type.startsWith('video/') ? 'video' : 'image',
          uploadedAt: new Date().toISOString(),
          uploadedBy: user.id
        }

        const updatedGallery = [...mediaGallery, newItem]
        setMediaGallery(updatedGallery)

        // Save to database immediately
        await fetch(`/api/events/${eventId}/gallery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mediaGallery: JSON.stringify(updatedGallery) })
        })

        alert('Media added successfully!')
      } else {
        alert('Failed to upload media')
      }
    } catch (error) {
      console.error('Error uploading media:', error)
      alert('Error uploading media')
    } finally {
      setIsUploadingMedia(false)
      // Reset input
      e.target.value = ''
    }
  }

  // Function to delete media from gallery
  const handleDeleteMedia = async (index: number) => {
    if (!confirm('Delete this media?')) return

    const updatedGallery = mediaGallery.filter((_, i) => i !== index)
    setMediaGallery(updatedGallery)

    // Save to database
    try {
      await fetch(`/api/events/${eventId}/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaGallery: JSON.stringify(updatedGallery) })
      })
    } catch (error) {
      console.error('Error deleting media:', error)
    }
  }

  const handleSave = async () => {
    if (!eventData.title || !eventData.description || !eventData.date || !eventData.time || !eventData.location) {
      alert("Please fill in all fields")
      return
    }

    if (!eventId || !event) return

    setSaving(true)
    try {
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        alert('Please log in to edit events')
        return
      }

      const user = JSON.parse(storedUser)
      const response = await fetch('/api/events', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: eventId,
          title: eventData.title,
          description: eventData.description,
          date: eventData.date,
          time: eventData.time,
          location: eventData.location,
          icon: null, // No icon system
          gradient: 'bg-gray-50', // Simple neutral background
          thumbnailUrl: event.thumbnailUrl,
          backgroundUrl: event.backgroundUrl,
          userId: user.id,
        }),
      })

      if (response.ok) {
        alert("Event updated successfully!")
        onEventUpdated()
        onClose()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to update event')
      }
    } catch (error) {
      console.error('Error updating event:', error)
      alert('Error updating event. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setEvent(null)
    setEventData({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
    })
    onClose()
  }

  if (!isOpen) return null

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const day = date.getDate()
    const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
    return { day, month }
  }

  const { day, month } = eventData.date ? formatDate(eventData.date) : { day: '', month: '' }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="relative rounded-3xl max-w-sm w-full h-[85vh] overflow-hidden shadow-2xl">
        {/* Background - Similar to EventPreviewModal */}
        <div className={`absolute inset-0 z-0 ${event?.visualStyling?.styling?.gradient || event?.gradient || 'bg-gradient-to-br from-taupe-400 via-taupe-500 to-taupe-600'}`}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 z-50 w-11 h-11 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all duration-200 shadow-xl active:scale-95 ring-1 ring-white/20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {loading ? (
          <div className="relative h-full flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white mx-auto mb-4"></div>
              <p className="text-white/80">Loading event...</p>
            </div>
          </div>
        ) : (
          <form
            className="relative h-full overflow-y-auto z-10"
            onSubmit={(e) => {
              e.preventDefault()
              handleSave()
            }}
          >
            <div className="relative pt-20 px-6 pb-6 flex flex-col min-h-full">
            {/* AI Generated Images Section - Subtle Design */}
            {(event?.thumbnailUrl || event?.backgroundUrl) && (
              <div className="space-y-2 pb-4 border-b border-gray-100">
                <details className="group">
                  <summary className="cursor-pointer list-none flex items-center justify-between py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      AI Generated Assets
                    </span>
                    <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>

                  <div className="space-y-2 mt-2">
                    {/* Thumbnail Preview - Compact */}
                    {event?.thumbnailUrl && (
                      <div className="bg-gray-50 rounded-xl overflow-hidden p-2 border border-gray-200">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs text-gray-500 flex-1">Card Thumbnail</span>
                          <label
                            htmlFor="thumbnail-upload"
                            className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-all duration-200 cursor-pointer"
                          >
                            Upload
                            <input
                              id="thumbnail-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleThumbnailUpload}
                              disabled={isRegeneratingThumbnail}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={handleRegenerateThumbnail}
                            disabled={isRegeneratingThumbnail}
                            className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isRegeneratingThumbnail ? '...' : 'Regenerate'}
                          </button>
                        </div>
                        <img src={event.thumbnailUrl} alt="Thumbnail" className="w-full h-16 object-cover rounded" />
                      </div>
                    )}

                    {/* Background Preview - Compact */}
                    {event?.backgroundUrl && (
                      <div className="bg-gray-50 rounded-xl overflow-hidden p-2 border border-gray-200">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs text-gray-500 flex-1">Modal Background</span>
                          <button
                            type="button"
                            onClick={handleRegenerateBackground}
                            disabled={isRegeneratingBackground}
                            className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isRegeneratingBackground ? '...' : 'Regenerate'}
                          </button>
                        </div>
                        <img src={event.backgroundUrl} alt="Background" className="w-full h-16 object-cover rounded" />
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}

              {/* Event Title */}
              <input
                type="text"
                placeholder="Event Title"
                required
                className="text-4xl font-bold text-white tracking-tight mb-4 bg-transparent border-none outline-none placeholder-white/50 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                value={eventData.title}
                onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
              />

              {/* Date, Location, Time */}
              <div className="flex items-start gap-3 mb-5">
                {/* Date Box */}
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3.5 text-center shadow-lg relative ring-1 ring-white/30 flex-shrink-0">
                  <input
                    type="date"
                    required
                    className="bg-transparent border-none text-white text-center text-sm font-semibold outline-none w-20"
                    value={eventData.date}
                    onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                  />
                </div>

                {/* Event Details */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start gap-1.5">
                    <svg className="w-4 h-4 text-white/90 mt-0.5 flex-shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Location"
                      required
                      className="flex-1 bg-transparent border-none text-sm text-white font-semibold outline-none placeholder-white/60 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
                      value={eventData.location}
                      onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-white/90 flex-shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <input
                      type="time"
                      required
                      className="bg-transparent border-none text-sm text-white/95 font-medium outline-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
                      value={eventData.time}
                      onChange={(e) => setEventData({ ...eventData, time: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-5 bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-lg">
                <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">About</h3>
                <textarea
                  placeholder="Describe your event..."
                  rows={4}
                  required
                  className="w-full bg-transparent border-none text-sm text-white/95 leading-relaxed outline-none resize-none placeholder-white/50 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                  value={eventData.description}
                  onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                />
              </div>

              {/* Media Gallery */}
              {mediaGallery.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      Event Photos & Videos ({mediaGallery.length})
                    </h3>
                    <label
                      htmlFor="gallery-upload"
                      className="text-xs text-white/80 hover:text-white font-medium underline cursor-pointer"
                    >
                      {isUploadingMedia ? 'Uploading...' : 'Add More'}
                      <input
                        id="gallery-upload"
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleMediaUpload}
                        disabled={isUploadingMedia}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
                    {mediaGallery.map((item, index) => (
                      <div
                        key={index}
                        className="relative flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden shadow-md snap-start group"
                      >
                        {item.type === 'image' ? (
                          <img src={item.url} alt="Gallery" className="w-full h-full object-cover" />
                        ) : (
                          <video src={item.url} className="w-full h-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteMedia(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center shadow-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Media Button (if no media) */}
              {mediaGallery.length === 0 && (
                <div className="mb-5">
                  <label
                    htmlFor="gallery-upload-empty"
                    className="block bg-white/10 backdrop-blur-sm border-2 border-dashed border-white/30 rounded-2xl p-6 text-center cursor-pointer hover:bg-white/15 transition-all duration-200"
                  >
                    <svg className="w-10 h-10 mx-auto text-white/60 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-white/80 font-medium">{isUploadingMedia ? 'Uploading...' : 'Add Photos & Videos'}</p>
                    <p className="text-xs text-white/60 mt-1">Click to upload media</p>
                    <input
                      id="gallery-upload-empty"
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      disabled={isUploadingMedia}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-auto sticky bottom-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent backdrop-blur-md pt-5 -mx-6 px-6 pb-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-gray-900 py-3.5 rounded-xl font-semibold text-base hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {saving ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}