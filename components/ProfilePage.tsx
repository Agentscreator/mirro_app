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

// Icon components for different event types with bright, attractive colors
const getEventIcon = (iconType?: string, eventTitle?: string) => {
    // If iconType is explicitly set, use it
    if (iconType) {
        switch (iconType) {
            case 'music':
                return (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 20 20">
                        <defs>
                            <linearGradient id="music-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FF6B6B" />
                                <stop offset="100%" stopColor="#FF8E53" />
                            </linearGradient>
                        </defs>
                        <path fill="url(#music-gradient)" d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"></path>
                    </svg>
                );
            case 'photography':
                return (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 20 20">
                        <defs>
                            <linearGradient id="photo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#4ECDC4" />
                                <stop offset="100%" stopColor="#44A08D" />
                            </linearGradient>
                        </defs>
                        <path fill="url(#photo-gradient)" fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
                    </svg>
                );
            case 'community':
                return (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 20 20">
                        <defs>
                            <linearGradient id="community-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#667EEA" />
                                <stop offset="100%" stopColor="#764BA2" />
                            </linearGradient>
                        </defs>
                        <path fill="url(#community-gradient)" d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                    </svg>
                );
        }
    }

    // Auto-detect icon based on event title with bright colors
    if (eventTitle) {
        const title = eventTitle.toLowerCase();

        // Music-related keywords - Vibrant Red/Orange
        if (title.includes('concert') || title.includes('music') || title.includes('band') ||
            title.includes('song') || title.includes('album') || title.includes('guitar') ||
            title.includes('piano') || title.includes('jazz') || title.includes('rock') ||
            title.includes('pop') || title.includes('classical') || title.includes('orchestra') ||
            title.includes('choir') || title.includes('singing') || title.includes('karaoke') ||
            title.includes('dj') || title.includes('festival') && title.includes('music')) {
            return (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 20 20">
                    <defs>
                        <linearGradient id="music-auto-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FF6B6B" />
                            <stop offset="100%" stopColor="#FF8E53" />
                        </linearGradient>
                    </defs>
                    <path fill="url(#music-auto-gradient)" d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"></path>
                </svg>
            );
        }

        // Photography-related keywords - Teal/Green
        if (title.includes('photo') || title.includes('camera') || title.includes('picture') ||
            title.includes('shoot') || title.includes('portrait') || title.includes('wedding') ||
            title.includes('graduation') || title.includes('gallery') || title.includes('exhibition') ||
            title.includes('art show') || title.includes('visual')) {
            return (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 20 20">
                    <defs>
                        <linearGradient id="photo-auto-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#4ECDC4" />
                            <stop offset="100%" stopColor="#44A08D" />
                        </linearGradient>
                    </defs>
                    <path fill="url(#photo-auto-gradient)" fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
                </svg>
            );
        }

        // Sports-related keywords - Electric Blue/Purple
        if (title.includes('game') || title.includes('match') || title.includes('tournament') ||
            title.includes('championship') || title.includes('soccer') || title.includes('football') ||
            title.includes('basketball') || title.includes('tennis') || title.includes('baseball') ||
            title.includes('hockey') || title.includes('volleyball') || title.includes('sport') ||
            title.includes('race') || title.includes('marathon') || title.includes('gym') ||
            title.includes('fitness') || title.includes('workout')) {
            return (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 20 20">
                    <defs>
                        <linearGradient id="sports-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#667EEA" />
                            <stop offset="100%" stopColor="#764BA2" />
                        </linearGradient>
                    </defs>
                    <path fill="url(#sports-gradient)" d="M10 2C8.89 2 8 2.89 8 4s.89 2 2 2 2-.89 2-2-.89-2-2-2zM21 9h-6l-2-4h-2L9 9H3c-.55 0-1 .45-1 1s.45 1 1 1h5.5l3.5 7 3.5-7H21c.55 0 1-.45 1-1s-.45-1-1-1z"></path>
                </svg>
            );
        }

        // Food-related keywords - Warm Orange/Yellow
        if (title.includes('dinner') || title.includes('lunch') || title.includes('breakfast') ||
            title.includes('food') || title.includes('restaurant') || title.includes('cooking') ||
            title.includes('recipe') || title.includes('chef') || title.includes('kitchen') ||
            title.includes('meal') || title.includes('pizza') || title.includes('coffee') ||
            title.includes('wine') || title.includes('tasting') || title.includes('bbq') ||
            title.includes('barbecue') || title.includes('potluck')) {
            return (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 20 20">
                    <defs>
                        <linearGradient id="food-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFD93D" />
                            <stop offset="100%" stopColor="#FF8C42" />
                        </linearGradient>
                    </defs>
                    <path fill="url(#food-gradient)" d="M8.5 8.5c1.84 0 3.5.5 3.5 2.5v1h2v-1c0-2.5-2.91-4-6-4s-6 1.5-6 4v1h2v-1c0-2 1.66-2.5 3.5-2.5zm0-1C6.57 7.5 5 6.43 5 5s1.57-2.5 3.5-2.5S12 3.57 12 5s-1.57 2.5-3.5 2.5z"></path>
                    <path fill="url(#food-gradient)" d="M2 13h16v2H2z"></path>
                </svg>
            );
        }

        // Education/Learning keywords - Bright Green/Blue
        if (title.includes('class') || title.includes('workshop') || title.includes('seminar') ||
            title.includes('lecture') || title.includes('course') || title.includes('training') ||
            title.includes('tutorial') || title.includes('lesson') || title.includes('study') ||
            title.includes('school') || title.includes('university') || title.includes('college') ||
            title.includes('learn') || title.includes('teach') || title.includes('education')) {
            return (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 20 20">
                    <defs>
                        <linearGradient id="education-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#56CCF2" />
                            <stop offset="100%" stopColor="#2F80ED" />
                        </linearGradient>
                    </defs>
                    <path fill="url(#education-gradient)" d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
                </svg>
            );
        }

        // Business/Work keywords - Professional Navy/Gold
        if (title.includes('meeting') || title.includes('conference') || title.includes('business') ||
            title.includes('work') || title.includes('office') || title.includes('presentation') ||
            title.includes('interview') || title.includes('networking') || title.includes('corporate') ||
            title.includes('professional') || title.includes('team') || title.includes('project')) {
            return (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 20 20">
                    <defs>
                        <linearGradient id="business-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#F093FB" />
                            <stop offset="100%" stopColor="#F5576C" />
                        </linearGradient>
                    </defs>
                    <path fill="url(#business-gradient)" fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm4-3a1 1 0 00-1 1v1h2V4a1 1 0 00-1-1zM4 9a1 1 0 000 2v5a1 1 0 001 1h10a1 1 0 001-1v-5a1 1 0 100-2H4z" clipRule="evenodd"></path>
                </svg>
            );
        }

        // Party/Celebration keywords - Bright Pink/Purple
        if (title.includes('party') || title.includes('birthday') || title.includes('celebration') ||
            title.includes('anniversary') || title.includes('holiday') || title.includes('festival') ||
            title.includes('carnival') || title.includes('dance') || title.includes('club') ||
            title.includes('nightlife') || title.includes('fun') || title.includes('social')) {
            return (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 20 20">
                    <defs>
                        <linearGradient id="party-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FF9A9E" />
                            <stop offset="100%" stopColor="#FECFEF" />
                        </linearGradient>
                    </defs>
                    <path fill="url(#party-gradient)" fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd"></path>
                </svg>
            );
        }

        // Community/Social keywords - Warm Purple/Blue
        if (title.includes('community') || title.includes('volunteer') || title.includes('charity') ||
            title.includes('fundraiser') || title.includes('social') || title.includes('group') ||
            title.includes('club') || title.includes('organization') || title.includes('nonprofit') ||
            title.includes('support') || title.includes('help') || title.includes('outreach')) {
            return (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 20 20">
                    <defs>
                        <linearGradient id="community-auto-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#667EEA" />
                            <stop offset="100%" stopColor="#764BA2" />
                        </linearGradient>
                    </defs>
                    <path fill="url(#community-auto-gradient)" d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                </svg>
            );
        }

        // Travel/Adventure keywords - Tropical Green/Blue
        if (title.includes('trip') || title.includes('travel') || title.includes('vacation') ||
            title.includes('adventure') || title.includes('hiking') || title.includes('camping') ||
            title.includes('beach') || title.includes('mountain') || title.includes('explore') ||
            title.includes('journey') || title.includes('tour') || title.includes('visit')) {
            return (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 20 20">
                    <defs>
                        <linearGradient id="travel-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#11998E" />
                            <stop offset="100%" stopColor="#38EF7D" />
                        </linearGradient>
                    </defs>
                    <path fill="url(#travel-gradient)" fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd"></path>
                </svg>
            );
        }
    }

    // Default calendar icon with gradient
    return (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 20 20">
            <defs>
                <linearGradient id="default-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A8EDEA" />
                    <stop offset="100%" stopColor="#FED6E3" />
                </linearGradient>
            </defs>
            <path
                fill="url(#default-gradient)"
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
            ></path>
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
                    icon: getEventIcon(event.icon || undefined, event.title),
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
