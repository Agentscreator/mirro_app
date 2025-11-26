'use client';

import { MessageInput } from 'stream-chat-react';
import { useEffect, useState } from 'react';
import { canSendMessage } from '@/lib/parental-controls';

interface RestrictedMessageInputProps {
  currentUserId: string;
  channelMembers: string[];
}

export default function RestrictedMessageInput({ currentUserId, channelMembers }: RestrictedMessageInputProps) {
  const [canSend, setCanSend] = useState(true);
  const [restrictionMessage, setRestrictionMessage] = useState('');

  useEffect(() => {
    const checkRestrictions = async () => {
      // Check if user can send messages to all channel members
      for (const memberId of channelMembers) {
        if (memberId !== currentUserId) {
          const result = await canSendMessage(currentUserId, memberId);
          if (!result.allowed) {
            setCanSend(false);
            setRestrictionMessage(result.reason || 'Messaging is restricted');
            return;
          }
        }
      }
      setCanSend(true);
    };

    checkRestrictions();
  }, [currentUserId, channelMembers]);

  if (!canSend) {
    return (
      <div className="p-4 bg-yellow-50 border-t border-yellow-200">
        <div className="flex items-center gap-2 text-yellow-800">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm">{restrictionMessage}</p>
        </div>
      </div>
    );
  }

  return <MessageInput />;
}
