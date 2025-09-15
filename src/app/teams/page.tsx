'use client';

import { TeamSetup } from '@/components/setup/TeamSetup';
import { TeamProvider } from '@/stores/TeamContext';

export default function TeamsPage() {
  return (
    <TeamProvider>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Team Management
              </h1>
              <p className="text-gray-600">
                Create and manage your teams for match scheduling and player management.
              </p>
            </div>

            <TeamSetup />
          </div>
        </div>
      </div>
    </TeamProvider>
  );
}