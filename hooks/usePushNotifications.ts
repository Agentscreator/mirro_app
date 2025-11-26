"use client"

import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'

// Type definitions for push notifications
interface PushNotificationToken {
  value: string
}

interface PushNotificationError {
  error: string
}

interface PushNotification {
  id: string
  title?: string
  body?: string
  data: Record<string, any>
  badge?: number
}

interface PushNotificationActionPerformed {
  actionId: string
  notification: PushNotification
}

export function usePushNotifications(userId: string | null, streamClient: any) {
  useEffect(() => {
    // Only run on native platforms
    if (!userId || !streamClient || !Capacitor.isNativePlatform()) {
      console.log('Push notifications: Not on native platform or missing requirements')
      return
    }

    const setupPushNotifications = async () => {
      try {
        // Dynamically import PushNotifications (only available on native)
        const { PushNotifications } = await import('@capacitor/push-notifications')

        console.log('Requesting push notification permissions...')
        
        // Request permission
        const permission = await PushNotifications.requestPermissions()
        
        if (permission.receive === 'granted') {
          console.log('Push notification permission granted')
          
          // Register with APNs/FCM
          await PushNotifications.register()
          console.log('Registered for push notifications')
        } else {
          console.log('Push notification permission denied')
          return
        }

        // Listen for registration success
        await PushNotifications.addListener('registration', async (token: PushNotificationToken) => {
          console.log('Push registration success, token:', token.value)
          
          try {
            // Register device with Stream Chat
            // For iOS, use 'apn' provider
            const platform = Capacitor.getPlatform()
            const provider = platform === 'ios' ? 'apn' : 'firebase'
            
            await streamClient.addDevice(token.value, provider, userId)
            console.log(`Device registered with Stream Chat (${provider})`)
          } catch (error) {
            console.error('Error registering device with Stream:', error)
          }
        })

        // Listen for registration errors
        await PushNotifications.addListener('registrationError', (error: PushNotificationError) => {
          console.error('Push registration error:', error)
        })

        // Handle notification received while app is in foreground
        await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotification) => {
          console.log('Push notification received (foreground):', notification)
          
          // Optionally show in-app notification or update UI
          // You could use a toast notification here
        })

        // Handle notification tap (opens app from background)
        await PushNotifications.addListener('pushNotificationActionPerformed', (action: PushNotificationActionPerformed) => {
          console.log('Push notification action performed:', action)
          
          // Navigate to the relevant chat
          const data = action.notification.data
          
          if (data.channel_id) {
            // Navigate to the specific channel
            console.log('Opening channel:', data.channel_id)
            
            // Use router or window location to navigate
            if (typeof window !== 'undefined') {
              window.location.href = `/messages?channel=${data.channel_id}`
            }
          } else if (data.channel_type && data.channel_id) {
            // Alternative data structure
            window.location.href = `/messages?channel=${data.channel_type}:${data.channel_id}`
          } else {
            // Just open messages page
            window.location.href = '/messages'
          }
        })

        console.log('Push notification listeners set up successfully')
      } catch (error) {
        console.error('Error setting up push notifications:', error)
      }
    }

    setupPushNotifications()

    // Cleanup function
    return () => {
      if (Capacitor.isNativePlatform()) {
        import('@capacitor/push-notifications').then(({ PushNotifications }) => {
          PushNotifications.removeAllListeners()
          console.log('Push notification listeners removed')
        })
      }
    }
  }, [userId, streamClient])

  // Optional: Function to manually unregister device
  const unregisterDevice = async () => {
    if (!streamClient || !Capacitor.isNativePlatform()) return

    try {
      const { PushNotifications } = await import('@capacitor/push-notifications')
      
      // Get current devices
      const devices = await streamClient.getDevices()
      
      // Remove all devices for this user
      for (const device of devices.devices) {
        await streamClient.removeDevice(device.id)
      }
      
      console.log('Device unregistered from Stream Chat')
    } catch (error) {
      console.error('Error unregistering device:', error)
    }
  }

  return { unregisterDevice }
}
