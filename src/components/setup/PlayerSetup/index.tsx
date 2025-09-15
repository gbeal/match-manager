// PlayerSetup Component - Main player management interface for a team
// Follows component template and touch optimization standards

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PlayerForm } from './PlayerForm';
import { PlayerList } from './PlayerList';
import type { Player, Team } from '../../../../packages/shared/src/types';
import { getPlayerRepository, getTeamRepository } from '../../../services/persistence/database';

interface PlayerSetupProps {
  team?: Team;
  teamId?: string;
  onBack?: () => void;
  onPlayerSelect?: (player: Player) => void;
  className?: string;
}

export const PlayerSetup: React.FC<PlayerSetupProps> = ({
  team: propTeam,
  teamId: propTeamId,
  onBack,
  onPlayerSelect,
  className = ''
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [team, setTeam] = useState<Team | null>(propTeam || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const teamId = propTeam?.id || propTeamId;

  const loadTeamData = useCallback(async () => {
    if (propTeam) {
      setTeam(propTeam);
      return;
    }

    if (propTeamId) {
      try {
        const teamRepository = getTeamRepository();
        const teamData = await teamRepository.findById(propTeamId);
        if (teamData) {
          setTeam(teamData);
        } else {
          setError('Team not found');
        }
      } catch (err) {
        console.error('Failed to load team:', err);
        setError('Failed to load team data');
      }
    }
  }, [propTeam, propTeamId]);

  const loadPlayers = useCallback(async () => {
    if (!teamId) return;

    try {
      setLoading(true);
      setError(null);
      const playerRepository = getPlayerRepository();
      const teamPlayers = await playerRepository.findByTeamId(teamId);
      setPlayers(teamPlayers);
    } catch (err) {
      console.error('Failed to load players:', err);
      setError('Failed to load players. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    loadTeamData();
  }, [loadTeamData]);

  useEffect(() => {
    if (team) {
      loadPlayers();
    }
  }, [team, loadPlayers]);

  const handleCreatePlayer = useCallback(() => {
    setEditingPlayer(null);
    setShowForm(true);
  }, []);

  const handleEditPlayer = useCallback((player: Player) => {
    setEditingPlayer(player);
    setShowForm(true);
  }, []);

  const handleFormSuccess = useCallback((player: Player) => {
    setShowForm(false);
    setEditingPlayer(null);

    // Update local players list
    setPlayers(prev => {
      if (editingPlayer) {
        // Update existing player
        return prev.map(p => p.id === player.id ? player : p);
      } else {
        // Add new player
        return [...prev, player];
      }
    });
  }, [editingPlayer]);

  const handleFormCancel = useCallback(() => {
    setShowForm(false);
    setEditingPlayer(null);
  }, []);

  const handlePlayerDelete = useCallback((playerId: string) => {
    // Remove player from local state
    setPlayers(prev => prev.filter(p => p.id !== playerId));
  }, []);

  const handlePlayerSelect = useCallback((player: Player) => {
    onPlayerSelect?.(player);
  }, [onPlayerSelect]);

  if (loading || !team) {
    return (
      <div className="player-setup-loading flex items-center justify-center py-12">
        <div className="flex items-center space-x-2 text-gray-600">
          <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span>Loading team data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="player-setup-error bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-red-600 mb-3">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
        <button
          onClick={() => {
            loadTeamData();
            loadPlayers();
          }}
          className="touch-target bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`player-setup ${className}`} role="main">
      <header className="player-setup-header mb-6">
        <div className="flex items-center space-x-4 mb-4">
          {onBack && (
            <button
              onClick={onBack}
              className="touch-target p-2 text-gray-500 hover:text-gray-700 rounded-lg"
              aria-label="Go back to team management"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {team.name} - Players
            </h1>
            <p className="text-gray-600">
              Manage your team roster and player positions
            </p>
          </div>
        </div>
      </header>

      {showForm ? (
        <div className="player-form-container">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingPlayer ? 'Edit Player' : 'Add New Player'}
            </h2>
            <button
              onClick={handleFormCancel}
              className="touch-target p-2 text-gray-500 hover:text-gray-700"
              aria-label="Cancel player form"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <PlayerForm
            team={team}
            player={editingPlayer}
            existingPlayers={players}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      ) : (
        <div className="player-list-container">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Team Roster
              </h2>
              <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                {players.filter(p => p.isActive).length} active players
              </span>
            </div>
            <button
              onClick={handleCreatePlayer}
              className="touch-target bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Add new player"
            >
              + Add Player
            </button>
          </div>

          <PlayerList
            players={players}
            onPlayerSelect={handlePlayerSelect}
            onPlayerEdit={handleEditPlayer}
            onPlayerDelete={handlePlayerDelete}
          />
        </div>
      )}
    </div>
  );
};

// Add CSS classes for touch optimization
const styles = `
  .touch-target {
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .player-setup {
    max-width: 1000px;
    margin: 0 auto;
    padding: 1rem;
  }

  @media (max-width: 640px) {
    .player-setup {
      padding: 0.5rem;
    }
  }
`;

// Inject styles (for Next.js, this would typically be in a CSS module)
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default PlayerSetup;