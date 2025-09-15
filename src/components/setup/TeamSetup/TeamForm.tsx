// TeamForm Component - Form for creating and editing teams
// Implements validation and touch optimization

'use client';

import React, { useState, useCallback } from 'react';
import type { Team, TeamSettings, Formation, SubstitutionStrategy } from '../../../../packages/shared/src/types';
import { getTeamRepository } from '../../../services/persistence/database';

interface TeamFormProps {
  team?: Team | null;
  onSuccess: (team: Team) => void;
  onCancel: () => void;
}

interface FormData {
  name: string;
  defaultShiftLength: number;
  advanceWarningTime: number;
  preferredStrategy: SubstitutionStrategy;
}

interface FormErrors {
  name?: string;
  defaultShiftLength?: string;
  advanceWarningTime?: string;
}

// Default formations (simplified for MVP)
const DEFAULT_FORMATIONS: Formation[] = [
  {
    name: '4-4-2',
    positions: [],
    description: 'Balanced formation with solid defense and midfield'
  },
  {
    name: '4-3-3',
    positions: [],
    description: 'Attacking formation with three forwards'
  },
  {
    name: '3-5-2',
    positions: [],
    description: 'Midfield-heavy formation for possession play'
  }
];

export const TeamForm: React.FC<TeamFormProps> = ({
  team,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: team?.name || '',
    defaultShiftLength: team?.settings.defaultShiftLength || 15,
    advanceWarningTime: team?.settings.advanceWarningTime || 3,
    preferredStrategy: team?.settings.preferredStrategy || 'equal-time'
  });

  const [selectedFormation, setSelectedFormation] = useState<Formation>(
    team?.settings.defaultFormation || DEFAULT_FORMATIONS[0]
  );

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Team name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Team name must be less than 50 characters';
    }

    // Shift length validation
    if (formData.defaultShiftLength < 5) {
      newErrors.defaultShiftLength = 'Shift length must be at least 5 minutes';
    } else if (formData.defaultShiftLength > 45) {
      newErrors.defaultShiftLength = 'Shift length must be less than 45 minutes';
    }

    // Warning time validation
    if (formData.advanceWarningTime < 1) {
      newErrors.advanceWarningTime = 'Warning time must be at least 1 minute';
    } else if (formData.advanceWarningTime > 10) {
      newErrors.advanceWarningTime = 'Warning time must be less than 10 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const teamRepository = getTeamRepository();

      const teamSettings: TeamSettings = {
        defaultFormation: selectedFormation,
        preferredStrategy: formData.preferredStrategy,
        defaultShiftLength: formData.defaultShiftLength,
        advanceWarningTime: formData.advanceWarningTime
      };

      let savedTeam: Team;

      if (team) {
        // Update existing team
        savedTeam = await teamRepository.update(team.id, {
          name: formData.name.trim(),
          settings: teamSettings
        });
      } else {
        // Create new team
        savedTeam = await teamRepository.create({
          name: formData.name.trim(),
          settings: teamSettings
        });
      }

      onSuccess(savedTeam);
    } catch (error) {
      console.error('Failed to save team:', error);
      if (error instanceof Error && error.message.includes('name')) {
        setErrors({ name: 'Team name already exists' });
      } else {
        setErrors({ name: 'Failed to save team. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, selectedFormation, team, validateForm, onSuccess]);

  return (
    <form onSubmit={handleSubmit} className="team-form space-y-6" noValidate>
      {/* Team Name */}
      <div className="form-group">
        <label htmlFor="team-name" className="block text-sm font-medium text-gray-700 mb-2">
          Team Name *
        </label>
        <input
          id="team-name"
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={`
            w-full px-4 py-3 rounded-lg border text-base
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'}
          `}
          placeholder="Enter team name (e.g., Lightning U12)"
          aria-describedby={errors.name ? 'team-name-error' : undefined}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p id="team-name-error" className="mt-2 text-sm text-red-600" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      {/* Formation Selection */}
      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Default Formation
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DEFAULT_FORMATIONS.map((formation) => (
            <button
              key={formation.name}
              type="button"
              onClick={() => setSelectedFormation(formation)}
              className={`
                touch-target p-4 rounded-lg border-2 text-left transition-colors
                ${selectedFormation.name === formation.name
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                }
              `}
              disabled={isSubmitting}
            >
              <div className="font-medium">{formation.name}</div>
              <div className="text-sm text-gray-600 mt-1">{formation.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Game Settings */}
      <div className="form-group">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Game Settings</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Default Shift Length */}
          <div>
            <label htmlFor="shift-length" className="block text-sm font-medium text-gray-700 mb-2">
              Default Shift Length (minutes) *
            </label>
            <input
              id="shift-length"
              type="number"
              min="5"
              max="45"
              value={formData.defaultShiftLength}
              onChange={(e) => handleInputChange('defaultShiftLength', parseInt(e.target.value) || 15)}
              className={`
                w-full px-4 py-3 rounded-lg border text-base
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${errors.defaultShiftLength ? 'border-red-500 bg-red-50' : 'border-gray-300'}
              `}
              aria-describedby={errors.defaultShiftLength ? 'shift-length-error' : undefined}
              disabled={isSubmitting}
            />
            {errors.defaultShiftLength && (
              <p id="shift-length-error" className="mt-2 text-sm text-red-600" role="alert">
                {errors.defaultShiftLength}
              </p>
            )}
          </div>

          {/* Advance Warning Time */}
          <div>
            <label htmlFor="warning-time" className="block text-sm font-medium text-gray-700 mb-2">
              Substitution Warning (minutes) *
            </label>
            <input
              id="warning-time"
              type="number"
              min="1"
              max="10"
              value={formData.advanceWarningTime}
              onChange={(e) => handleInputChange('advanceWarningTime', parseInt(e.target.value) || 3)}
              className={`
                w-full px-4 py-3 rounded-lg border text-base
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${errors.advanceWarningTime ? 'border-red-500 bg-red-50' : 'border-gray-300'}
              `}
              aria-describedby={errors.advanceWarningTime ? 'warning-time-error' : undefined}
              disabled={isSubmitting}
            />
            {errors.advanceWarningTime && (
              <p id="warning-time-error" className="mt-2 text-sm text-red-600" role="alert">
                {errors.advanceWarningTime}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Preferred Strategy */}
      <div className="form-group">
        <label htmlFor="strategy" className="block text-sm font-medium text-gray-700 mb-2">
          Preferred Substitution Strategy
        </label>
        <select
          id="strategy"
          value={formData.preferredStrategy}
          onChange={(e) => handleInputChange('preferredStrategy', e.target.value as SubstitutionStrategy)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isSubmitting}
        >
          <option value="equal-time">Equal Playing Time</option>
          <option value="minimum-time">Minimum Time Guarantee</option>
          <option value="flexible">Flexible Strategy</option>
          <option value="performance-based">Performance Based</option>
        </select>
      </div>

      {/* Form Actions */}
      <div className="form-actions flex flex-col sm:flex-row gap-3 pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="
            touch-target flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {isSubmitting ? 'Saving...' : (team ? 'Update Team' : 'Create Team')}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="
            touch-target flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium
            hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          Cancel
        </button>
      </div>
    </form>
  );
};