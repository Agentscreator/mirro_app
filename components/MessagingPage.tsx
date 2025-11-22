"use client"

import { useEffect, useState } from 'react'
import { StreamChat } from 'stream-chat'
import {
  Chat,
  Channel,
  ChannelHeader,
  ChannelList,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from 'stream-chat-react'
import 'stream-chat-react/dist/css/v2/index.css'

interface MessagingPageProps {
  user: {
    id: string
    name: string
    username: string
  }
}

export default function MessagingPage({ user }: MessagingPageProps) {
  const [client, setClient] = useState<StreamChat | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initChat = async () => {
      try {
        // Get token from API
        const response = await fetch('/api/chat/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            userName: user.name || user.username,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to get chat token')
        }

        const { token, apiKey } = await response.json()

        // Initialize Stream client
        const chatClient = StreamChat.getInstance(apiKey)

        await chatClient.connectUser(
          {
            id: user.id,
            name: user.name || user.username,
          },
          token
        )

        setClient(chatClient)
      } catch (error) {
        console.error('Error initializing chat:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initChat()

    return () => {
      client?.disconnectUser()
    }
  }, [user])

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

  const filters = { members: { $in: [user.id] } }
  const sort = { last_message_at: -1 as const }

  return (
    <div className="h-[calc(100vh-200px)] pb-20">
      <Chat client={client} theme="str-chat__theme-light">
        <div className="flex h-full">
          <div className="w-full md:w-1/3 border-r border-taupe-200">
            <ChannelList
              filters={filters}
              sort={sort}
              options={{ limit: 10 }}
            />
          </div>
          <div className="hidden md:flex md:w-2/3 flex-col">
            <Channel>
              <Window>
                <ChannelHeader />
                <MessageList />
                <MessageInput />
              </Window>
              <Thread />
            </Channel>
          </div>
        </div>
      </Chat>
    </div>
  )
}
