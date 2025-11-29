"use client"

import { useEffect, useState } from 'react'
import { StreamChat, Channel as StreamChannel } from 'stream-chat'
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Window,
} from 'stream-chat-react'
import 'stream-chat-react/dist/css/v2/index.css'
import { usePushNotifications } from '@/hooks/usePushNotifications'

interface MessagingPageProps {
  user: {
    id: string
    name: string
    username: string
  }
  onChatOpen?: (isOpen: boolean) => void
}

export default function MessagingPage({ user, onChatOpen }: MessagingPageProps) {
  const [client, setClient] = useState<StreamChat | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [channels, setChannels] = useState<StreamChannel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<StreamChannel | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [groupName, setGroupName] = useState('')
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showEditMenu, setShowEditMenu] = useState(false)

  // Set up push notifications for native app
  usePushNotifications(user.id, client)

  // Notify parent when mobile chat opens/closes
  useEffect(() => {
    onChatOpen?.(showMobileChat)
  }, [showMobileChat, onChatOpen])

  useEffect(() => {
    const initChat = async () => {
      try {
        // Use absolute URL for iOS native app
        const isNative = typeof window !== 'undefined' && 
          (window as any).Capacitor?.isNativePlatform?.()
        const baseUrl = isNative ? 'https://www.mirro2.com' : ''
        
        const response = await fetch(`${baseUrl}/api/chat/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            userName: user.name || user.username,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Token response error:', errorText)
          throw new Error('Failed to get chat token')
        }

        const { token, apiKey } = await response.json()
        const chatClient = StreamChat.getInstance(apiKey)

        await chatClient.connectUser(
          {
            id: user.id,
            name: user.name || user.username,
          },
          token
        )

        setClient(chatClient)
        loadChannels(chatClient)
        loadUsers(chatClient)
      } catch (error) {
        console.error('Error initializing chat:', error)
        alert(`Chat initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        setIsLoading(false)
      }
    }

    initChat()

    return () => {
      client?.disconnectUser()
    }
  }, [user])

  const loadChannels = async (chatClient: StreamChat) => {
    const filter = { members: { $in: [user.id] } }
    const sort = [{ last_message_at: -1 as const }]
    const channelList = await chatClient.queryChannels(filter, sort, { limit: 20 })
    setChannels(channelList)
  }

  const loadUsers = async (chatClient: StreamChat) => {
    const response = await chatClient.queryUsers({}, { id: 1 }, { limit: 100 })
    setAllUsers(response.users.filter((u: any) => u.id !== user.id))
  }

  const searchUsers = async (query: string) => {
    if (!client || query.trim().length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await client.queryUsers(
        {
          $or: [
            { name: { $autocomplete: query } },
            { id: { $autocomplete: query } }
          ],
          id: { $ne: user.id } as any
        },
        { id: 1 },
        { limit: 20 }
      )
      setSearchResults(response.users)
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const startDirectMessage = async (otherUser: any) => {
    if (!client) return

    try {
      // Create or get existing DM channel
      const channelId = [user.id, otherUser.id].sort().join('-')
      const channel = client.channel('messaging', channelId, {
        members: [user.id, otherUser.id],
        name: otherUser.name || otherUser.id
      } as any)

      await channel.watch()
      await loadChannels(client)
      setSelectedChannel(channel)
      setShowNewMessageModal(false)
      setShowMobileChat(true)
      setUserSearchQuery('')
      setSearchResults([])
    } catch (error) {
      console.error('Error starting DM:', error)
    }
  }

  const createGroupChannel = async () => {
    if (!client || selectedUsers.length === 0 || !groupName.trim()) return

    try {
      const channelId = `group-${Date.now()}`
      const channel = client.channel('messaging', channelId, {
        members: [user.id, ...selectedUsers],
      })

      await channel.create()
      await channel.update({ name: groupName } as any)
      await loadChannels(client)
      setSelectedChannel(channel)
      setShowNewGroup(false)
      setSelectedUsers([])
      setGroupName('')
    } catch (error) {
      console.error('Error creating group:', error)
    }
  }

  const filteredChannels = channels.filter(channel => {
    const channelName = (channel.data as any)?.name || ''
    return channelName.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="glass-card rounded-full p-6">
          <svg className="animate-spin h-8 w-8 text-taupe-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-text-secondary">Failed to load messaging</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-180px)] pb-4">
      <Chat client={client}>
        <div className="flex h-full gap-4 px-4">
          {/* Channels List - iMessage Style */}
          <div className={`w-full lg:w-1/3 flex flex-col bg-white/40 backdrop-blur-sm rounded-3xl border border-white/40 overflow-hidden ${showMobileChat ? 'hidden lg:flex' : 'flex'}`}>
            {/* Header with Edit and Compose */}
            <div className="px-4 pt-4 pb-3 border-b border-taupe-200/30">
              <div className="flex items-center justify-between mb-3">
                {/* Edit Button with Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowEditMenu(!showEditMenu)}
                    className="text-taupe-700 hover:text-taupe-800 font-light text-base transition-colors"
                  >
                    Edit
                  </button>
                  
                  {/* Edit Menu Dropdown */}
                  {showEditMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowEditMenu(false)}
                      />
                      <div className="absolute top-full left-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-taupe-200/30 overflow-hidden z-50">
                        <button
                          onClick={() => {
                            setShowEditMenu(false)
                            // TODO: Implement select messages
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-taupe-100/50 transition-all flex items-center gap-3 text-text-primary"
                        >
                          <svg className="w-5 h-5 text-taupe-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-light">Select Messages</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowEditMenu(false)
                            // TODO: Implement edit pins
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-taupe-100/50 transition-all flex items-center gap-3 text-text-primary border-t border-taupe-200/20"
                        >
                          <svg className="w-5 h-5 text-taupe-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                          <span className="font-light">Edit Pins</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowEditMenu(false)
                            // TODO: Implement recently deleted
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-taupe-100/50 transition-all flex items-center gap-3 text-text-primary border-t border-taupe-200/20"
                        >
                          <svg className="w-5 h-5 text-taupe-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="font-light">Show Recently Deleted</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowEditMenu(false)
                            setShowNewGroup(true)
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-taupe-100/50 transition-all flex items-center gap-3 text-text-primary border-t border-taupe-200/20"
                        >
                          <svg className="w-5 h-5 text-taupe-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="font-light">Create New Group</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Compose Button */}
                <button
                  onClick={() => setShowNewMessageModal(true)}
                  className="p-2 hover:bg-taupe-100/50 rounded-full transition-all"
                >
                  <svg className="w-6 h-6 text-taupe-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>

              {/* Messages Title */}
              <h1 className="text-3xl font-bold text-text-primary mb-3 tracking-tight">Messages</h1>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-9 bg-white/60 backdrop-blur-sm rounded-xl border border-taupe-200/30 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-taupe-400/50 transition-all text-sm"
                />
                <svg className="w-4 h-4 text-taupe-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Channels */}
            <div className="flex-1 overflow-y-auto">
              {filteredChannels.length > 0 ? (
                filteredChannels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => {
                      setSelectedChannel(channel)
                      setShowMobileChat(true)
                    }}
                    className={`w-full p-4 text-left hover:bg-white/50 transition-all border-b border-taupe-200/20 ${
                      selectedChannel?.id === channel.id ? 'bg-white/60' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-taupe-600 rounded-full flex items-center justify-center text-white font-light flex-shrink-0">
                        {((channel.data as any)?.name || 'C')[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-text-primary font-light truncate">
                            {(channel.data as any)?.name || 'Unnamed Channel'}
                          </p>
                          <span className="text-xs text-text-muted ml-2 flex-shrink-0">
                            {/* TODO: Add timestamp */}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted truncate">
                          {/* TODO: Add last message preview */}
                          {Object.keys(channel.state.members).length} members
                        </p>
                      </div>
                      <svg className="w-4 h-4 text-taupe-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 bg-taupe-200/30 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-taupe-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-text-muted text-sm font-light">No conversations yet</p>
                  <p className="text-text-muted text-xs mt-1">Tap the compose button to start</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Window - Desktop/iPad */}
          <div className="hidden lg:flex lg:flex-1 bg-white/40 backdrop-blur-sm rounded-3xl border border-white/40 overflow-hidden">
            {selectedChannel ? (
              <Channel 
                channel={selectedChannel}
                EmptyStateIndicator={() => (
                  <div className="flex flex-col items-center justify-center w-full h-full p-8">
                    <div className="relative mb-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-taupe-400/20 to-taupe-600/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-12 h-12 text-taupe-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-taupe-600/30 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-taupe-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-light text-text-primary mb-2">No messages yet...</h3>
                    <p className="text-text-muted text-sm text-center max-w-xs">
                      Start the conversation by sending a message below
                    </p>
                  </div>
                )}
              >
                <Window>
                  <ChannelHeader />
                  <MessageList />
                  <MessageInput />
                </Window>
              </Channel>
            ) : (
              <div className="flex flex-col items-center justify-center w-full p-8">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-taupe-400/20 to-taupe-600/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-12 h-12 text-taupe-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-taupe-600/30 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-taupe-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-light text-text-primary mb-2">No chats here yet...</h3>
                <p className="text-text-muted text-sm text-center max-w-xs">
                  Select a conversation from the list or start a new message to begin chatting
                </p>
              </div>
            )}
          </div>

          {/* Chat Window - Mobile */}
          {showMobileChat && selectedChannel && (
            <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-gradient-to-b from-cream-50 to-cream-100">
              {/* Mobile Header - Fixed at top */}
              <div 
                className="flex-shrink-0 flex items-center gap-3 px-4 bg-white/90 backdrop-blur-sm border-b border-taupe-200/30"
                style={{ 
                  paddingTop: 'max(48px, env(safe-area-inset-top))',
                  paddingBottom: '16px'
                }}
              >
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="p-2 hover:bg-taupe-100/50 rounded-full transition-all active:scale-95 flex-shrink-0"
                >
                  <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="w-10 h-10 bg-taupe-600 rounded-full flex items-center justify-center text-white font-light text-lg flex-shrink-0">
                  {((selectedChannel.data as any)?.name || 'C')[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary font-light truncate text-base">
                    {(selectedChannel.data as any)?.name || 'Unnamed Channel'}
                  </p>
                  <p className="text-xs text-text-muted">
                    {Object.keys(selectedChannel.state.members).length} members
                  </p>
                </div>
              </div>

              {/* Chat Content - Fills remaining space */}
              <div className="flex-1 min-h-0">
                <Channel 
                  channel={selectedChannel}
                  EmptyStateIndicator={() => (
                    <div className="flex flex-col items-center justify-center w-full h-full p-8">
                      <div className="relative mb-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-taupe-400/20 to-taupe-600/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                          <svg className="w-12 h-12 text-taupe-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-taupe-600/30 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-taupe-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-xl font-light text-text-primary mb-2">No messages yet...</h3>
                      <p className="text-text-muted text-sm text-center max-w-xs">
                        Start the conversation by sending a message below
                      </p>
                    </div>
                  )}
                >
                  <Window>
                    <MessageList />
                    <MessageInput />
                  </Window>
                </Channel>
              </div>
            </div>
          )}
        </div>
      </Chat>

      {/* New Message Modal - iMessage Style */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-end lg:items-center justify-center">
          <div className="bg-gradient-to-b from-cream-50 to-cream-100 rounded-t-3xl lg:rounded-3xl w-full lg:max-w-md max-h-[90vh] lg:max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-taupe-200/30">
              <button 
                onClick={() => {
                  setShowNewMessageModal(false)
                  setUserSearchQuery('')
                  setSearchResults([])
                }} 
                className="text-taupe-700 hover:text-taupe-800 font-light transition-colors"
              >
                Cancel
              </button>
              <h2 className="text-lg font-light text-text-primary">New Message</h2>
              <div className="w-14"></div> {/* Spacer for centering */}
            </div>

            <div className="p-4 border-b border-taupe-200/30">
              {/* To: Field */}
              <div className="flex items-center gap-2">
                <span className="text-text-muted text-sm font-light">To:</span>
                <input
                  type="text"
                  placeholder="Type a name"
                  value={userSearchQuery}
                  onChange={(e) => {
                    setUserSearchQuery(e.target.value)
                    searchUsers(e.target.value)
                  }}
                  autoFocus
                  className="flex-1 bg-transparent text-text-primary placeholder-text-muted focus:outline-none text-sm"
                />
                {isSearching && (
                  <svg className="animate-spin h-4 w-4 text-taupe-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-140px)] lg:max-h-[calc(80vh-140px)]">
              {/* Search Results */}
              {userSearchQuery.length >= 2 ? (
                <div>
                  {searchResults.length > 0 ? (
                    searchResults.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => startDirectMessage(u)}
                        className="w-full flex items-center gap-3 p-4 hover:bg-white/50 transition-all text-left border-b border-taupe-200/20"
                      >
                        <div className="w-11 h-11 bg-taupe-600 rounded-full flex items-center justify-center text-white font-light flex-shrink-0">
                          {(u.name || u.id)[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-text-primary font-light truncate">{u.name || u.id}</p>
                        </div>
                      </button>
                    ))
                  ) : !isSearching ? (
                    <div className="text-center py-8">
                      <p className="text-text-muted text-sm font-light">No users found</p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="p-4">
                  <p className="text-xs text-text-muted font-light mb-3 px-2">SUGGESTED</p>
                  <button
                    onClick={() => {
                      setShowNewMessageModal(false)
                      setShowNewGroup(true)
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/50 rounded-2xl transition-all text-left"
                  >
                    <div className="w-11 h-11 bg-taupe-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-taupe-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-text-primary font-light">New Group</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal - iMessage Style */}
      {showNewGroup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-end lg:items-center justify-center">
          <div className="bg-gradient-to-b from-cream-50 to-cream-100 rounded-t-3xl lg:rounded-3xl w-full lg:max-w-md max-h-[90vh] lg:max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-taupe-200/30">
              <button 
                onClick={() => {
                  setShowNewGroup(false)
                  setSelectedUsers([])
                  setGroupName('')
                  setUserSearchQuery('')
                  setSearchResults([])
                }} 
                className="text-taupe-700 hover:text-taupe-800 font-light transition-colors"
              >
                Cancel
              </button>
              <h2 className="text-lg font-light text-text-primary">New Group</h2>
              <button
                onClick={createGroupChannel}
                disabled={!groupName.trim() || selectedUsers.length === 0}
                className="text-taupe-700 hover:text-taupe-800 font-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>

            <div className="p-4 border-b border-taupe-200/30">
              {/* Group Name Field */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Group Name (optional)"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-4 py-2 bg-white/60 rounded-xl border border-taupe-200/30 focus:outline-none focus:ring-2 focus:ring-taupe-400/50 text-text-primary placeholder-text-muted text-sm"
                />
              </div>

              {/* Add Members Field */}
              <div className="flex items-center gap-2">
                <span className="text-text-muted text-sm font-light">To:</span>
                <input
                  type="text"
                  placeholder="Type a name"
                  value={userSearchQuery}
                  onChange={(e) => {
                    setUserSearchQuery(e.target.value)
                    searchUsers(e.target.value)
                  }}
                  className="flex-1 bg-transparent text-text-primary placeholder-text-muted focus:outline-none text-sm"
                />
              </div>

              {/* Selected Members Pills */}
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedUsers.map(userId => {
                    const user = [...allUsers, ...searchResults].find(u => u.id === userId)
                    return user ? (
                      <div key={userId} className="flex items-center gap-1.5 px-3 py-1.5 bg-taupe-600 text-white rounded-full text-xs">
                        <span className="font-light">{user.name || user.id}</span>
                        <button
                          onClick={() => setSelectedUsers(selectedUsers.filter(id => id !== userId))}
                          className="hover:bg-taupe-700 rounded-full p-0.5 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ) : null
                  })}
                </div>
              )}
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-220px)] lg:max-h-[calc(80vh-220px)]">
              {/* User List */}
              {userSearchQuery.length >= 2 ? (
                searchResults.length > 0 ? (
                  searchResults.map((u) => (
                    <label key={u.id} className="flex items-center gap-3 p-4 hover:bg-white/50 cursor-pointer transition-all border-b border-taupe-200/20">
                      <div className="w-11 h-11 bg-taupe-600 rounded-full flex items-center justify-center text-white font-light flex-shrink-0">
                        {(u.name || u.id)[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-text-primary font-light truncate">{u.name || u.id}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(u.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, u.id])
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== u.id))
                          }
                        }}
                        className="w-5 h-5 text-taupe-700 rounded-full accent-taupe-700"
                      />
                    </label>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-text-muted text-sm font-light">No users found</p>
                  </div>
                )
              ) : (
                <div className="p-4">
                  <p className="text-xs text-text-muted font-light mb-3 px-2">SUGGESTED</p>
                  {allUsers.slice(0, 10).map((u) => (
                    <label key={u.id} className="flex items-center gap-3 p-3 hover:bg-white/50 rounded-2xl cursor-pointer transition-all mb-2">
                      <div className="w-11 h-11 bg-taupe-600 rounded-full flex items-center justify-center text-white font-light flex-shrink-0">
                        {(u.name || u.id)[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-text-primary font-light truncate">{u.name || u.id}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(u.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, u.id])
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== u.id))
                          }
                        }}
                        className="w-5 h-5 text-taupe-700 rounded-full accent-taupe-700"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
