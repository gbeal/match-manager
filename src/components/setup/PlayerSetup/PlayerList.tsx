// PlayerList Component - Display and manage team players
// Implements touch optimization and accessibility

'use client';

import React, { useState, useCallback } from 'react';
import type { Player } from '../../../../packages/shared/src/types';
import { getPlayerRepository } from '../../../services/persistence/database';

interface PlayerListProps {
  players: Player[];
  onPlayerSelect?: (player: Player) => void;
  onPlayerEdit: (player: Player) => void;
  onPlayerDelete: (playerId: string) => void;
}

export const PlayerList: React.FC<PlayerListProps> = ({
  players,
  onPlayerSelect,
  onPlayerEdit,
  onPlayerDelete
}) => {
  const [deletingPlayerId, setDeletingPlayerId] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const activePlayers = players.filter(p => p.isActive);
  const inactivePlayers = players.filter(p => !p.isActive);
  const displayedPlayers = showInactive ? players : activePlayers;

  const handleDeletePlayer = useCallback(async (player: Player, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent player selection when clicking delete

    if (!confirm(`Are you sure you want to delete "${player.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingPlayerId(player.id);
      const playerRepository = getPlayerRepository();
      await playerRepository.delete(player.id);
      onPlayerDelete(player.id);
    } catch (error) {
      console.error('Failed to delete player:', error);
      alert('Failed to delete player. Please try again.');
    } finally {
      setDeletingPlayerId(null);
    }
  }, [onPlayerDelete]);

  const handleEditPlayer = useCallback((player: Player, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent player selection when clicking edit
    onPlayerEdit(player);
  }, [onPlayerEdit]);

  const handleTogglePlayerStatus = useCallback(async (player: Player, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent player selection when clicking toggle

    try {
      const playerRepository = getPlayerRepository();
      if (player.isActive) {
        await playerRepository.deactivatePlayer(player.id);
      } else {
        await playerRepository.reactivatePlayer(player.id);
      }

      // This would trigger a reload in the parent component
      // For now, we'll handle it optimistically
      player.isActive = !player.isActive;
    } catch (error) {
      console.error('Failed to toggle player status:', error);
      alert('Failed to update player status. Please try again.');
    }
  }, []);


  if (players.length === 0) {
    return (
      <div className="player-list-empty text-center py-12">
        <div className="mb-4">
          <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Players Yet</h3>
        <p className="text-gray-600 mb-4">
          Add players to your team roster to start managing games
        </p>
      </div>
    );
  }

  return (
    <div className="player-list">
      {/* Filter Controls */}
      {inactivePlayers.length > 0 && (
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Show inactive players ({inactivePlayers.length})
            </span>
          </label>
        </div>
      )}

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedPlayers.map((player) => (
          <div
            key={player.id}
            onClick={() => onPlayerSelect?.(player)}
            className={`
              player-card bg-white border-2 rounded-lg p-4 transition-all duration-200
              ${player.isActive
                ? 'border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer'
                : 'border-gray-100 bg-gray-50 opacity-75'
              }
              focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2
            `}
            role={onPlayerSelect ? "button" : undefined}
            tabIndex={onPlayerSelect ? 0 : undefined}
            onKeyDown={(e) => {
              if (onPlayerSelect && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onPlayerSelect(player);
              }
            }}
            aria-label={onPlayerSelect ? `Select player ${player.name}` : undefined}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {player.name}
                  </h3>
                  {!player.isActive && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  #{player.jerseyNumber}
                </div>
              </div>
            </div>

            {/* Player Positions */}
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-1">Positions:</div>
              <div className="flex flex-wrap gap-1">
                {player.positions.map((position) => (
                  <span
                    key={position}
                    className={`
                      text-xs px-2 py-1 rounded-full
                      ${position === 'goalkeeper'
                        ? 'bg-yellow-100 text-yellow-800'
                        : position === 'defender'
                        ? 'bg-red-100 text-red-800'
                        : position === 'midfielder'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-purple-100 text-purple-800'
                      }
                    `}
                  >
                    {position.charAt(0).toUpperCase() + position.slice(1)}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                {/* Edit Button */}
                <button
                  onClick={(e) => handleEditPlayer(player, e)}
                  className="
                    touch-target p-2 text-gray-400 hover:text-blue-600 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  "
                  aria-label={`Edit player ${player.name}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>

                {/* Toggle Active Status */}
                <button
                  onClick={(e) => handleTogglePlayerStatus(player, e)}
                  className={`
                    touch-target p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${player.isActive
                      ? 'text-gray-400 hover:text-orange-600 focus:ring-orange-500'
                      : 'text-gray-400 hover:text-green-600 focus:ring-green-500'
                    }
                  `}
                  aria-label={`${player.isActive ? 'Deactivate' : 'Activate'} player ${player.name}`}
                >
                  {player.isActive ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Delete Button */}
              <button
                onClick={(e) => handleDeletePlayer(player, e)}
                disabled={deletingPlayerId === player.id}
                className="
                  touch-target p-2 text-gray-400 hover:text-red-600 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                aria-label={`Delete player ${player.name}`}
              >
                {deletingPlayerId === player.id ? (
                  <div className="w-4 h-4 animate-spin border-2 border-red-600 border-t-transparent rounded-full"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{activePlayers.length}</div>
            <div className="text-sm text-gray-600">Active Players</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {activePlayers.filter(p => p.positions.includes('goalkeeper')).length}
            </div>
            <div className="text-sm text-gray-600">Goalkeepers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {activePlayers.filter(p => p.positions.includes('midfielder')).length}
            </div>
            <div className="text-sm text-gray-600">Midfielders</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {activePlayers.filter(p => p.positions.includes('forward')).length}
            </div>
            <div className="text-sm text-gray-600">Forwards</div>
          </div>
        </div>
      </div>
    </div>
  );
};