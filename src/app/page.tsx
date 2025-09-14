import { OfflineIndicator, PWAInstallPrompt } from "@/components/shared/PWAControls";

export default function Home() {
  return (
    <>
      <OfflineIndicator />
      <PWAInstallPrompt />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center p-4 safe-area-top safe-area-bottom">
        <main className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-600 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Match Manager
            </h1>
            <p className="text-gray-600 mb-6">
              Soccer Coach Assistant - PWA Foundation Setup Complete
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-lg text-left">
              <h3 className="font-semibold text-emerald-800 mb-2">✅ PWA Features Active:</h3>
              <ul className="text-sm text-emerald-700 space-y-1">
                <li>• Offline functionality enabled</li>
                <li>• Installable as native app</li>
                <li>• Mobile-optimized interface</li>
                <li>• Service worker configured</li>
              </ul>
            </div>

            <div className="text-sm text-gray-500">
              <p>Story 1.1: PWA Foundation Setup</p>
              <p className="text-xs">Ready for Epic 1 - Story 1.2: Team and Player Data Management</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
