'use client'

import { useState, useEffect } from 'react'

export interface OfflineStatus {
  isOnline: boolean
  isOffline: boolean
  wasOffline: boolean
  lastOnlineAt: Date | null
  lastOfflineAt: Date | null
}

export function useOfflineStatus(): OfflineStatus {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(null)
  const [lastOfflineAt, setLastOfflineAt] = useState<Date | null>(null)

  useEffect(() => {
    // Set initial state
    const initialOnlineState = navigator.onLine
    setIsOnline(initialOnlineState)

    if (initialOnlineState) {
      setLastOnlineAt(new Date())
    } else {
      setLastOfflineAt(new Date())
      setWasOffline(true)
    }

    const handleOnline = () => {
      const now = new Date()
      setIsOnline(true)
      setLastOnlineAt(now)

      // If we were offline, mark that we've recovered
      if (!isOnline) {
        setWasOffline(true)
      }
    }

    const handleOffline = () => {
      const now = new Date()
      setIsOnline(false)
      setLastOfflineAt(now)
      setWasOffline(true)
    }

    // Listen for connectivity changes
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isOnline])

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
    lastOnlineAt,
    lastOfflineAt
  }
}