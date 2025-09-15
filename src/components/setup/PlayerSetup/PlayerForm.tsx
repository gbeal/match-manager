// PlayerForm Component - Form for creating and editing players
// Implements validation including jersey number uniqueness and touch optimization

'use client';

import React, { useState, useCallback } from 'react';
import type { Player, Team, Position } from '../../../../packages/shared/src/types';
import { getPlayerRepository } from '../../../services/persistence/database';

interface PlayerFormProps {
  team: Team;
  player?: Player | null;
  existingPlayers: Player[];
  onSuccess: (player: Player) => void;
  onCancel: () => void;
}

interface FormData {
  name: string;
  jerseyNumber: number | '';
  positions: Position[];
  isActive: boolean;
}

interface FormErrors {
  name?: string;
  jerseyNumber?: string;
  positions?: string;
}

const AVAILABLE_POSITIONS: { value: Position; label: string; description: string }[] = [
  { value: 'goalkeeper', label: 'Goalkeeper', description: 'Primary shot stopper' },
  { value: 'defender', label: 'Defender', description: 'Defense and blocking' },
  { value: 'midfielder', label: 'Midfielder', description: 'Ball distribution and support' },
  { value: 'forward', label: 'Forward', description: 'Attacking and scoring' }
];

export const PlayerForm: React.FC<PlayerFormProps> = ({
  team,
  player,
  existingPlayers,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: player?.name || '',
    jerseyNumber: player?.jerseyNumber || '',
    positions: player?.positions || [],
    isActive: player?.isActive ?? true
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Player name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Player name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Player name must be less than 50 characters';
    }

    // Jersey number validation
    if (formData.jerseyNumber === '') {
      newErrors.jerseyNumber = 'Jersey number is required';
    } else {
      const jerseyNum = Number(formData.jerseyNumber);
      if (isNaN(jerseyNum) || jerseyNum < 1 || jerseyNum > 99) {
        newErrors.jerseyNumber = 'Jersey number must be between 1 and 99';
      } else {
        // Check for uniqueness within team (excluding current player if editing)
        const conflictingPlayer = existingPlayers.find(p =>
          p.jerseyNumber === jerseyNum && p.id !== player?.id
        );
        if (conflictingPlayer) {
          newErrors.jerseyNumber = `Jersey number ${jerseyNum} is already taken by ${conflictingPlayer.name}`;
        }
      }
    }

    // Position validation
    if (formData.positions.length === 0) {
      newErrors.positions = 'At least one position must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, existingPlayers, player?.id]);

  const handleInputChange = useCallback((field: keyof FormData, value: string | number | boolean) => {
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

  const handlePositionToggle = useCallback((position: Position) => {
    setFormData(prev => ({
      ...prev,
      positions: prev.positions.includes(position)
        ? prev.positions.filter(p => p !== position)
        : [...prev.positions, position]
    }));

    // Clear position error
    if (errors.positions) {
      setErrors(prev => ({ ...prev, positions: undefined }));
    }
  }, [errors.positions]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const playerRepository = getPlayerRepository();

      const playerData = {
        teamId: team.id,
        name: formData.name.trim(),
        jerseyNumber: Number(formData.jerseyNumber),
        positions: formData.positions,
        isActive: formData.isActive
      };

      let savedPlayer: Player;

      if (player) {
        // Update existing player
        savedPlayer = await playerRepository.update(player.id, playerData);
      } else {
        // Create new player
        savedPlayer = await playerRepository.create(playerData);
      }

      onSuccess(savedPlayer);
    } catch (error) {
      console.error('Failed to save player:', error);
      if (error instanceof Error) {
        if (error.message.includes('Jersey number')) {
          setErrors({ jerseyNumber: error.message });
        } else {
          setErrors({ name: 'Failed to save player. Please try again.' });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, team.id, player, validateForm, onSuccess]);

  return (
    <form onSubmit={handleSubmit} className="player-form space-y-6" noValidate>
      {/* Player Name */}
      <div className="form-group">
        <label htmlFor="player-name" className="block text-sm font-medium text-gray-700 mb-2">
          Player Name *
        </label>
        <input
          id="player-name"
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={`
            w-full px-4 py-3 rounded-lg border text-base
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'}
          `}
          placeholder="Enter player name (e.g., John Smith)"
          aria-describedby={errors.name ? 'player-name-error' : undefined}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p id="player-name-error" className="mt-2 text-sm text-red-600" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      {/* Jersey Number */}
      <div className="form-group">
        <label htmlFor="jersey-number" className="block text-sm font-medium text-gray-700 mb-2">
          Jersey Number *
        </label>
        <input
          id="jersey-number"
          type="number"
          min="1"
          max="99"
          value={formData.jerseyNumber}
          onChange={(e) => handleInputChange('jerseyNumber', e.target.value ? parseInt(e.target.value) : '')}
          className={`
            w-full px-4 py-3 rounded-lg border text-base
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${errors.jerseyNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'}
          `}
          placeholder="1-99"
          aria-describedby={errors.jerseyNumber ? 'jersey-number-error' : undefined}
          disabled={isSubmitting}
        />
        {errors.jerseyNumber && (
          <p id="jersey-number-error" className="mt-2 text-sm text-red-600" role="alert">
            {errors.jerseyNumber}
          </p>
        )}
      </div>

      {/* Position Selection */}
      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Playing Positions *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {AVAILABLE_POSITIONS.map((pos) => (
            <button
              key={pos.value}
              type="button"
              onClick={() => handlePositionToggle(pos.value)}
              className={`
                touch-target p-4 rounded-lg border-2 text-left transition-colors
                ${formData.positions.includes(pos.value)
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                }
              `}
              disabled={isSubmitting}
              aria-pressed={formData.positions.includes(pos.value)}
            >
              <div className="flex items-center">
                <div className={`
                  w-5 h-5 rounded border-2 mr-3 flex items-center justify-center
                  ${formData.positions.includes(pos.value)
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                  }
                `}>
                  {formData.positions.includes(pos.value) && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="font-medium">{pos.label}</div>
                  <div className="text-sm text-gray-600">{pos.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
        {errors.positions && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {errors.positions}
          </p>
        )}
      </div>

      {/* Player Status */}
      <div className="form-group">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => handleInputChange('isActive', e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            disabled={isSubmitting}
          />
          <div>
            <span className="text-sm font-medium text-gray-700">Active Player</span>
            <p className="text-sm text-gray-600">
              Active players are available for team selection and game management
            </p>
          </div>
        </label>
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
          {isSubmitting ? 'Saving...' : (player ? 'Update Player' : 'Add Player')}
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