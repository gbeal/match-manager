// TeamList Component - Display and manage existing teams
// Implements touch optimization and accessibility

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Team } from '../../../../packages/shared/src/types';
import { getTeamRepository } from '../../../services/persistence/database';

interface TeamListProps {
  onTeamSelect: (team: Team) => void;
  onTeamEdit: (team: Team) => void;
}

export const TeamList: React.FC<TeamListProps> = ({
  onTeamSelect,
  onTeamEdit
}) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);

  const loadTeams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const teamRepository = getTeamRepository();
      const loadedTeams = await teamRepository.findAll();
      setTeams(loadedTeams);
    } catch (err) {
      console.error('Failed to load teams:', err);
      setError('Failed to load teams. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const handleDeleteTeam = useCallback(async (team: Team, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent team selection when clicking delete

    if (!confirm(`Are you sure you want to delete "${team.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingTeamId(team.id);
      const teamRepository = getTeamRepository();
      await teamRepository.delete(team.id);

      // Remove team from local state
      setTeams(prev => prev.filter(t => t.id !== team.id));
    } catch (error) {
      console.error('Failed to delete team:', error);
      alert('Failed to delete team. Please try again.');
    } finally {
      setDeletingTeamId(null);
    }
  }, []);

  const handleEditTeam = useCallback((team: Team, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent team selection when clicking edit
    onTeamEdit(team);
  }, [onTeamEdit]);

  if (loading) {
    return (
      <div className="team-list-loading flex items-center justify-center py-12">
        <div className="flex items-center space-x-2 text-gray-600">
          <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span>Loading teams...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="team-list-error bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-red-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
        <button
          onClick={loadTeams}
          className="mt-3 touch-target bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (teams && teams.length === 0) {
    return (
      <div className="team-list-empty text-center py-12">
        <div className="mb-4">
          <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Teams Yet</h3>
        <p className="text-gray-600 mb-4">
          Create your first team to start managing players and games
        </p>
      </div>
    );
  }

  return (
    <div className="team-list space-y-3">
      {teams && teams.map((team) => (
        <div
          key={team.id}
          onClick={() => onTeamSelect(team)}
          className="
            team-card bg-white border border-gray-200 rounded-lg p-4 cursor-pointer
            hover:border-blue-300 hover:shadow-md transition-all duration-200
            focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2
          "
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onTeamSelect(team);
            }
          }}
          aria-label={`Select team ${team.name}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {team.name}
              </h3>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>Formation: {team.settings.defaultFormation.name}</span>
                <span>Strategy: {team.settings.preferredStrategy.replace('-', ' ')}</span>
                <span>Shift: {team.settings.defaultShiftLength}min</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Created {new Date(team.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              {/* Edit Button */}
              <button
                onClick={(e) => handleEditTeam(team, e)}
                className="
                  touch-target p-2 text-gray-400 hover:text-blue-600 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                "
                aria-label={`Edit team ${team.name}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>

              {/* Delete Button */}
              <button
                onClick={(e) => handleDeleteTeam(team, e)}
                disabled={deletingTeamId === team.id}
                className="
                  touch-target p-2 text-gray-400 hover:text-red-600 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                aria-label={`Delete team ${team.name}`}
              >
                {deletingTeamId === team.id ? (
                  <div className="w-5 h-5 animate-spin border-2 border-red-600 border-t-transparent rounded-full"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};