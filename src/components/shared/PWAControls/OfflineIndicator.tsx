'use client'

import { useOfflineStatus } from '@/hooks/useOfflineStatus'

export default function OfflineIndicator() {
  const { isOnline, lastOfflineAt } = useOfflineStatus()

  if (isOnline) {
    return null
  }

  const offlineTime = lastOfflineAt ? new Date().getTime() - lastOfflineAt.getTime() : 0
  const offlineMinutes = Math.floor(offlineTime / (1000 * 60))

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 text-sm font-medium text-center safe-area-top">
      <div className="flex items-center justify-center space-x-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <span>
          You&apos;re offline {offlineMinutes > 0 && `for ${offlineMinutes}m`}
        </span>
        <span className="text-xs opacity-90">
          • All data saved locally
        </span>
      </div>
    </div>
  )
}