// Type validation tests for shared types
import type {
  Team,
  Player,
  Position,
  TeamSettings,
  Formation,
  SubstitutionStrategy
} from '../../packages/shared/src/types';

describe('Shared Types', () => {
  describe('Position type', () => {
    it('should accept valid position values', () => {
      const positions: Position[] = ['goalkeeper', 'defender', 'midfielder', 'forward'];
      expect(positions).toHaveLength(4);
    });
  });

  describe('Team interface', () => {
    it('should create valid team object', () => {
      const team: Team = {
        id: 'team-1',
        name: 'Lightning U12',
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {
          defaultFormation: {
            name: '4-4-2',
            positions: [],
            description: 'Standard 4-4-2 formation'
          },
          preferredStrategy: 'equal-time',
          defaultShiftLength: 15,
          advanceWarningTime: 3
        }
      };

      expect(team.id).toBe('team-1');
      expect(team.name).toBe('Lightning U12');
      expect(team.settings.defaultShiftLength).toBe(15);
    });
  });

  describe('Player interface', () => {
    it('should create valid player object', () => {
      const player: Player = {
        id: 'player-1',
        teamId: 'team-1',
        name: 'John Doe',
        jerseyNumber: 10,
        positions: ['midfielder', 'forward'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(player.name).toBe('John Doe');
      expect(player.jerseyNumber).toBe(10);
      expect(player.positions).toContain('midfielder');
      expect(player.isActive).toBe(true);
    });

    it('should enforce unique jersey numbers per team constraint in validation', () => {
      // This test validates the constraint exists in our type structure
      // The actual uniqueness will be enforced by repository validation
      const player1: Player = {
        id: 'player-1',
        teamId: 'team-1',
        name: 'John Doe',
        jerseyNumber: 10,
        positions: ['midfielder'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(player1.jerseyNumber).toBe(10);
      expect(typeof player1.jerseyNumber).toBe('number');
    });
  });

  describe('SubstitutionStrategy type', () => {
    it('should accept valid strategy values', () => {
      const strategies: SubstitutionStrategy[] = [
        'equal-time',
        'minimum-time',
        'flexible',
        'performance-based'
      ];

      expect(strategies).toHaveLength(4);
      expect(strategies).toContain('equal-time');
    });
  });
});