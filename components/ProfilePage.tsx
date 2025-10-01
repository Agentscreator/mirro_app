"use client"

import React, { useState, useEffect } from "react"
import EventCard from "./EventCard"
import EventViewToggle from "./EventViewToggle"
import FollowersModal from "./FollowersModal"
import EditEventModal from "./EditEventModal"
import EventPreviewModal from "./EventPreviewModal"
import type { Event } from "@/lib/db/schema"

interface EventWithCreator extends Omit<Event, 'icon'> {
    creatorName?: string
    creatorUsername?: string
    icon?: React.ReactNode | string
}

// Icon components with randomized icons and colors
const getRandomEventIcon = (eventId: string) => {
    // Use event ID as seed for consistent randomization per event
    const seed = eventId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Array of available icons
    const icons = [
        // Music/Entertainment
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.369 4.369 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"></path>
        </svg>,

        // Camera/Photography
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
        </svg>,

        // People/Community
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
        </svg>,

        // Calendar/Event
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
        </svg>,

        // Star/Featured
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>,

        // Heart/Social
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
        </svg>,

        // Location/Map
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
        </svg>,

        // Gift/Celebration
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0115 5a3 3 0 013 3v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a3 3 0 013-3zm4 2.236A3 3 0 0110 5a3 3 0 011 2.236V16H9V7.236z" clipRule="evenodd"></path>
        </svg>,

        // Lightning/Energy
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"></path>
        </svg>,

        // Fire/Hot
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"></path>
        </svg>
    ];

    // Array of vibrant colors
    const colors = [
        'text-red-400',
        'text-orange-400',
        'text-amber-400',
        'text-yellow-400',
        'text-lime-400',
        'text-green-400',
        'text-emerald-400',
        'text-teal-400',
        'text-cyan-400',
        'text-sky-400',
        'text-blue-400',
        'text-indigo-400',
        'text-violet-400',
        'text-purple-400',
        'text-fuchsia-400',
        'text-pink-400',
        'text-rose-400'
    ];

    // Select icon and color based on seed
    const iconIndex = seed % icons.length;
    const colorIndex = (seed * 7) % colors.length; // Multiply by 7 for different distribution

    const selectedIcon = icons[iconIndex];
    const selectedColor = colors[colorIndex];

    // Clone the icon element and add the color class
    return React.cloneElement(selectedIcon, {
        className: `w-7 h-7 ${selectedColor}`
    });
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
    creatorName?: string
    creatorUsername?: string
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
    mediaUrl?: string | null
    mediaType?: string | null
    creatorName?: string
    creatorUsername?: string
    createdAt: Date
    updatedAt: Date
}

interface ProfilePageProps {
    user: User
}

export default function ProfilePage({ user: initialUser }: ProfilePageProps) {
    const [isManageMode, setIsManageMode] = useState(false)
    const [user, setUser] = useState<User>(initialUser)
    const [profilePicture, setProfilePicture] = useState<string | null>(initialUser.profilePicture || null)
    const [userEvents, setUserEvents] = useState<EventCardData[]>([])
    const [loading, setLoading] = useState(true)

    // Editing states
    const [isEditingName, setIsEditingName] = useState(false)
    const [isEditingUsername, setIsEditingUsername] = useState(false)
    const [editName, setEditName] = useState(initialUser.name)
    const [editUsername, setEditUsername] = useState(initialUser.username)
    const [usernameError, setUsernameError] = useState('')
    const [usernameChecking, setUsernameChecking] = useState(false)

    // Modal states
    const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false)
    const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false)
    const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false)
    const [editingEventId, setEditingEventId] = useState<string | null>(null)
    const [isEventPreviewModalOpen, setIsEventPreviewModalOpen] = useState(false)
    const [previewEvent, setPreviewEvent] = useState<EventWithCreator | null>(null)

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

                // Fetch user's events
                const userEventsResponse = await fetch(`/api/events/user/${user.id}`)
                const userEventsData: DatabaseEvent[] = await userEventsResponse.json()

                // Transform database events to component format and sort by newest first
                const transformEvent = (event: DatabaseEvent): EventCardData => ({
                    id: event.id,
                    title: event.title,
                    description: event.description,
                    date: event.date,
                    time: event.time,
                    location: event.location,
                    createdBy: event.createdBy,
                    icon: getRandomEventIcon(event.id),
                    gradient: event.gradient || "from-taupe-400 to-taupe-500",
                    creatorName: event.creatorName,
                    creatorUsername: event.creatorUsername,
                    createdAt: new Date(event.createdAt),
                    updatedAt: new Date(event.createdAt) // Using createdAt as fallback since updatedAt might not be in DatabaseEvent
                })

                // Sort events by newest first (createdAt descending)
                const sortedUserEvents = userEventsData
                    .map(transformEvent)
                    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

                setUserEvents(sortedUserEvents)
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user.id])

    const handleEditEvent = (eventId: string) => {
        setEditingEventId(eventId)
        setIsEditEventModalOpen(true)
    }

    const handlePreviewEvent = (event: EventCardData) => {
        // Convert EventCardData to EventWithCreator format
        const eventWithCreator: EventWithCreator = {
            id: event.id,
            title: event.title,
            description: event.description,
            date: event.date,
            time: event.time,
            location: event.location,
            createdBy: event.createdBy,
            createdAt: event.createdAt,
            updatedAt: event.updatedAt,
            icon: event.icon,
            gradient: event.gradient,
            mediaUrl: event.mediaUrl || null,
            mediaType: event.mediaType || null,
            creatorName: event.creatorName,
            creatorUsername: event.creatorUsername
        }
        setPreviewEvent(eventWithCreator)
        setIsEventPreviewModalOpen(true)
    }

    // Create a wrapper function that matches EventCard's expected signature
    const handleEventCardPreview = (event: { id: string; title: string; description: string; date: string; time: string; location: string; createdBy: string; icon: React.ReactNode; gradient: string; creatorName?: string; creatorUsername?: string }) => {
        // Find the full EventCardData from our state
        const fullEvent = userEvents.find(e => e.id === event.id)
        if (fullEvent) {
            handlePreviewEvent(fullEvent)
        }
    }

    const handleEventUpdated = () => {
        // Refresh events data after update
        const fetchData = async () => {
            try {
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
                    icon: getRandomEventIcon(event.id),
                    gradient: event.gradient || "from-taupe-400 to-taupe-500",
                    creatorName: event.creatorName,
                    creatorUsername: event.creatorUsername,
                    createdAt: new Date(event.createdAt),
                    updatedAt: new Date(event.createdAt) // Using createdAt as fallback since updatedAt might not be in DatabaseEvent
                })

                // Sort events by newest first (createdAt descending)
                const sortedUserEvents = userEventsData
                    .map(transformEvent)
                    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

                setUserEvents(sortedUserEvents)
            } catch (error) {
                console.error('Error refreshing events:', error)
            }
        }

        fetchData()
    }

    const handleDeleteEvent = async (eventId: string) => {
        try {
            const storedUser = localStorage.getItem('user')
            if (!storedUser) {
                alert('Please log in to delete events')
                return
            }

            const user = JSON.parse(storedUser)

            const response = await fetch('/api/events', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    eventId: eventId,
                    userId: user.id,
                }),
            })

            if (response.ok) {
                alert("Event deleted successfully!")
                handleEventUpdated() // Refresh the events list
            } else {
                const errorData = await response.json()
                alert(errorData.error || 'Failed to delete event')
            }
        } catch (error) {
            console.error('Error deleting event:', error)
            alert('Error deleting event. Please try again.')
        }
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

    const eventsToShow = userEvents

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
                    <button
                        onClick={() => setIsFollowersModalOpen(true)}
                        className="text-center hover:bg-taupe-50 rounded-lg p-2 transition-colors duration-200"
                    >
                        <div className="text-lg font-medium text-text-primary">{user.followersCount || '0'}</div>
                        <div className="text-xs text-text-muted font-normal">Followers</div>
                    </button>
                    <button
                        onClick={() => setIsFollowingModalOpen(true)}
                        className="text-center hover:bg-taupe-50 rounded-lg p-2 transition-colors duration-200"
                    >
                        <div className="text-lg font-medium text-text-primary">{user.followingCount || '0'}</div>
                        <div className="text-xs text-text-muted font-normal">Following</div>
                    </button>
                </div>
            </div>

            {/* Events Section with Manage Toggle */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-text-secondary">
                        {isManageMode ? "Manage Events" : "My Events"}
                    </h3>
                    <EventViewToggle
                        isManageMode={isManageMode}
                        onManageModeToggle={setIsManageMode}
                    />
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
                                onDelete={handleDeleteEvent}
                                onPreview={handleEventCardPreview}
                            />
                        ))}
                    </div>
                )}

                {!loading && eventsToShow.length === 0 && (
                    <div className="glass-card rounded-3xl p-8 text-center soft-shadow">
                        <p className="text-text-muted">
                            You haven't created any events yet.
                        </p>
                    </div>
                )}
            </div>

            {/* Modals */}
            <FollowersModal
                isOpen={isFollowersModalOpen}
                onClose={() => setIsFollowersModalOpen(false)}
                userId={user.id}
                type="followers"
                currentUserId={user.id}
            />

            <FollowersModal
                isOpen={isFollowingModalOpen}
                onClose={() => setIsFollowingModalOpen(false)}
                userId={user.id}
                type="following"
                currentUserId={user.id}
            />

            <EditEventModal
                isOpen={isEditEventModalOpen}
                onClose={() => {
                    setIsEditEventModalOpen(false)
                    setEditingEventId(null)
                }}
                eventId={editingEventId}
                onEventUpdated={handleEventUpdated}
            />

            <EventPreviewModal
                isOpen={isEventPreviewModalOpen}
                onClose={() => {
                    setIsEventPreviewModalOpen(false)
                    setPreviewEvent(null)
                }}
                event={previewEvent}
                currentUserId={user.id}
            />
        </div>
    )
}
