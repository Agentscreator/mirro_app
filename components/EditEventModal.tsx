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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto soft-shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-text-primary">Edit Event</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl glass-card hover:bg-white/60 transition-all duration-200"
          >
            <svg className="w-5 h-5 text-text-muted" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-taupe-500 mx-auto mb-4"></div>
            <p className="text-text-muted">Loading event...</p>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              handleSave()
            }}
          >
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

            <div>
              <label className="block text-sm font-medium mb-2 text-text-secondary">Event Title</label>
              <input
                type="text"
                placeholder="Enter event title"
                className="w-full px-4 py-3 text-base rounded-2xl border border-cream-300 glass-card focus:ring-2 focus:ring-taupe-400 focus:border-transparent transition-all duration-200 text-text-primary placeholder-text-light"
                value={eventData.title}
                onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-text-secondary">Description</label>
              <textarea
                placeholder="Describe your event..."
                rows={3}
                className="w-full px-4 py-3 text-base rounded-2xl border border-cream-300 glass-card focus:ring-2 focus:ring-taupe-400 focus:border-transparent transition-all duration-200 resize-none text-text-primary placeholder-text-light"
                value={eventData.description}
                onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2 text-text-secondary">Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 text-base rounded-2xl border border-cream-300 glass-card focus:ring-2 focus:ring-taupe-400 focus:border-transparent transition-all duration-200 text-text-primary"
                  value={eventData.date}
                  onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-text-secondary">Time</label>
                <input
                  type="time"
                  className="w-full px-4 py-3 text-base rounded-2xl border border-cream-300 glass-card focus:ring-2 focus:ring-taupe-400 focus:border-transparent transition-all duration-200 text-text-primary"
                  value={eventData.time}
                  onChange={(e) => setEventData({ ...eventData, time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-text-secondary">Location</label>
              <input
                type="text"
                placeholder="Event location"
                className="w-full px-4 py-3 text-base rounded-2xl border border-cream-300 glass-card focus:ring-2 focus:ring-taupe-400 focus:border-transparent transition-all duration-200 text-text-primary placeholder-text-light"
                value={eventData.location}
                onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
              />
            </div>

            {/* Media Gallery Section */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-text-secondary">Media Gallery</label>
                <label
                  htmlFor="gallery-upload"
                  className={`text-xs px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg cursor-pointer hover:shadow-md transition-all duration-200 ${isUploadingMedia ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isUploadingMedia ? 'Uploading...' : '+ Add Media'}
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

              {/* Gallery Grid */}
              {mediaGallery.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {mediaGallery.map((item, index) => (
                    <div key={index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt="Gallery item"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteMedia(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                      {/* Video indicator */}
                      {item.type === 'video' && (
                        <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 5v10l8-5-8-5z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs text-gray-500">No media added yet</p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 rounded-2xl glass-card text-text-secondary hover:bg-white/60 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-3 rounded-2xl gradient-primary text-white hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}