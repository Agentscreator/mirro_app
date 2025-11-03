"use client"

import type React from "react"
import { useState, useEffect } from "react"

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
            {/* AI Generated Images Section */}
            {(event?.thumbnailUrl || event?.backgroundUrl) && (
              <div className="space-y-3 pb-4 border-b border-cream-200">
                <h3 className="text-sm font-semibold text-text-primary">AI Generated Images</h3>

                {/* Thumbnail Preview */}
                {event?.thumbnailUrl && (
                  <div className="bg-white rounded-2xl overflow-hidden shadow-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600">Event Card Thumbnail</span>
                      <button
                        type="button"
                        onClick={handleRegenerateThumbnail}
                        disabled={isRegeneratingThumbnail}
                        className="text-xs px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRegeneratingThumbnail ? 'Regenerating...' : 'Regenerate'}
                      </button>
                    </div>
                    <img src={event.thumbnailUrl} alt="Event thumbnail" className="w-full h-24 object-cover rounded-xl" />
                  </div>
                )}

                {/* Background Preview */}
                {event?.backgroundUrl && (
                  <div className="bg-white rounded-2xl overflow-hidden shadow-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600">Event Modal Background</span>
                      <button
                        type="button"
                        onClick={handleRegenerateBackground}
                        disabled={isRegeneratingBackground}
                        className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRegeneratingBackground ? 'Regenerating...' : 'Regenerate'}
                      </button>
                    </div>
                    <img src={event.backgroundUrl} alt="Event background" className="w-full h-24 object-cover rounded-xl" />
                  </div>
                )}
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