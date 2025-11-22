# Messaging System Setup Guide

## Overview
Simple messaging system integrated using Stream Chat SDK.

## Setup Instructions

### 1. Get Stream API Credentials

1. Go to [Stream Dashboard](https://getstream.io/dashboard/)
2. Sign up or log in
3. Create a new app or use an existing one
4. Copy your API Key and Secret

### 2. Configure Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_STREAM_API_KEY=your_api_key_here
STREAM_API_SECRET=your_api_secret_here
```

### 3. Features

- **Channel List**: View all your conversations
- **Real-time Messaging**: Send and receive messages instantly
- **User Authentication**: Automatic user creation and token generation
- **Responsive Design**: Works on mobile and desktop

### 4. Usage

The messaging icon is now in the bottom navigation bar. Click it to:
- View your conversations
- Start new chats
- Send messages in real-time

### 5. API Endpoint

**POST** `/api/chat/token`
- Generates Stream Chat tokens for authenticated users
- Automatically creates/updates users in Stream

### 6. Components

- `MessagingPage.tsx` - Main messaging interface
- `BottomNavigation.tsx` - Updated with messages icon
- `/api/chat/token/route.ts` - Token generation endpoint

### 7. Customization

The messaging UI uses Stream's default theme. To customize:
- Modify the CSS in `MessagingPage.tsx`
- Override Stream's CSS classes
- Use Stream's theming options

### 8. Mobile Support

The messaging system is fully responsive and works on:
- iOS (via Capacitor)
- Android (via Capacitor)
- Web browsers

## Troubleshooting

**Issue**: "Failed to load messaging"
- Check that environment variables are set correctly
- Verify Stream API credentials are valid

**Issue**: Messages not sending
- Check network connection
- Verify user is authenticated
- Check browser console for errors
