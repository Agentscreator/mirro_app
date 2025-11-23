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
          {/* Channels List */}
          <div className={`w-full md:w-1/3 flex flex-col bg-white/40 backdrop-blur-sm rounded-3xl border border-white/40 overflow-hidden ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
            {/* Search Bar */}
            <div className="p-4 border-b border-taupe-200/30">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 bg-white/60 backdrop-blur-sm rounded-2xl border border-taupe-200/30 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-taupe-400/50 transition-all"
                />
                <svg className="w-5 h-5 text-taupe-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* New Group Button */}
            <div className="p-4 border-b border-taupe-200/30">
              <button
                onClick={() => setShowNewGroup(true)}
                className="w-full px-4 py-3 bg-taupe-700 text-white rounded-2xl hover:bg-taupe-800 transition-all duration-200 flex items-center justify-center gap-2 font-light"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Group
              </button>
            </div>

            {/* Channels */}
            <div className="flex-1 overflow-y-auto">
              {filteredChannels.map((channel) => (
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
                    <div className="w-12 h-12 bg-taupe-600 rounded-full flex items-center justify-center text-white font-light">
                      {((channel.data as any)?.name || 'C')[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary font-light truncate">
                        {(channel.data as any)?.name || 'Unnamed Channel'}
                      </p>
                      <p className="text-xs text-text-muted truncate">
                        {Object.keys(channel.state.members).length} members
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Window - Desktop */}
          <div className="hidden md:flex md:flex-1 bg-white/40 backdrop-blur-sm rounded-3xl border border-white/40 overflow-hidden">
            {selectedChannel ? (
              <Channel channel={selectedChannel}>
                <Window>
                  <ChannelHeader />
                  <MessageList />
                  <MessageInput />
                </Window>
              </Channel>
            ) : (
              <div className="flex items-center justify-center w-full">
                <p className="text-text-muted font-light">Select a conversation to start messaging</p>
              </div>
            )}
          </div>

          {/* Chat Window - Mobile */}
          {showMobileChat && selectedChannel && (
            <div className="fixed inset-0 z-40 md:hidden bg-gradient-to-b from-cream-50 to-cream-100">
              <div className="flex flex-col h-full">
                {/* Mobile Header with iOS safe area */}
                <div className="flex items-center gap-3 px-4 pt-12 pb-4 bg-white/40 backdrop-blur-sm border-b border-taupe-200/30">
                  <button
                    onClick={() => setShowMobileChat(false)}
                    className="p-2 hover:bg-taupe-100/50 rounded-full transition-all active:scale-95"
                  >
                    <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="w-10 h-10 bg-taupe-600 rounded-full flex items-center justify-center text-white font-light text-lg">
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

                {/* Chat Content with bottom safe area */}
                <div className="flex-1 overflow-hidden bg-white/20 pb-24">
                  <Channel channel={selectedChannel}>
                    <Window>
                      <MessageList />
                      <MessageInput />
                    </Window>
                  </Channel>
                </div>
              </div>
            </div>
          )}
        </div>
      </Chat>

      {/* New Group Modal */}
      {showNewGroup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-cream-50 to-cream-100 rounded-3xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-taupe-200/30">
              <h2 className="text-xl font-light text-text-primary">Create Group</h2>
              <button onClick={() => setShowNewGroup(false)} className="p-2 hover:bg-taupe-100/50 rounded-full">
                <svg className="w-5 h-5 text-text-muted" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
              <input
                type="text"
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-4 py-3 bg-white/60 rounded-2xl border border-taupe-200/30 focus:outline-none focus:ring-2 focus:ring-taupe-400/50"
              />

              <div className="space-y-2">
                <p className="text-sm text-text-muted font-light">Select members:</p>
                {allUsers.map((u) => (
                  <label key={u.id} className="flex items-center gap-3 p-3 bg-white/40 rounded-2xl hover:bg-white/60 cursor-pointer">
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
                      className="w-5 h-5 text-taupe-700 rounded"
                    />
                    <span className="text-text-primary font-light">{u.name || u.id}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-taupe-200/30">
              <button
                onClick={createGroupChannel}
                disabled={!groupName.trim() || selectedUsers.length === 0}
                className="w-full px-4 py-3 bg-taupe-700 text-white rounded-2xl hover:bg-taupe-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
