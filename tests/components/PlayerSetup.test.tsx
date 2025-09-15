// PlayerSetup Component Tests
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerSetup } from '../../src/components/setup/PlayerSetup';
import { PlayerForm } from '../../src/components/setup/PlayerSetup/PlayerForm';
import { PlayerList } from '../../src/components/setup/PlayerSetup/PlayerList';
import type { Team, Player } from '../../packages/shared/src/types';

// Mock the persistence layer
const mockPlayerRepository = {
  create: jest.fn(),
  findByTeamId: jest.fn(() => Promise.resolve([])),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  deactivatePlayer: jest.fn(),
  reactivatePlayer: jest.fn(),
  findByJerseyNumber: jest.fn(() => Promise.resolve(null)),
};

jest.mock('../../src/services/persistence/database', () => ({
  getPlayerRepository: () => mockPlayerRepository,
  initializePersistence: jest.fn(),
}));

// Mock crypto.randomUUID
global.crypto = {
  ...global.crypto,
  randomUUID: jest.fn(() => 'mock-uuid'),
};

const mockTeam: Team = {
  id: 'team-1',
  name: 'Lightning U12',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  settings: {
    defaultFormation: {
      name: '4-4-2',
      positions: [],
      description: 'Standard formation'
    },
    preferredStrategy: 'equal-time',
    defaultShiftLength: 15,
    advanceWarningTime: 3
  }
};

const mockPlayer: Player = {
  id: 'player-1',
  teamId: 'team-1',
  name: 'John Doe',
  jerseyNumber: 10,
  positions: ['midfielder', 'forward'],
  isActive: true,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01')
};

const mockPlayers: Player[] = [
  mockPlayer,
  {
    id: 'player-2',
    teamId: 'team-1',
    name: 'Jane Smith',
    jerseyNumber: 1,
    positions: ['goalkeeper'],
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  }
];

describe('PlayerSetup Component', () => {
  const mockOnBack = jest.fn();
  const mockOnPlayerSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockPlayerRepository.findByTeamId.mockResolvedValue([]);
  });

  describe('Main PlayerSetup Component', () => {
    it('should render player management header', async () => {
      render(<PlayerSetup team={mockTeam} />);

      // Wait for loading to complete first
      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      expect(screen.getByText('Lightning U12 - Players')).toBeInTheDocument();
      expect(screen.getByText(/Manage your team roster and player positions/)).toBeInTheDocument();
      expect(screen.getByText('Team Roster')).toBeInTheDocument();
    });

    it('should show back button when onBack prop is provided', async () => {
      render(<PlayerSetup team={mockTeam} onBack={mockOnBack} />);

      await waitFor(() => {
        const backButton = screen.getByLabelText('Go back to team management');
        expect(backButton).toBeInTheDocument();
      });
    });

    it('should show player list by default', async () => {
      render(<PlayerSetup team={mockTeam} />);

      await waitFor(() => {
        expect(screen.getByText('Team Roster')).toBeInTheDocument();
        expect(screen.getByText('+ Add Player')).toBeInTheDocument();
      });
    });

    it('should show player form when add button is clicked', async () => {
      const user = userEvent.setup();
      render(<PlayerSetup team={mockTeam} />);

      await waitFor(() => {
        expect(screen.getByText('+ Add Player')).toBeInTheDocument();
      });

      const addButton = screen.getByText('+ Add Player');
      await user.click(addButton);

      expect(screen.getByText('Add New Player')).toBeInTheDocument();
      expect(screen.getByLabelText('Player Name *')).toBeInTheDocument();
    });

    it('should display active player count', async () => {
      mockPlayerRepository.findByTeamId.mockResolvedValue(mockPlayers);
      render(<PlayerSetup team={mockTeam} />);

      await waitFor(() => {
        expect(screen.getByText('2 active players')).toBeInTheDocument();
      });
    });
  });

  describe('PlayerForm Component', () => {
    const mockOnSuccess = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render form fields', () => {
      render(
        <PlayerForm
          team={mockTeam}
          existingPlayers={[]}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText('Player Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Jersey Number *')).toBeInTheDocument();
      expect(screen.getByText('Playing Positions *')).toBeInTheDocument();
      expect(screen.getByText('Active Player')).toBeInTheDocument();
    });

    it('should show all position options', () => {
      render(
        <PlayerForm
          team={mockTeam}
          existingPlayers={[]}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Goalkeeper')).toBeInTheDocument();
      expect(screen.getByText('Defender')).toBeInTheDocument();
      expect(screen.getByText('Midfielder')).toBeInTheDocument();
      expect(screen.getByText('Forward')).toBeInTheDocument();
    });

    it('should validate required fields', async () => {
      const user = userEvent.setup();
      render(
        <PlayerForm
          team={mockTeam}
          existingPlayers={[]}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByText('Add Player');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Player name is required')).toBeInTheDocument();
        expect(screen.getByText('Jersey number is required')).toBeInTheDocument();
        expect(screen.getByText('At least one position must be selected')).toBeInTheDocument();
      });
    });

    it('should validate player name length', async () => {
      const user = userEvent.setup();
      render(
        <PlayerForm
          team={mockTeam}
          existingPlayers={[]}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByLabelText('Player Name *');
      await user.type(nameInput, 'A'); // Too short

      const submitButton = screen.getByText('Add Player');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Player name must be at least 2 characters')).toBeInTheDocument();
      });
    });

    it('should validate jersey number range', async () => {
      const user = userEvent.setup();
      render(
        <PlayerForm
          team={mockTeam}
          existingPlayers={[]}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const jerseyInput = screen.getByLabelText('Jersey Number *');
      await user.type(jerseyInput, '100'); // Too high

      const submitButton = screen.getByText('Add Player');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Jersey number must be between 1 and 99')).toBeInTheDocument();
      });
    });

    it('should validate jersey number uniqueness', async () => {
      const user = userEvent.setup();
      render(
        <PlayerForm
          team={mockTeam}
          existingPlayers={mockPlayers}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const jerseyInput = screen.getByLabelText('Jersey Number *');
      await user.type(jerseyInput, '10'); // Already taken by John Doe

      const submitButton = screen.getByText('Add Player');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Jersey number 10 is already taken by John Doe')).toBeInTheDocument();
      });
    });

    it('should allow position selection', async () => {
      const user = userEvent.setup();
      render(
        <PlayerForm
          team={mockTeam}
          existingPlayers={[]}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const midfielderButton = screen.getByText('Midfielder').closest('button')!;
      const forwardButton = screen.getByText('Forward').closest('button')!;

      await user.click(midfielderButton);
      await user.click(forwardButton);

      expect(midfielderButton).toHaveClass('border-blue-500');
      expect(forwardButton).toHaveClass('border-blue-500');
    });

    it('should allow position deselection', async () => {
      const user = userEvent.setup();
      render(
        <PlayerForm
          team={mockTeam}
          existingPlayers={[]}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const midfielderButton = screen.getByText('Midfielder').closest('button')!;

      // Select
      await user.click(midfielderButton);
      expect(midfielderButton).toHaveClass('border-blue-500');

      // Deselect
      await user.click(midfielderButton);
      expect(midfielderButton).not.toHaveClass('border-blue-500');
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <PlayerForm
          team={mockTeam}
          existingPlayers={[]}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should populate form when editing existing player', () => {
      render(
        <PlayerForm
          team={mockTeam}
          player={mockPlayer}
          existingPlayers={mockPlayers}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('10')).toBeInTheDocument();
      expect(screen.getByText('Update Player')).toBeInTheDocument();

      // Check that positions are selected
      const midfielderButton = screen.getByText('Midfielder').closest('button')!;
      const forwardButton = screen.getByText('Forward').closest('button')!;
      expect(midfielderButton).toHaveClass('border-blue-500');
      expect(forwardButton).toHaveClass('border-blue-500');
    });

    it('should have accessible form elements', () => {
      render(
        <PlayerForm
          team={mockTeam}
          existingPlayers={[]}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByLabelText('Player Name *');
      expect(nameInput).toHaveAttribute('id', 'player-name');

      const jerseyInput = screen.getByLabelText('Jersey Number *');
      expect(jerseyInput).toHaveAttribute('id', 'jersey-number');
    });

    it('should disable form during submission', async () => {
      const user = userEvent.setup();

      // Mock a slow repository operation
      mockPlayerRepository.create.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockPlayer), 100))
      );

      render(
        <PlayerForm
          team={mockTeam}
          existingPlayers={[]}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Fill valid form data
      await user.type(screen.getByLabelText('Player Name *'), 'Test Player');
      await user.type(screen.getByLabelText('Jersey Number *'), '5');
      await user.click(screen.getByText('Midfielder').closest('button')!);

      const submitButton = screen.getByText('Add Player');
      await user.click(submitButton);

      // Check that form is disabled during submission
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(screen.getByLabelText('Player Name *')).toBeDisabled();

      // Wait for submission to complete
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('PlayerList Component', () => {
    const mockOnPlayerSelect = jest.fn();
    const mockOnPlayerEdit = jest.fn();
    const mockOnPlayerDelete = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render empty state when no players', () => {
      render(
        <PlayerList
          players={[]}
          onPlayerEdit={mockOnPlayerEdit}
          onPlayerDelete={mockOnPlayerDelete}
        />
      );

      expect(screen.getByText('No Players Yet')).toBeInTheDocument();
      expect(screen.getByText(/Add players to your team roster/)).toBeInTheDocument();
    });

    it('should render player cards', () => {
      render(
        <PlayerList
          players={mockPlayers}
          onPlayerEdit={mockOnPlayerEdit}
          onPlayerDelete={mockOnPlayerDelete}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('#10')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('#1')).toBeInTheDocument();
    });

    it('should display player positions with color coding', () => {
      render(
        <PlayerList
          players={mockPlayers}
          onPlayerEdit={mockOnPlayerEdit}
          onPlayerDelete={mockOnPlayerDelete}
        />
      );

      const goalkeepers = screen.getAllByText('Goalkeeper');
      const midfielders = screen.getAllByText('Midfielder');
      const forwards = screen.getAllByText('Forward');

      expect(goalkeepers.length).toBe(1);
      expect(midfielders.length).toBe(1);
      expect(forwards.length).toBe(1);
    });

    it('should display player stats summary', () => {
      render(
        <PlayerList
          players={mockPlayers}
          onPlayerEdit={mockOnPlayerEdit}
          onPlayerDelete={mockOnPlayerDelete}
        />
      );

      expect(screen.getByText('2')).toBeInTheDocument(); // Active players
      expect(screen.getByText('Active Players')).toBeInTheDocument();
      expect(screen.getByText('Goalkeepers')).toBeInTheDocument();
      expect(screen.getByText('Midfielders')).toBeInTheDocument();
      expect(screen.getByText('Forwards')).toBeInTheDocument();
    });

    it('should call onPlayerEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <PlayerList
          players={mockPlayers}
          onPlayerEdit={mockOnPlayerEdit}
          onPlayerDelete={mockOnPlayerDelete}
        />
      );

      const editButtons = screen.getAllByLabelText(/Edit player/);
      await user.click(editButtons[0]);

      expect(mockOnPlayerEdit).toHaveBeenCalledWith(mockPlayers[0]);
    });

    it('should call onPlayerSelect when player card is clicked', async () => {
      const user = userEvent.setup();
      render(
        <PlayerList
          players={mockPlayers}
          onPlayerSelect={mockOnPlayerSelect}
          onPlayerEdit={mockOnPlayerEdit}
          onPlayerDelete={mockOnPlayerDelete}
        />
      );

      const playerCard = screen.getByText('John Doe').closest('[role="button"]')!;
      await user.click(playerCard);

      expect(mockOnPlayerSelect).toHaveBeenCalledWith(mockPlayers[0]);
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(
        <PlayerList
          players={mockPlayers}
          onPlayerSelect={mockOnPlayerSelect}
          onPlayerEdit={mockOnPlayerEdit}
          onPlayerDelete={mockOnPlayerDelete}
        />
      );

      const playerCard = screen.getByLabelText('Select player John Doe');
      await user.tab();

      expect(playerCard).toHaveFocus();

      // Test Enter key
      await user.keyboard('{Enter}');
      expect(mockOnPlayerSelect).toHaveBeenCalledWith(mockPlayers[0]);
    });
  });

  describe('Touch Optimization', () => {
    it('should have minimum 44px touch targets for buttons', async () => {
      render(<PlayerSetup team={mockTeam} />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      // Check that buttons have touch-target class
      const buttons = screen.getAllByRole('button');
      const touchTargets = buttons.filter(button =>
        button.classList.contains('touch-target')
      );

      expect(touchTargets.length).toBeGreaterThan(0);
    });

    it('should have proper focus management in forms', async () => {
      const user = userEvent.setup();
      render(
        <PlayerForm
          team={mockTeam}
          existingPlayers={[]}
          onSuccess={jest.fn()}
          onCancel={jest.fn()}
        />
      );

      const nameInput = screen.getByLabelText('Player Name *');
      await user.tab();

      expect(nameInput).toHaveFocus();
    });
  });

  describe('Error Handling', () => {
    it('should handle repository errors gracefully', async () => {
      mockPlayerRepository.findByTeamId.mockRejectedValue(new Error('Database error'));

      render(<PlayerSetup team={mockTeam} />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load players. Please try again.')).toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      const user = userEvent.setup();
      mockPlayerRepository.findByTeamId.mockRejectedValue(new Error('Database error'));

      render(<PlayerSetup team={mockTeam} />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      // Reset mock to succeed on retry
      mockPlayerRepository.findByTeamId.mockResolvedValue([]);

      const retryButton = screen.getByText('Retry');
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Team Roster')).toBeInTheDocument();
      });
    });
  });
});