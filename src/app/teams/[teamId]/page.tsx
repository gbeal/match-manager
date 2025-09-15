'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Team, Player } from '../../../../packages/shared/src/types';
import { TeamProvider, useTeamContext } from '@/stores/TeamContext';

interface TeamDetailContentProps {
  teamId: string;
}

function TeamDetailContent({ teamId }: TeamDetailContentProps) {
  const { teams, players, loading, error, loadTeams, loadPlayers } = useTeamContext();
  const [team, setTeam] = useState<Team | null>(null);
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      await loadTeams();
      await loadPlayers();
    };
    loadData();
  }, [loadTeams, loadPlayers]);

  useEffect(() => {
    const currentTeam = teams.find(t => t.id === teamId);
    if (currentTeam) {
      setTeam(currentTeam);
      const currentTeamPlayers = players.filter(p => p.teamId === teamId);
      setTeamPlayers(currentTeamPlayers);
    }
  }, [teams, players, teamId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading team details...</div>
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

  const activePlayers = teamPlayers.filter(p => p.isActive);
  const inactivePlayers = teamPlayers.filter(p => !p.isActive);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Link
                href="/teams"
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                ← Back to Teams
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {team.name}
            </h1>
            <p className="text-gray-600">
              Team details and player management
            </p>
          </div>

          {/* Team Info Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Team Information</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Created: {new Date(team.createdAt).toLocaleDateString()}</div>
                  <div>Total Players: {teamPlayers.length}</div>
                  <div>Active Players: {activePlayers.length}</div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Team Settings</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Formation: {team.settings.defaultFormation}</div>
                  <div>Strategy: {team.settings.preferredStrategy}</div>
                  <div>Shift Length: {team.settings.defaultShiftLength} min</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Link
              href={`/teams/${teamId}/players`}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium min-h-[44px] flex items-center justify-center"
            >
              Manage Players
            </Link>
            <button
              onClick={() => router.push(`/teams/${teamId}/edit`)}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors text-center font-medium min-h-[44px]"
            >
              Edit Team Settings
            </button>
          </div>

          {/* Player Summary */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Player Summary</h3>

            {activePlayers.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Active Players ({activePlayers.length})</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {activePlayers.slice(0, 6).map(player => (
                      <div key={player.id} className="bg-gray-50 rounded p-3">
                        <div className="font-medium text-sm">#{player.jerseyNumber} {player.name}</div>
                        <div className="text-xs text-gray-600">
                          {player.positions.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                  {activePlayers.length > 6 && (
                    <div className="text-sm text-gray-600 mt-2">
                      +{activePlayers.length - 6} more players
                    </div>
                  )}
                </div>

                {inactivePlayers.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Inactive Players ({inactivePlayers.length})</h4>
                    <div className="text-sm text-gray-600">
                      {inactivePlayers.map(p => p.name).join(', ')}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">No players added yet</div>
                <Link
                  href={`/teams/${teamId}/players`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                >
                  Add First Player
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  return (
    <TeamProvider>
      <TeamDetailContent teamId={teamId} />
    </TeamProvider>
  );
}