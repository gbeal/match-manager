// TeamSetup Component - Main team creation and configuration interface
// Follows component template and touch optimization standards

'use client';

import React, { useState, useCallback } from 'react';
import { TeamForm } from './TeamForm';
import { TeamList } from './TeamList';
import type { Team } from '../../../../packages/shared/src/types';

interface TeamSetupProps {
  onTeamSelect?: (team: Team) => void;
  onTeamCreate?: (team: Team) => void;
  className?: string;
}

export const TeamSetup: React.FC<TeamSetupProps> = ({
  onTeamSelect,
  onTeamCreate,
  className = ''
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const handleCreateTeam = useCallback(() => {
    setEditingTeam(null);
    setShowForm(true);
  }, []);

  const handleEditTeam = useCallback((team: Team) => {
    setEditingTeam(team);
    setShowForm(true);
  }, []);

  const handleFormSuccess = useCallback((team: Team) => {
    setShowForm(false);
    setEditingTeam(null);
    onTeamCreate?.(team);
  }, [onTeamCreate]);

  const handleFormCancel = useCallback(() => {
    setShowForm(false);
    setEditingTeam(null);
  }, []);

  const handleTeamSelect = useCallback((team: Team) => {
    onTeamSelect?.(team);
  }, [onTeamSelect]);

  return (
    <div className={`team-setup ${className}`} role="main">
      <header className="team-setup-header mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Team Management
        </h1>
        <p className="text-gray-600">
          Create and manage your soccer teams for game day coaching
        </p>
      </header>

      {showForm ? (
        <div className="team-form-container">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingTeam ? 'Edit Team' : 'Create New Team'}
            </h2>
            <button
              onClick={handleFormCancel}
              className="touch-target p-2 text-gray-500 hover:text-gray-700"
              aria-label="Cancel team form"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <TeamForm
            team={editingTeam}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      ) : (
        <div className="team-list-container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Teams
            </h2>
            <button
              onClick={handleCreateTeam}
              className="touch-target bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Create new team"
            >
              + New Team
            </button>
          </div>

          <TeamList
            onTeamSelect={handleTeamSelect}
            onTeamEdit={handleEditTeam}
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

  .team-setup {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
  }

  @media (max-width: 640px) {
    .team-setup {
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

export default TeamSetup;