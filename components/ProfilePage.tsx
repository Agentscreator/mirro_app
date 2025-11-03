"use client"

import React, { useState, useEffect, useMemo } from "react"
import EventCard from "./EventCard"
import EventViewToggle from "./EventViewToggle"
import FollowersModal from "./FollowersModal"
import EditEventModal from "./EditEventModal"
import EventPreviewModal from "./EventPreviewModal"
import SettingsPage from "./SettingsPage"
import type { Event } from "@/lib/db/schema"

interface EventWithCreator extends Omit<Event, 'icon'> {
    creatorName?: string
    creatorUsername?: string
    icon?: React.ReactNode | string
    gradient: string | null
    thumbnailUrl: string | null
    backgroundUrl: string | null
    mediaGallery: string | null
    attendees?: Attendee[]
    attendeeCount?: number
}

// Simple placeholder for events without media
const getEventPlaceholder = () => {
    return (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
        </div>
    );
};

// Helper function to transform database events to component format
const transformDatabaseEvent = (event: DatabaseEvent): EventCardData => ({
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date,
    time: event.time,
    location: event.location,
    createdBy: event.createdBy,
    icon: getEventPlaceholder(),
    gradient: event.gradient || "from-gray-400 to-gray-600",
    mediaUrl: event.mediaUrl,
    mediaType: event.mediaType,
    thumbnailUrl: event.thumbnailUrl,
    backgroundUrl: event.backgroundUrl,
    visualStyling: event.visualStyling,
    visualStylingUrl: event.visualStylingUrl,
    mediaGallery: event.mediaGallery,
    creatorName: event.creatorName,
    creatorUsername: event.creatorUsername,
    attendees: event.attendees,
    attendeeCount: event.attendeeCount,
    createdAt: new Date(event.createdAt),
    updatedAt: new Date(event.createdAt)
});

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
    mediaUrl?: string | null
    mediaType?: string | null
    thumbnailUrl?: string | null
    backgroundUrl?: string | null
    visualStyling?: string | null
    visualStylingUrl?: string | null
    mediaGallery?: string | null
    createdBy: string
    createdAt: string
    creatorName?: string
    creatorUsername?: string
    attendees?: Attendee[]
    attendeeCount?: number
}

interface Attendee {
    id: string
    name: string
    username: string
    profilePicture?: string | null
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
    gradient: string | null
    mediaUrl?: string | null
    mediaType?: string | null
    thumbnailUrl?: string | null
    backgroundUrl?: string | null
    visualStyling?: string | null
    visualStylingUrl?: string | null
    mediaGallery?: string | null
    creatorName?: string
    creatorUsername?: string
    attendees?: Attendee[]
    attendeeCount?: number
    createdAt: Date
    updatedAt: Date
}

interface ProfilePageProps {
    user: User
    initialEventId?: string | null
    onEventModalClose?: () => void
    refreshKey?: number
    onAccountDeleted?: () => void
}

export default function ProfilePage({ user: initialUser, initialEventId, onEventModalClose, refreshKey, onAccountDeleted }: ProfilePageProps) {
    const [isManageMode, setIsManageMode] = useState(false)
    const [eventViewMode, setEventViewMode] = useState<'created' | 'joined' | 'all'>('all')
    const [user, setUser] = useState<User>(initialUser)
    const [profilePicture, setProfilePicture] = useState<string | null>(initialUser.profilePicture || null)
    const [userEvents, setUserEvents] = useState<EventCardData[]>([])
    const [joinedEvents, setJoinedEvents] = useState<EventCardData[]>([])
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
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [isEditProfileMode, setIsEditProfileMode] = useState(false)

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

                // Fetch user's created events (now includes attendee data)
                const userEventsResponse = await fetch(`/api/events/user/${user.id}`)
                const userEventsData: DatabaseEvent[] = await userEventsResponse.json()

                // Fetch user's joined events
                const joinedEventsResponse = await fetch(`/api/events/joined/${user.id}`)
                const joinedEventsData: DatabaseEvent[] = await joinedEventsResponse.json()

                // Transform database events to component format
                const transformEvent = (event: DatabaseEvent): EventCardData => ({
                    id: event.id,
                    title: event.title,
                    description: event.description,
                    date: event.date,
                    time: event.time,
                    location: event.location,
                    createdBy: event.createdBy,
                    icon: getEventPlaceholder(), // EventCard will handle media display based on mediaUrl/mediaType
                    gradient: event.gradient || "from-gray-400 to-gray-600",
                    mediaUrl: event.mediaUrl,
                    mediaType: event.mediaType,
                    thumbnailUrl: event.thumbnailUrl,
                    backgroundUrl: event.backgroundUrl,
                    visualStyling: event.visualStyling,
                    visualStylingUrl: event.visualStylingUrl,
                    mediaGallery: event.mediaGallery,
                    creatorName: event.creatorName,
                    creatorUsername: event.creatorUsername,
                    attendees: event.attendees,
                    attendeeCount: event.attendeeCount,
                    createdAt: new Date(event.createdAt),
                    updatedAt: new Date(event.createdAt) // Using createdAt as fallback since updatedAt might not be in DatabaseEvent
                })

                // Sort events by newest first (createdAt descending)
                const sortedUserEvents = userEventsData
                    .map(transformEvent)
                    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

                const sortedJoinedEvents = joinedEventsData
                    .map(transformEvent)
                    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

                setUserEvents(sortedUserEvents)
                setJoinedEvents(sortedJoinedEvents)
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user.id, refreshKey])

    // Handle initial event ID from URL
    useEffect(() => {
        if (initialEventId && userEvents.length > 0) {
            const event = userEvents.find(e => e.id === initialEventId)
            if (event) {
                handlePreviewEvent(event)
            }
        }
    }, [initialEventId, userEvents])

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
            gradient: event.gradient || 'from-gray-400 to-gray-600',
            mediaUrl: event.mediaUrl || null,
            mediaType: event.mediaType || null,
            thumbnailUrl: event.thumbnailUrl || null,
            backgroundUrl: event.backgroundUrl || null,
            visualStyling: event.visualStyling || null,
            visualStylingUrl: event.visualStylingUrl || null,
            mediaGallery: event.mediaGallery || null,
            creatorName: event.creatorName,
            creatorUsername: event.creatorUsername,
            attendees: event.attendees,
            attendeeCount: event.attendeeCount
        }
        setPreviewEvent(eventWithCreator)
        setIsEventPreviewModalOpen(true)
    }

    // Create a wrapper function that matches EventCard's expected signature
    const handleEventCardPreview = (event: { id: string; title: string; description: string; date: string; time: string; location?: string; createdBy: string; icon: React.ReactNode; gradient: string | null; mediaUrl?: string | null; mediaType?: string | null; attendees?: Attendee[]; attendeeCount?: number }) => {
        // Find the full EventCardData from our state - check both created and joined events
        const fullEvent = userEvents.find(e => e.id === event.id) || joinedEvents.find(e => e.id === event.id)
        if (fullEvent) {
            handlePreviewEvent(fullEvent)
        }
    }

    const handleEventUpdated = () => {
        // Refresh events data after update
        const fetchData = async () => {
            try {
                // Fetch user's created events (now includes attendee data)
                const userEventsResponse = await fetch(`/api/events/user/${user.id}`)
                const userEventsData: DatabaseEvent[] = await userEventsResponse.json()

                // Fetch user's joined events
                const joinedEventsResponse = await fetch(`/api/events/joined/${user.id}`)
                const joinedEventsData: DatabaseEvent[] = await joinedEventsResponse.json()

                // Transform database events to component format
                const transformEvent = (event: DatabaseEvent): EventCardData => ({
                    id: event.id,
                    title: event.title,
                    description: event.description,
                    date: event.date,
                    time: event.time,
                    location: event.location,
                    createdBy: event.createdBy,
                    icon: getEventPlaceholder(), // EventCard will handle media display based on mediaUrl/mediaType
                    gradient: event.gradient || "from-gray-400 to-gray-600",
                    mediaUrl: event.mediaUrl,
                    mediaType: event.mediaType,
                    thumbnailUrl: event.thumbnailUrl,
                    backgroundUrl: event.backgroundUrl,
                    visualStyling: event.visualStyling,
                    visualStylingUrl: event.visualStylingUrl,
                    mediaGallery: event.mediaGallery,
                    creatorName: event.creatorName,
                    creatorUsername: event.creatorUsername,
                    attendees: event.attendees,
                    attendeeCount: event.attendeeCount,
                    createdAt: new Date(event.createdAt),
                    updatedAt: new Date(event.createdAt) // Using createdAt as fallback since updatedAt might not be in DatabaseEvent
                })

                // Sort events by newest first (createdAt descending)
                const sortedUserEvents = userEventsData
                    .map(transformEvent)
                    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

                const sortedJoinedEvents = joinedEventsData
                    .map(transformEvent)
                    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

                setUserEvents(sortedUserEvents)
                setJoinedEvents(sortedJoinedEvents)
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
                        setIsEditProfileMode(false)

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

    const eventsToShow = useMemo(() => {
        switch (eventViewMode) {
            case 'created':
                return userEvents
            case 'joined':
                return joinedEvents
            case 'all':
            default:
                // Combine and deduplicate events (user might be both creator and participant)
                const allEvents = [...userEvents, ...joinedEvents]
                const uniqueEvents = allEvents.filter((event, index, self) =>
                    index === self.findIndex(e => e.id === event.id)
                )
                return uniqueEvents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        }
    }, [eventViewMode, userEvents, joinedEvents])

    return (
        <div className="px-6 py-2 pb-32">
            {/* Profile Header */}
            <div className="text-center mb-10 relative">
                {/* Hamburger Menu Button */}
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="absolute top-0 right-0 p-2 glass-card rounded-xl hover:bg-white/10 transition-all duration-200"
                >
                    <svg className="w-5 h-5 text-text-secondary" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                    </svg>
                </button>

                <div className="relative inline-block">
                    <div className="w-28 h-28 rounded-full mx-auto mb-6 flex items-center justify-center overflow-hidden bg-white/30 backdrop-blur-sm shadow-md">
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
                    <label className={`absolute bottom-6 right-0 bg-taupe-700 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 ${isEditProfileMode ? 'w-12 h-12 animate-bounce' : 'w-8 h-8'
                        }`}>
                        <svg className={`text-white transition-all duration-300 ${isEditProfileMode ? 'w-6 h-6' : 'w-4 h-4'
                            }`} fill="currentColor" viewBox="0 0 20 20">
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
                            <h2 className="text-2xl font-light text-text-primary tracking-wide">{user.name}</h2>
                            <button
                                onClick={() => {
                                    setEditName(user.name)
                                    setIsEditingName(true)
                                    setIsEditProfileMode(false)
                                }}
                                className={`p-1 text-taupe-400 hover:text-taupe-600 transition-all duration-300 ${isEditProfileMode ? 'opacity-100 scale-150 animate-pulse text-taupe-600' : 'opacity-0 group-hover:opacity-100'
                                    }`}
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
                                    setIsEditProfileMode(false)
                                }}
                                className={`p-1 text-taupe-400 hover:text-taupe-600 transition-all duration-300 ${isEditProfileMode ? 'opacity-100 scale-150 animate-pulse text-taupe-600' : 'opacity-0 group-hover:opacity-100'
                                    }`}
                            >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* Subscribers/Subscriptions */}
                <div className="flex items-center justify-center space-x-8 mt-6">
                    <button
                        onClick={() => setIsFollowersModalOpen(true)}
                        className="text-center transition-colors duration-200"
                    >
                        <div className="text-2xl font-extralight text-text-primary">{user.followersCount || '0'}</div>
                        <div className="text-xs text-text-muted font-light tracking-wide">Subscribers</div>
                    </button>
                    <button
                        onClick={() => setIsFollowingModalOpen(true)}
                        className="text-center transition-colors duration-200"
                    >
                        <div className="text-2xl font-extralight text-text-primary">{user.followingCount || '0'}</div>
                        <div className="text-xs text-text-muted font-light tracking-wide">Subscriptions</div>
                    </button>
                </div>
            </div>

            {/* Events Section with Manage Toggle */}
            <div className="mb-8">
                <div className="flex items-center justify-end mb-6">
                    <EventViewToggle
                        isManageMode={isManageMode}
                        onManageModeToggle={setIsManageMode}
                        eventViewMode={eventViewMode}
                        onEventViewModeChange={setEventViewMode}
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
                    if (onEventModalClose) {
                        onEventModalClose()
                    }
                }}
                event={previewEvent}
                currentUserId={user.id}
                onJoinStatusChange={handleEventUpdated}
            />

            <SettingsPage
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onAccountDeleted={onAccountDeleted}
                onEditProfile={() => {
                    setIsEditProfileMode(true)
                    // Scroll to top to show profile editing section
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
            />
        </div>
    )
}
