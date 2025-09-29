"use client"

import React, { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  username: string
  profilePicture?: string | null
}

interface FollowersModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  type: 'followers' | 'following'
  currentUserId: string
}

export default function FollowersModal({ isOpen, onClose, userId, type, currentUserId }: FollowersModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
    }
  }, [isOpen, userId, type])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const endpoint = type === 'followers' ? 'followers' : 'following'
      const response = await fetch(`/api/user/${endpoint}?userId=${userId}`)
      const data = await response.json()
      
      if (response.ok) {
        setUsers(data[type])
        
        // Check following status for each user
        if (currentUserId !== userId) {
          const statusPromises = data[type].map(async (user: User) => {
            const statusResponse = await fetch(`/api/user/follow?followerId=${currentUserId}&followingId=${user.id}`)
            const statusData = await statusResponse.json()
            return { userId: user.id, isFollowing: statusData.isFollowing }
          })
          
          const statuses = await Promise.all(statusPromises)
          const statusMap = statuses.reduce((acc, { userId, isFollowing }) => {
            acc[userId] = isFollowing
            return acc
          }, {} as Record<string, boolean>)
          
          setFollowingStatus(statusMap)
        }
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async (targetUserId: string) => {
    try {
      const response = await fetch('/api/user/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followerId: currentUserId,
          followingId: targetUserId,
        }),
      })

      if (response.ok) {
        setFollowingStatus(prev => ({ ...prev, [targetUserId]: true }))
      }
    } catch (error) {
      console.error('Error following user:', error)
    }
  }

  const handleUnfollow = async (targetUserId: string) => {
    try {
      const response = await fetch('/api/user/follow', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followerId: currentUserId,
          followingId: targetUserId,
        }),
      })

      if (response.ok) {
        setFollowingStatus(prev => ({ ...prev, [targetUserId]: false }))
      }
    } catch (error) {
      console.error('Error unfollowing user:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-3xl max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-taupe-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-text-primary capitalize">
              {type}
            </h2>
            <button
              onClick={onClose}
              className="p-2 bg-taupe-100 hover:bg-taupe-200 text-taupe-600 hover:text-taupe-800 rounded-full transition-all duration-200 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-96">
          {loading ? (
            <div className="p-6 text-center">
              <p className="text-text-muted">Loading...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-text-muted">
                No {type} yet.
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-taupe-50 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-taupe-200 flex items-center justify-center">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-5 h-5 text-taupe-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">{user.name}</p>
                      <p className="text-sm text-text-secondary">@{user.username}</p>
                    </div>
                  </div>
                  
                  {currentUserId !== user.id && (
                    <button
                      onClick={() => followingStatus[user.id] ? handleUnfollow(user.id) : handleFollow(user.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                        followingStatus[user.id]
                          ? 'bg-taupe-200 text-taupe-700 hover:bg-taupe-300'
                          : 'bg-gradient-to-r from-taupe-400 to-taupe-500 text-white hover:from-taupe-500 hover:to-taupe-600'
                      }`}
                    >
                      {followingStatus[user.id] ? 'Unfollow' : 'Follow'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}