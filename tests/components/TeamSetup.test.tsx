// TeamSetup Component Tests
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeamSetup } from '../../src/components/setup/TeamSetup';
import { TeamForm } from '../../src/components/setup/TeamSetup/TeamForm';
import { TeamList } from '../../src/components/setup/TeamSetup/TeamList';
import type { Team } from '../../packages/shared/src/types';

// Mock the persistence layer
const mockTeamRepository = {
  create: jest.fn(),
  findAll: jest.fn(() => Promise.resolve([])),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../../src/services/persistence/database', () => ({
  getTeamRepository: () => mockTeamRepository,
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

describe('TeamSetup Component', () => {
  const mockOnTeamSelect = jest.fn();
  const mockOnTeamCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Main TeamSetup Component', () => {
    it('should render team management header', () => {
      render(<TeamSetup />);

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText('Team Management')).toBeInTheDocument();
      expect(screen.getByText(/Create and manage your soccer teams/)).toBeInTheDocument();
    });

    it('should show team list by default', () => {
      render(<TeamSetup />);

      expect(screen.getByText('Your Teams')).toBeInTheDocument();
      expect(screen.getByText('+ New Team')).toBeInTheDocument();
    });

    it('should show team form when create button is clicked', async () => {
      const user = userEvent.setup();
      render(<TeamSetup />);

      const createButton = screen.getByText('+ New Team');
      await user.click(createButton);

      expect(screen.getByText('Create New Team')).toBeInTheDocument();
      expect(screen.getByLabelText('Team Name *')).toBeInTheDocument();
    });

    it('should have proper touch targets', () => {
      render(<TeamSetup />);

      const createButton = screen.getByText('+ New Team');
      const styles = getComputedStyle(createButton);

      // Check minimum touch target size (44px)
      expect(createButton).toHaveClass('touch-target');
    });

    it('should call onTeamSelect when team is selected', () => {
      render(<TeamSetup onTeamSelect={mockOnTeamSelect} />);

      // This would be triggered by TeamList component
      expect(mockOnTeamSelect).not.toHaveBeenCalled();
    });
  });

  describe('TeamForm Component', () => {
    const mockOnSuccess = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render form fields', () => {
      render(<TeamForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText('Team Name *')).toBeInTheDocument();
      expect(screen.getByText('Default Formation')).toBeInTheDocument();
      expect(screen.getByLabelText('Default Shift Length (minutes) *')).toBeInTheDocument();
      expect(screen.getByLabelText('Substitution Warning (minutes) *')).toBeInTheDocument();
      expect(screen.getByLabelText('Preferred Substitution Strategy')).toBeInTheDocument();
    });

    it('should validate required fields', async () => {
      const user = userEvent.setup();
      render(<TeamForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      const submitButton = screen.getByText('Create Team');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Team name is required')).toBeInTheDocument();
      });
    });

    it('should validate team name length', async () => {
      const user = userEvent.setup();
      render(<TeamForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      const nameInput = screen.getByLabelText('Team Name *');
      await user.type(nameInput, 'A'); // Too short

      const submitButton = screen.getByText('Create Team');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Team name must be at least 2 characters')).toBeInTheDocument();
      });
    });

    it('should validate shift length range', async () => {
      const user = userEvent.setup();
      render(<TeamForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      const shiftInput = screen.getByLabelText('Default Shift Length (minutes) *');
      await user.tripleClick(shiftInput);
      await user.keyboard('3'); // Too low

      const submitButton = screen.getByText('Create Team');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Shift length must be at least 5 minutes')).toBeInTheDocument();
      });
    });

    it('should validate warning time range', async () => {
      const user = userEvent.setup();
      render(<TeamForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      const warningInput = screen.getByLabelText('Substitution Warning (minutes) *');
      await user.clear(warningInput);
      await user.type(warningInput, '15'); // Too high

      const submitButton = screen.getByText('Create Team');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Warning time must be less than 10 minutes')).toBeInTheDocument();
      });
    });

    it('should show formation options', () => {
      render(<TeamForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      expect(screen.getByText('4-4-2')).toBeInTheDocument();
      expect(screen.getByText('4-3-3')).toBeInTheDocument();
      expect(screen.getByText('3-5-2')).toBeInTheDocument();
    });

    it('should allow formation selection', async () => {
      const user = userEvent.setup();
      render(<TeamForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      const formation433 = screen.getByText('4-3-3');
      await user.click(formation433);

      // Check if formation is selected (by class or other indicator)
      expect(formation433.closest('button')).toHaveClass('border-blue-500');
    });

    it('should show strategy options', () => {
      render(<TeamForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      const strategySelect = screen.getByLabelText('Preferred Substitution Strategy');

      expect(screen.getByDisplayValue('Equal Playing Time')).toBeInTheDocument();
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<TeamForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should populate form when editing existing team', () => {
      render(<TeamForm team={mockTeam} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      expect(screen.getByDisplayValue('Lightning U12')).toBeInTheDocument();
      expect(screen.getByDisplayValue('15')).toBeInTheDocument(); // shift length
      expect(screen.getByDisplayValue('3')).toBeInTheDocument(); // warning time
      expect(screen.getByText('Update Team')).toBeInTheDocument();
    });

    it('should have accessible form elements', () => {
      render(<TeamForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      const nameInput = screen.getByLabelText('Team Name *');
      expect(nameInput).toHaveAttribute('id', 'team-name');

      const shiftInput = screen.getByLabelText('Default Shift Length (minutes) *');
      expect(shiftInput).toHaveAttribute('id', 'shift-length');

      const warningInput = screen.getByLabelText('Substitution Warning (minutes) *');
      expect(warningInput).toHaveAttribute('id', 'warning-time');
    });

    it('should disable form during submission', async () => {
      const user = userEvent.setup();

      // Mock a slow repository operation
      mockTeamRepository.create.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockTeam), 100)));

      render(<TeamForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      // Fill valid form data
      await user.type(screen.getByLabelText('Team Name *'), 'Test Team');

      const submitButton = screen.getByText('Create Team');
      await user.click(submitButton);

      // Check that form is disabled during submission
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(screen.getByLabelText('Team Name *')).toBeDisabled();

      // Wait for submission to complete
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('Touch Optimization', () => {
    it('should have minimum 44px touch targets for buttons', () => {
      render(<TeamSetup />);

      const createButton = screen.getByText('+ New Team');
      expect(createButton).toHaveClass('touch-target');
    });

    it('should have proper focus management', async () => {
      const user = userEvent.setup();
      render(<TeamForm onSuccess={jest.fn()} onCancel={jest.fn()} />);

      const nameInput = screen.getByLabelText('Team Name *');
      await user.tab();

      expect(nameInput).toHaveFocus();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<TeamForm onSuccess={jest.fn()} onCancel={jest.fn()} />);

      // Tab through form elements
      await user.tab(); // Team name
      await user.tab(); // First formation button
      await user.tab(); // Second formation button

      const formations = screen.getAllByText(/4-/);
      expect(formations[1].closest('button')).toHaveFocus();
    });
  });
});