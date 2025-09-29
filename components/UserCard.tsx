"use client"

import React, { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  username: string
  profilePicture?: string | null
  followersCount?: string
  followingCount?: string
}

interface UserCardProps {
  user: User
  currentUserId: string
  onFollowChange?: () => void
}

export default function UserCard({ user, currentUserId, onFollowChange }: UserCardProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (currentUserId !== user.id) {
      checkFollowStatus()
    }
  }, [currentUserId, user.id])

  const checkFollowStatus = async () => {
    try {
      const response = await fetch(`/api/user/follow?followerId=${currentUserId}&followingId=${user.id}`)
      const data = await response.json()
      setIsFollowing(data.isFollowing)
    } catch (error) {
      console.error('Error checking follow status:', error)
    }
  }

  const handleFollow = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followerId: currentUserId,
          followingId: user.id,
        }),
      })

      if (response.ok) {
        setIsFollowing(true)
        onFollowChange?.()
      }
    } catch (error) {
      console.error('Error following user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnfollow = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/follow', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followerId: currentUserId,
          followingId: user.id,
        }),
      })

      if (response.ok) {
        setIsFollowing(false)
        onFollowChange?.()
      }
    } catch (error) {
      console.error('Error unfollowing user:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card rounded-2xl p-4 soft-shadow hover-lift">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-taupe-200 flex items-center justify-center">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <svg className="w-6 h-6 text-taupe-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="font-medium text-text-primary">{user.name}</h3>
            <p className="text-sm text-text-secondary">@{user.username}</p>
            {(user.followersCount || user.followingCount) && (
              <div className="flex items-center space-x-4 mt-1">
                {user.followersCount && (
                  <span className="text-xs text-text-muted">
                    {user.followersCount} followers
                  </span>
                )}
                {user.followingCount && (
                  <span className="text-xs text-text-muted">
                    {user.followingCount} following
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {currentUserId !== user.id && (
          <button
            onClick={isFollowing ? handleUnfollow : handleFollow}
            disabled={loading}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 disabled:opacity-50 ${
              isFollowing
                ? 'bg-taupe-200 text-taupe-700 hover:bg-taupe-300'
                : 'bg-gradient-to-r from-taupe-400 to-taupe-500 text-white hover:from-taupe-500 hover:to-taupe-600'
            }`}
          >
            {loading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </div>
    </div>
  )
}