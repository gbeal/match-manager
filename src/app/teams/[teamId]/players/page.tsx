'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Team } from '../../../../../packages/shared/src/types';
import { PlayerSetup } from '@/components/setup/PlayerSetup';
import { TeamProvider, useTeamContext } from '@/stores/TeamContext';

interface PlayerManagementContentProps {
  teamId: string;
}

function PlayerManagementContent({ teamId }: PlayerManagementContentProps) {
  const { teams, loading, error, loadTeams } = useTeamContext();
  const [team, setTeam] = useState<Team | null>(null);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  useEffect(() => {
    const currentTeam = teams.find(t => t.id === teamId);
    if (currentTeam) {
      setTeam(currentTeam);
    }
  }, [teams, teamId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading team data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-4">Team not found</div>
          <Link
            href="/teams"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Link
                href={`/teams/${teamId}`}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                ← Back to {team.name}
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Player Management
            </h1>
            <p className="text-gray-600">
              Manage players for <strong>{team.name}</strong>
            </p>
          </div>

          {/* Player Setup Component */}
          <PlayerSetup teamId={teamId} />
        </div>
      </div>
    </div>
  );
}

export default function PlayerManagementPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  return (
    <TeamProvider>
      <PlayerManagementContent teamId={teamId} />
    </TeamProvider>
  );
}