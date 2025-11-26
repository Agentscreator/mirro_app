# Apple Sign In Setup Guide

## Overview
You've enabled "Sign in with Apple" capability in Xcode. Now you need to implement it on the web side.

---

## Step 1: Configure Apple Developer Portal (15 minutes)

### 1.1 Create a Services ID
1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list/serviceId)
2. Click "+" to create a new identifier
3. Select "Services IDs" → Continue
4. Fill in:
   - **Description**: MirroSocial Sign In
   - **Identifier**: `com.mirro2.app.signin` (or similar)
5. Click "Continue" → "Register"

### 1.2 Configure the Services ID
1. Click on your newly created Services ID
2. Check "Sign in with Apple"
3. Click "Configure"
4. Set:
   - **Primary App ID**: `com.mirro2.app` (your app's Bundle ID)
   - **Domains**: `www.mirro2.com`
   - **Return URLs**: `https://www.mirro2.com/api/auth/callback/apple`
5. Click "Save" → "Continue" → "Save"

### 1.3 Create a Key for Apple Sign In
1. Go to [Keys](https://developer.apple.com/account/resources/authkeys/list)
2. Click "+" to create a new key
3. Name it "MirroSocial Apple Sign In Key"
4. Check "Sign in with Apple"
5. Click "Configure" → Select your Primary App ID
6. Click "Save" → "Continue" → "Register"
7. **Download the .p8 key file** (you can only download once!)
8. Note your **Key ID** and **Team ID**

---

## Step 2: Install Required Package

```bash
yarn add @capacitor-community/apple-sign-in
npx cap sync ios
```

---

## Step 3: Create Apple Sign In Hook

**File: `hooks/useAppleSignIn.ts`**

```typescript
"use client"

import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'

interface AppleSignInResponse {
  user?: string
  email?: string
  givenName?: string
  familyName?: string
  identityToken?: string
  authorizationCode?: string
}

export function useAppleSignIn() {
  const [isAvailable, setIsAvailable] = useState(false)

  useEffect(() => {
    // Apple Sign In is only available on iOS
    setIsAvailable(Capacitor.getPlatform() === 'ios')
  }, [])

  const signInWithApple = async (): Promise<AppleSignInResponse | null> => {
    if (!isAvailable) {
      console.log('Apple Sign In not available on this platform')
      return null
    }

    try {
      const { SignInWithApple } = await import('@capacitor-community/apple-sign-in')
      
      const result = await SignInWithApple.authorize({
        clientId: 'com.mirro2.app.signin', // Your Services ID
        redirectURI: 'https://www.mirro2.com/api/auth/callback/apple',
        scopes: 'email name',
        state: '12345',
        nonce: 'nonce'
      })

      console.log('Apple Sign In success:', result)
      
      return {
        user: result.response.user,
        email: result.response.email,
        givenName: result.response.givenName,
        familyName: result.response.familyName,
        identityToken: result.response.identityToken,
        authorizationCode: result.response.authorizationCode
      }
    } catch (error) {
      console.error('Apple Sign In error:', error)
      return null
    }
  }

  return { isAvailable, signInWithApple }
}
```

---

## Step 4: Add Apple Sign In Button to AuthPage

Update `components/AuthPage.tsx`:

```typescript
import { useAppleSignIn } from '@/hooks/useAppleSignIn'

export default function AuthPage() {
  const { isAvailable, signInWithApple } = useAppleSignIn()

  const handleAppleSignIn = async () => {
    const result = await signInWithApple()
    
    if (result) {
      // Send to your backend to create/login user
      const response = await fetch('/api/auth/apple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identityToken: result.identityToken,
          authorizationCode: result.authorizationCode,
          email: result.email,
          name: `${result.givenName} ${result.familyName}`.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Handle successful login
        window.location.href = '/home'
      }
    }
  }

  return (
    <div>
      {/* Your existing auth UI */}
      
      {isAvailable && (
        <button
          onClick={handleAppleSignIn}
          className="w-full px-4 py-3 bg-black text-white rounded-2xl flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          Continue with Apple
        </button>
      )}
    </div>
  )
}
```

---

## Step 5: Create Backend API Route

**File: `app/api/auth/apple/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { identityToken, email, name } = await request.json()

    // Verify the identity token with Apple
    // In production, you should verify the JWT signature
    const decoded = jwt.decode(identityToken) as any
    
    if (!decoded || !decoded.sub) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    const appleUserId = decoded.sub
    
    // Check if user exists in your database
    // If not, create new user with Apple ID
    // If yes, log them in
    
    // Example:
    // const user = await db.query.users.findFirst({
    //   where: eq(users.appleId, appleUserId)
    // })
    
    // if (!user) {
    //   // Create new user
    //   await db.insert(users).values({
    //     appleId: appleUserId,
    //     email: email,
    //     name: name,
    //     username: email?.split('@')[0] || `user_${Date.now()}`
    //   })
    // }

    // Create session and return success
    return NextResponse.json({ 
      success: true,
      message: 'Signed in with Apple successfully'
    })
  } catch (error) {
    console.error('Apple Sign In error:', error)
    return NextResponse.json({ error: 'Sign in failed' }, { status: 500 })
  }
}
```

---

## Step 6: Update Database Schema

Add `appleId` field to your users table:

```sql
ALTER TABLE users ADD COLUMN apple_id TEXT UNIQUE;
```

Or in Drizzle schema:

```typescript
export const users = pgTable('users', {
  // ... existing fields
  appleId: text('apple_id').unique(),
})
```

---

## Testing

1. Build and run on physical iOS device
2. Tap "Continue with Apple" button
3. Authenticate with Face ID / Touch ID
4. First time: Apple will ask to share email
5. Subsequent times: Instant sign in

---

## Important Notes

- **Email Privacy**: Users can choose to hide their email. Apple provides a relay email like `xyz@privaterelay.appleid.com`
- **Name**: Only provided on first sign in. Store it in your database!
- **Required by Apple**: If you offer Google/Facebook login, you MUST offer Apple Sign In
- **Testing**: Only works on physical devices, not simulator

---

## Troubleshooting

### "Invalid client" error
- Check Services ID matches in code and Apple Developer Portal
- Verify Return URL is exactly correct

### "User cancelled" error
- Normal - user tapped "Cancel" in Apple Sign In dialog

### No email returned
- User chose to hide email
- Use the relay email provided by Apple
