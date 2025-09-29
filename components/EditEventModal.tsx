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
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    type: "general",
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
          type: getEventTypeFromIcon(eventData.icon),
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

  const getEventTypeFromIcon = (icon?: string) => {
    switch (icon) {
      case 'music': return 'music'
      case 'photography': return 'photography'
      case 'community': return 'community'
      case 'sports': return 'sports'
      case 'food': return 'food'
      default: return 'general'
    }
  }

  const getEventTypeDetails = (type: string) => {
    switch (type) {
      case 'music':
        return { icon: 'music', gradient: 'from-purple-400 to-purple-500' }
      case 'photography':
        return { icon: 'photography', gradient: 'from-blue-400 to-blue-500' }
      case 'community':
        return { icon: 'community', gradient: 'from-green-400 to-green-500' }
      case 'sports':
        return { icon: 'sports', gradient: 'from-orange-400 to-orange-500' }
      case 'food':
        return { icon: 'food', gradient: 'from-red-400 to-red-500' }
      default:
        return { icon: 'calendar', gradient: 'from-taupe-400 to-taupe-500' }
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
      const { icon: eventIcon, gradient: eventGradient } = getEventTypeDetails(eventData.type)
      
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
          icon: eventIcon,
          gradient: eventGradient,
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
      type: "general",
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
            <div>
              <label className="block text-sm font-medium mb-2 text-text-secondary">Event Type</label>
              <select
                className="w-full px-4 py-3 text-base rounded-2xl border border-cream-300 glass-card focus:ring-2 focus:ring-taupe-400 focus:border-transparent transition-all duration-200 text-text-primary"
                value={eventData.type}
                onChange={(e) => setEventData({ ...eventData, type: e.target.value })}
              >
                <option value="general">General Event</option>
                <option value="music">Music & Concert</option>
                <option value="photography">Photography</option>
                <option value="community">Community</option>
                <option value="sports">Sports & Fitness</option>
                <option value="food">Food & Dining</option>
              </select>
            </div>

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