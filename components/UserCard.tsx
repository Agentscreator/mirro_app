"use client"

import React, { useState, useEffect } from 'react'
import ReportDialog from "@/components/ReportDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

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
  const [isBlocked, setIsBlocked] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)

  useEffect(() => {
    if (currentUserId !== user.id) {
      checkFollowStatus()
      checkBlockStatus()
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

  const checkBlockStatus = async () => {
    try {
      const response = await fetch(`/api/moderation/block?blockerId=${currentUserId}`)
      const blockedUsers = await response.json()
      setIsBlocked(blockedUsers.some((b: any) => b.blockedId === user.id))
    } catch (error) {
      console.error('Error checking block status:', error)
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

  const handleBlock = async () => {
    try {
      const response = await fetch('/api/moderation/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blockerId: currentUserId,
          blockedId: user.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsBlocked(true)
        setIsFollowing(false) // Unfollow when blocking
        toast.success('User blocked successfully')
        onFollowChange?.() // Refresh the list
      } else {
        toast.error(data.error || 'Failed to block user')
      }
    } catch (error) {
      console.error('Error blocking user:', error)
      toast.error('Failed to block user')
    }
  }

  const handleUnblock = async () => {
    try {
      const response = await fetch('/api/moderation/block', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blockerId: currentUserId,
          blockedId: user.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsBlocked(false)
        toast.success('User unblocked successfully')
        onFollowChange?.() // Refresh the list
      } else {
        toast.error(data.error || 'Failed to unblock user')
      }
    } catch (error) {
      console.error('Error unblocking user:', error)
      toast.error('Failed to unblock user')
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
          <div className="flex items-center space-x-2">
            {!isBlocked && (
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-taupe-100 rounded-full transition-colors duration-200">
                  <svg className="w-5 h-5 text-text-secondary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isBlocked ? (
                  <DropdownMenuItem onClick={handleUnblock}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    Unblock User
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                      </svg>
                      Report User
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleBlock} className="text-red-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      Block User
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        reporterId={currentUserId}
        reportedUserId={user.id}
        contentType="user"
        contentName={user.name}
      />
    </div>
  )
}