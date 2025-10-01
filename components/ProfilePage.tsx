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

// Icon components for different event types with earthy, sophisticated aesthetic
const getEventIcon = (iconType?: string, eventTitle?: string) => {
    // If iconType is explicitly set, use it
    if (iconType) {
        switch (iconType) {
            case 'music':
                return (
                    <svg className="w-6 h-6" fill="#D4A574" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                );
            case 'photography':
                return (
                    <svg className="w-6 h-6" fill="#8B7355" viewBox="0 0 24 24">
                        <path d="M9 2l1.17 1H16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.83L11 2h2m3 15a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" />
                    </svg>
                );
            case 'community':
                return (
                    <svg className="w-6 h-6" fill="#6B8E6B" viewBox="0 0 24 24">
                        <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2m4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2 1l-3 4v6h2v7h3v-7h2M12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5M5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2M7.5 22v-7H9V9c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v6h1.5v7h4z" />
                    </svg>
                );
        }
    }

    // Auto-detect icon based on event title with bright colors
    if (eventTitle) {
        const title = eventTitle.toLowerCase();

        // Music-related keywords
        if (title.includes('concert') || title.includes('music') || title.includes('band') ||
            title.includes('song') || title.includes('album') || title.includes('guitar') ||
            title.includes('piano') || title.includes('jazz') || title.includes('rock') ||
            title.includes('pop') || title.includes('classical') || title.includes('orchestra') ||
            title.includes('choir') || title.includes('singing') || title.includes('karaoke') ||
            title.includes('dj') || title.includes('festival') && title.includes('music')) {
            return (
                <svg className="w-6 h-6" fill="#D4A574" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
            );
        }

        // Photography-related keywords
        if (title.includes('photo') || title.includes('camera') || title.includes('picture') ||
            title.includes('shoot') || title.includes('portrait') || title.includes('wedding') ||
            title.includes('graduation') || title.includes('gallery') || title.includes('exhibition') ||
            title.includes('art show') || title.includes('visual')) {
            return (
                <svg className="w-6 h-6" fill="#8B7355" viewBox="0 0 24 24">
                    <path d="M9 2l1.17 1H16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.83L11 2h2m3 15a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" />
                </svg>
            );
        }

        // Sports-related keywords
        if (title.includes('game') || title.includes('match') || title.includes('tournament') ||
            title.includes('championship') || title.includes('soccer') || title.includes('football') ||
            title.includes('basketball') || title.includes('tennis') || title.includes('baseball') ||
            title.includes('hockey') || title.includes('volleyball') || title.includes('sport') ||
            title.includes('race') || title.includes('marathon') || title.includes('gym') ||
            title.includes('fitness') || title.includes('workout')) {
            return (
                <svg className="w-6 h-6" fill="#A67C6D" viewBox="0 0 24 24">
                    <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" />
                </svg>
            );
        }

        // Food-related keywords
        if (title.includes('dinner') || title.includes('lunch') || title.includes('breakfast') ||
            title.includes('food') || title.includes('restaurant') || title.includes('cooking') ||
            title.includes('recipe') || title.includes('chef') || title.includes('kitchen') ||
            title.includes('meal') || title.includes('pizza') || title.includes('coffee') ||
            title.includes('wine') || title.includes('tasting') || title.includes('bbq') ||
            title.includes('barbecue') || title.includes('potluck')) {
            return (
                <svg className="w-6 h-6" fill="#C17B5A" viewBox="0 0 24 24">
                    <path d="M8.1 13.34l2.83-2.83L3.91 3.5a4.008 4.008 0 0 0 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.20-1.10-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z" />
                </svg>
            );
        }

        // Education/Learning keywords
        if (title.includes('class') || title.includes('workshop') || title.includes('seminar') ||
            title.includes('lecture') || title.includes('course') || title.includes('training') ||
            title.includes('tutorial') || title.includes('lesson') || title.includes('study') ||
            title.includes('school') || title.includes('university') || title.includes('college') ||
            title.includes('learn') || title.includes('teach') || title.includes('education')) {
            return (
                <svg className="w-6 h-6" fill="#6B8E6B" viewBox="0 0 24 24">
                    <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
                </svg>
            );
        }

        // Business/Work keywords
        if (title.includes('meeting') || title.includes('conference') || title.includes('business') ||
            title.includes('work') || title.includes('office') || title.includes('presentation') ||
            title.includes('interview') || title.includes('networking') || title.includes('corporate') ||
            title.includes('professional') || title.includes('team') || title.includes('project')) {
            return (
                <svg className="w-6 h-6" fill="#5A7A5A" viewBox="0 0 24 24">
                    <path d="M10 2h4a2 2 0 0 1 2 2v2h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4V4a2 2 0 0 1 2-2zm2 4V4h-4v2h4zm-6 4v8h12V10H6z" />
                </svg>
            );
        }

        // Party/Celebration keywords
        if (title.includes('party') || title.includes('birthday') || title.includes('celebration') ||
            title.includes('anniversary') || title.includes('holiday') || title.includes('festival') ||
            title.includes('carnival') || title.includes('dance') || title.includes('club') ||
            title.includes('nightlife') || title.includes('fun') || title.includes('social')) {
            return (
                <svg className="w-6 h-6" fill="#D4A574" viewBox="0 0 24 24">
                    <path d="M7 8a3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3m4.65-4.65l.7-.7a1 1 0 0 1 1.41 0 1 1 0 0 1 0 1.41l-.7.7C12.58 3.9 11.32 3.5 10 3.5c-.36 0-.71.04-1.06.11l.71-.26zm-2.3 2.3l-.7-.7a1 1 0 0 1 0-1.41 1 1 0 0 1 1.41 0l.7.7C10.1 3.42 9.68 2.16 9.68 1.84c0-.36.04-.71.11-1.06l-.26.71zm2.3 9.7l.7.7a1 1 0 0 1-1.41 0 1 1 0 0 1 0-1.41l.7-.7C11.42 14.1 12.68 14.5 14 14.5c.36 0 .71-.04 1.06-.11l-.71.26zm-2.3-2.3l-.7.7a1 1 0 0 1 0 1.41 1 1 0 0 1-1.41 0l-.7-.7C5.9 13.58 5.5 12.32 5.5 12c0-.36.04-.71.11-1.06l-.26.71z" />
                </svg>
            );
        }

        // Community/Social keywords
        if (title.includes('community') || title.includes('volunteer') || title.includes('charity') ||
            title.includes('fundraiser') || title.includes('social') || title.includes('group') ||
            title.includes('club') || title.includes('organization') || title.includes('nonprofit') ||
            title.includes('support') || title.includes('help') || title.includes('outreach')) {
            return (
                <svg className="w-6 h-6" fill="#6B8E6B" viewBox="0 0 24 24">
                    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2m4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2 1l-3 4v6h2v7h3v-7h2M12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5M5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2M7.5 22v-7H9V9c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v6h1.5v7h4z" />
                </svg>
            );
        }

        // Travel/Adventure keywords
        if (title.includes('trip') || title.includes('travel') || title.includes('vacation') ||
            title.includes('adventure') || title.includes('hiking') || title.includes('camping') ||
            title.includes('beach') || title.includes('mountain') || title.includes('explore') ||
            title.includes('journey') || title.includes('tour') || title.includes('visit')) {
            return (
                <svg className="w-6 h-6" fill="#8B7355" viewBox="0 0 24 24">
                    <path d="M14.12 4l1.83 2H20v2h-8.95l-1.83-2H4v6h8.05l1.83 2H20v2h-4.05L14.12 12H4V8h5.88L11.71 6H20V4h-5.88zM2 20v-8h2v6h16v2H2z" />
                </svg>
            );
        }
    }

    // Default calendar icon
    return (
        <svg className="w-6 h-6" fill="#8B7355" viewBox="0 0 24 24">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
        </svg>
    );
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
                    icon: getEventIcon(event.icon || undefined, event.title),
                    gradient: event.gradient || "from-amber-100 to-amber-200",
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
                    icon: getEventIcon(event.icon || undefined, event.title),
                    gradient: event.gradient || "from-amber-100 to-amber-200",
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
