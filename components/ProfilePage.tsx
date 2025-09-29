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
  
  // Editing states
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [editName, setEditName] = useState(initialUser.name)
  const [editUsername, setEditUsername] = useState(initialUser.username)
  const [usernameError, setUsernameError] = useState('')
  const [usernameChecking, setUsernameChecking] = useState(false)

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

  const handleNameEdit = async () => {
    if (!editName.trim()) {
      alert('Name cannot be empty')
      return
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          name: editName.trim()
        })
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        setIsEditingName(false)
        
        // Update localStorage with new user data
        localStorage.setItem('user', JSON.stringify(updatedUser))
      } else {
        alert('Failed to update name. Please try again.')
      }
    } catch (error) {
      console.error('Error updating name:', error)
      alert('Error updating name. Please try again.')
    }
  }

  const checkUsernameAvailability = async (username: string) => {
    if (username === user.username) {
      setUsernameError('')
      return true
    }

    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters long')
      return false
    }

    if (username.length > 30) {
      setUsernameError('Username must be less than 30 characters long')
      return false
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError('Username can only contain letters, numbers, and underscores')
      return false
    }

    setUsernameChecking(true)
    try {
      const response = await fetch(`/api/user/check-username?username=${encodeURIComponent(username)}&currentUserId=${user.id}`)
      const data = await response.json()
      
      if (data.available) {
        setUsernameError('')
        return true
      } else {
        setUsernameError(data.error || 'Username is not available')
        return false
      }
    } catch (error) {
      setUsernameError('Error checking username availability')
      return false
    } finally {
      setUsernameChecking(false)
    }
  }

  const handleUsernameEdit = async () => {
    if (!editUsername.trim()) {
      alert('Username cannot be empty')
      return
    }

    const isValid = await checkUsernameAvailability(editUsername.trim())
    if (!isValid) return

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          username: editUsername.trim()
        })
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        setIsEditingUsername(false)
        
        // Update localStorage with new user data
        localStorage.setItem('user', JSON.stringify(updatedUser))
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to update username. Please try again.')
      }
    } catch (error) {
      console.error('Error updating username:', error)
      alert('Error updating username. Please try again.')
    }
  }

  const handleUsernameChange = (value: string) => {
    setEditUsername(value)
    if (value !== user.username) {
      // Debounce username checking
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(value)
      }, 500)
      return () => clearTimeout(timeoutId)
    } else {
      setUsernameError('')
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
        {/* Name editing */}
        <div className="mb-2">
          {isEditingName ? (
            <div className="flex items-center justify-center space-x-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-2xl font-normal text-text-primary bg-transparent border-b-2 border-taupe-300 focus:border-taupe-500 outline-none text-center"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameEdit()
                  if (e.key === 'Escape') {
                    setEditName(user.name)
                    setIsEditingName(false)
                  }
                }}
                autoFocus
              />
              <button
                onClick={handleNameEdit}
                className="p-1 text-green-600 hover:text-green-700 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setEditName(user.name)
                  setIsEditingName(false)
                }}
                className="p-1 text-red-600 hover:text-red-700 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="group flex items-center justify-center space-x-1">
              <h2 className="text-2xl font-normal text-text-primary">{user.name}</h2>
              <button
                onClick={() => {
                  setEditName(user.name)
                  setIsEditingName(true)
                }}
                className="p-1 text-taupe-400 hover:text-taupe-600 opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Username editing */}
        <div className="mb-4">
          {isEditingUsername ? (
            <div className="flex flex-col items-center space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-text-secondary">@</span>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  className="text-text-secondary font-normal bg-transparent border-b-2 border-taupe-300 focus:border-taupe-500 outline-none text-center"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUsernameEdit()
                    if (e.key === 'Escape') {
                      setEditUsername(user.username)
                      setIsEditingUsername(false)
                      setUsernameError('')
                    }
                  }}
                  autoFocus
                />
                <button
                  onClick={handleUsernameEdit}
                  disabled={!!usernameError || usernameChecking}
                  className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    setEditUsername(user.username)
                    setIsEditingUsername(false)
                    setUsernameError('')
                  }}
                  className="p-1 text-red-600 hover:text-red-700 transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              {usernameChecking && (
                <p className="text-xs text-taupe-500 flex items-center space-x-1">
                  <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Checking...</span>
                </p>
              )}
              {usernameError && (
                <p className="text-xs text-red-500">{usernameError}</p>
              )}
              {!usernameChecking && !usernameError && editUsername !== user.username && editUsername.length >= 3 && (
                <p className="text-xs text-green-600">Available!</p>
              )}
            </div>
          ) : (
            <div className="group flex items-center justify-center space-x-1">
              <p className="text-text-secondary font-normal">@{user.username}</p>
              <button
                onClick={() => {
                  setEditUsername(user.username)
                  setIsEditingUsername(true)
                }}
                className="p-1 text-taupe-400 hover:text-taupe-600 opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
          )}
        </div>

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
