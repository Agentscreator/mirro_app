"use client"

import type React from "react"
import { useState, useEffect } from "react"
import EventCard from "./EventCard"
import ManageEventsToggle from "./ManageEventsToggle"

// Icon components for different event types
const getEventIcon = (iconType?: string) => {
  switch (iconType) {
    case 'music':
      return (
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
            clipRule="evenodd"
          ></path>
        </svg>
      );
    case 'photography':
      return (
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"></path>
        </svg>
      );
    case 'community':
      return (
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
        </svg>
      );
    default:
      return (
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
            clipRule="evenodd"
          ></path>
        </svg>
      );
  }
};

interface User {
  id: string
  name: string
  username: string
  profilePicture?: string | null
  followersCount?: string
  followingCount?: string
  createdAt: string
  updatedAt: string
}

interface DatabaseEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  icon?: string | null
  gradient?: string | null
  createdBy: string
  createdAt: string
  creatorName?: string | null
  creatorUsername?: string | null
}

interface EventCardData {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  createdBy: string
  icon: React.ReactNode
  gradient: string
}

interface ProfilePageProps {
  user: User
}

export default function ProfilePage({ user: initialUser }: ProfilePageProps) {
  const [isManageMode, setIsManageMode] = useState(false)
  const [user, setUser] = useState<User>(initialUser)
  const [profilePicture, setProfilePicture] = useState<string | null>(initialUser.profilePicture || null)
  const [allEvents, setAllEvents] = useState<EventCardData[]>([])
  const [userEvents, setUserEvents] = useState<EventCardData[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch user data and events
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch user data with real follower counts
        const userResponse = await fetch(`/api/user/profile?userId=${user.id}`)
        const userData = await userResponse.json()
        setUser(userData)
        setProfilePicture(userData.profilePicture || null)
        
        // Fetch all events
        const allEventsResponse = await fetch('/api/events')
        const allEventsData: DatabaseEvent[] = await allEventsResponse.json()
        
        // Fetch user's events
        const userEventsResponse = await fetch(`/api/events/user/${user.id}`)
        const userEventsData: DatabaseEvent[] = await userEventsResponse.json()
        
        // Transform database events to component format
        const transformEvent = (event: DatabaseEvent): EventCardData => ({
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          time: event.time,
          location: event.location,
          createdBy: event.createdBy,
          icon: getEventIcon(event.icon || undefined),
          gradient: event.gradient || "from-taupe-400 to-taupe-500"
        })
        
        setAllEvents(allEventsData.map(transformEvent))
        setUserEvents(userEventsData.map(transformEvent))
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user.id])

  const handleEditEvent = (eventId: string) => {
    console.log("Editing event:", eventId)
    // Here you would implement the edit functionality
  }

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      const reader = new FileReader()
      reader.onload = async (e) => {
        const newProfilePicture = e.target?.result as string
        
        try {
          // Update profile picture on server
          const response = await fetch('/api/user/profile', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              profilePicture: newProfilePicture
            })
          })
          
          if (response.ok) {
            const updatedUser = await response.json()
            setUser(updatedUser)
            setProfilePicture(newProfilePicture)
            
            // Update localStorage with new user data
            localStorage.setItem('user', JSON.stringify(updatedUser))
          } else {
            console.error('Failed to update profile picture')
            alert('Failed to update profile picture. Please try again.')
          }
        } catch (error) {
          console.error('Error updating profile picture:', error)
          alert('Error updating profile picture. Please try again.')
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const eventsToShow = isManageMode ? userEvents : allEvents

  return (
    <div className="px-6 py-4 pb-24">
      {/* Profile Header */}
      <div className="text-center mb-8">
        <div className="relative inline-block">
          <div className="w-24 h-24 glass-card rounded-full mx-auto mb-6 flex items-center justify-center soft-shadow hover-lift overflow-hidden">
            {profilePicture ? (
              <img src={profilePicture || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-12 h-12 text-taupe-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                ></path>
              </svg>
            )}
          </div>
          <label className="absolute bottom-6 right-0 w-8 h-8 bg-gradient-to-br from-taupe-400 to-taupe-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
            </svg>
            <input type="file" accept="image/*" className="hidden" onChange={handleProfilePictureUpload} />
          </label>
        </div>
        <h2 className="text-2xl font-normal text-text-primary mb-2">{user.name}</h2>
        <p className="text-text-secondary font-normal">@{user.username}</p>

        {/* Followers/Following */}
        <div className="flex items-center justify-center space-x-6 mt-4">
          <div className="text-center">
            <div className="text-lg font-medium text-text-primary">{user.followersCount || '0'}</div>
            <div className="text-xs text-text-muted font-normal">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-medium text-text-primary">{user.followingCount || '0'}</div>
            <div className="text-xs text-text-muted font-normal">Following</div>
          </div>
        </div>
      </div>

      {/* Events Section with Manage Toggle */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-text-secondary">{isManageMode ? "My Events" : "Upcoming Events"}</h3>
          <ManageEventsToggle isManageMode={isManageMode} onToggle={setIsManageMode} />
        </div>

        {loading ? (
          <div className="glass-card rounded-3xl p-8 text-center soft-shadow">
            <p className="text-text-muted">Loading events...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {eventsToShow.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                isManageMode={isManageMode} 
                currentUserId={user.id}
                onEdit={handleEditEvent} 
              />
            ))}
          </div>
        )}

        {!loading && isManageMode && userEvents.length === 0 && (
          <div className="glass-card rounded-3xl p-8 text-center soft-shadow">
            <p className="text-text-muted">You haven't created any events yet.</p>
          </div>
        )}

        {!loading && !isManageMode && allEvents.length === 0 && (
          <div className="glass-card rounded-3xl p-8 text-center soft-shadow">
            <p className="text-text-muted">No events available.</p>
          </div>
        )}
      </div>
    </div>
  )
}
