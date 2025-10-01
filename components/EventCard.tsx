"use client"

import type React from "react"

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  createdBy: string
  icon: React.ReactNode
  gradient: string
  mediaUrl?: string | null
  mediaType?: string | null
  creatorName?: string
  creatorUsername?: string
}

interface EventCardProps {
  event: Event
  isManageMode: boolean
  currentUserId: string
  onEdit: (eventId: string) => void
  onDelete?: (eventId: string) => void
  onPreview?: (event: Event) => void
}

export default function EventCard({ event, isManageMode, currentUserId, onEdit, onDelete, onPreview }: EventCardProps) {
  const canEdit = event.createdBy === currentUserId

  return (
    <div
      className="glass-card rounded-3xl p-5 soft-shadow hover-lift transition-all duration-300 cursor-pointer"
      onClick={() => onPreview && onPreview(event)}
    >
      <div className="flex items-start space-x-4">
        <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md flex-shrink-0">
          {event.mediaUrl && event.mediaType ? (
            event.mediaType === 'image' ? (
              <img
                src={event.mediaUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : event.mediaType === 'video' ? (
              <video
                src={event.mediaUrl}
                className="w-full h-full object-cover"
                muted
                poster=""
              />
            ) : (
              <div
                className={`w-full h-full bg-gradient-to-br ${event.gradient} flex items-center justify-center`}
              >
                {event.icon}
              </div>
            )
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${event.gradient} flex items-center justify-center`}
            >
              {event.icon}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-medium mb-1 text-text-primary">{event.title}</h4>
          <p className="text-sm text-text-secondary mb-3 font-normal leading-relaxed">{event.description}</p>
          <div className="flex items-center text-xs text-text-muted">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              ></path>
            </svg>
            {event.date} • {event.time}
          </div>
          {event.location && (
            <div className="flex items-center text-xs text-text-muted mt-1">
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

        {/* Action Buttons */}
        {isManageMode && canEdit ? (
          <div className="flex space-x-2 ml-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(event.id)
              }}
              className="p-2 rounded-xl gradient-primary text-white hover:shadow-lg transition-all duration-200"
              title="Edit event"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
              </svg>
            </button>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm('Are you sure you want to delete this event?')) {
                    onDelete(event.id)
                  }
                }}
                className="p-2 rounded-xl bg-gradient-to-br from-red-400 to-red-500 text-white hover:shadow-lg transition-all duration-200"
                title="Delete event"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (navigator.share) {
                navigator.share({
                  title: event.title,
                  text: event.description,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(`${event.title} - ${event.description} on ${event.date} at ${event.time}`);
                alert('Event details copied to clipboard!');
              }
            }}
            className="p-2 rounded-xl glass-card hover:bg-white/60 transition-all duration-200 ml-2"
            title="Share event"
          >
            <svg className="w-5 h-5 text-text-muted" fill="currentColor" viewBox="0 0 20 20">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"></path>
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
