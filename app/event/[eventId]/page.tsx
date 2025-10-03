"use client"

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import EventPreviewModal from '@/components/EventPreviewModal';

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

export default function SharedEventPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) {
          throw new Error('Event not found');
        }
        const eventData = await response.json();
        setEvent(eventData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The event you\'re looking for doesn\'t exist.'}</p>
          <a 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EventPreviewModal
        event={event}
        isOpen={true}
        onClose={() => window.history.back()}
        currentUserId="" // Empty for public view
      />
    </div>
  );
}