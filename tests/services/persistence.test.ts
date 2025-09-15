// Persistence layer tests - IndexedDB repositories
import type { Team, Player } from '../../packages/shared/src/types';
import {
  initializePersistence,
  getTeamRepository,
  getPlayerRepository,
  resetDatabase,
  checkDatabaseHealth
} from '../../src/services/persistence/database';

// Mock IndexedDB for testing
import 'fake-indexeddb/auto';
import {describe, beforeEach, afterEach, it, expect} from "@jest/globals";

describe('Persistence Layer', () => {
  beforeEach(async () => {
    // Reset database before each test
    try {
      await resetDatabase();
    } catch (error) {
      // Database might not exist yet, ignore error
    }
    await initializePersistence();
  });

  afterEach(async () => {
    try {
      await resetDatabase();
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Database Initialization', () => {
    it('should initialize database successfully', async () => {
      const health = await checkDatabaseHealth();
      expect(health).toBe(true);
    });

    it('should throw error when accessing repositories before initialization', async () => {
      await resetDatabase();
      expect(() => getTeamRepository()).toThrow('Database not initialized');
      expect(() => getPlayerRepository()).toThrow('Database not initialized');
    });
  });

  describe('TeamRepository', () => {
    let teamRepository: ReturnType<typeof getTeamRepository>;

    beforeEach(() => {
      teamRepository = getTeamRepository();
    });

    it('should create a new team', async () => {
      const teamData = {
        name: 'Lightning U12',
        settings: {
          defaultFormation: {
            name: '4-4-2',
            positions: [],
            description: 'Standard formation'
          },
          preferredStrategy: 'equal-time' as const,
          defaultShiftLength: 15,
          advanceWarningTime: 3
        }
      };

      const team = await teamRepository.create(teamData);

      expect(team.id).toBeDefined();
      expect(team.name).toBe('Lightning U12');
      expect(team.createdAt).toBeDefined();
      expect(team.updatedAt).toBeDefined();
      expect(team.settings.defaultShiftLength).toBe(15);
    });

    it('should find team by id', async () => {
      const teamData = {
        name: 'Thunder U14',
        settings: {
          defaultFormation: {
            name: '4-3-3',
            positions: [],
            description: 'Attacking formation'
          },
          preferredStrategy: 'minimum-time' as const,
          defaultShiftLength: 20,
          advanceWarningTime: 5
        }
      };

      const createdTeam = await teamRepository.create(teamData);
      const foundTeam = await teamRepository.findById(createdTeam.id);

      expect(foundTeam).not.toBeNull();
      expect(foundTeam!.name).toBe('Thunder U14');
    });

    it('should return null for non-existent team', async () => {
      const team = await teamRepository.findById('non-existent-id');
      expect(team).toBeNull();
    });

    it('should update team', async () => {
      const teamData = {
        name: 'Original Name',
        settings: {
          defaultFormation: {
            name: '4-4-2',
            positions: [],
            description: 'Standard formation'
          },
          preferredStrategy: 'equal-time' as const,
          defaultShiftLength: 15,
          advanceWarningTime: 3
        }
      };

      const team = await teamRepository.create(teamData);
      const updatedTeam = await teamRepository.update(team.id, {
        name: 'Updated Name',
        settings: {
          ...team.settings,
          defaultShiftLength: 20
        }
      });

      expect(updatedTeam.name).toBe('Updated Name');
      expect(updatedTeam.settings.defaultShiftLength).toBe(20);
      expect(updatedTeam.updatedAt.getTime()).toBeGreaterThan(team.updatedAt.getTime());
    });

    it('should delete team', async () => {
      const teamData = {
        name: 'To Delete',
        settings: {
          defaultFormation: {
            name: '4-4-2',
            positions: [],
            description: 'Standard formation'
          },
          preferredStrategy: 'equal-time' as const,
          defaultShiftLength: 15,
          advanceWarningTime: 3
        }
      };

      const team = await teamRepository.create(teamData);
      await teamRepository.delete(team.id);

      const deletedTeam = await teamRepository.findById(team.id);
      expect(deletedTeam).toBeNull();
    });

    it('should find all teams', async () => {
      const teamData1 = {
        name: 'Team 1',
        settings: {
          defaultFormation: { name: '4-4-2', positions: [], description: 'Standard' },
          preferredStrategy: 'equal-time' as const,
          defaultShiftLength: 15,
          advanceWarningTime: 3
        }
      };

      const teamData2 = {
        name: 'Team 2',
        settings: {
          defaultFormation: { name: '4-3-3', positions: [], description: 'Attacking' },
          preferredStrategy: 'minimum-time' as const,
          defaultShiftLength: 20,
          advanceWarningTime: 5
        }
      };

      await teamRepository.create(teamData1);
      await teamRepository.create(teamData2);

      const teams = await teamRepository.findAll();
      expect(teams).toHaveLength(2);
    });
  });

  describe('PlayerRepository', () => {
    let teamRepository: ReturnType<typeof getTeamRepository>;
    let playerRepository: ReturnType<typeof getPlayerRepository>;
    let testTeam: Team;

    beforeEach(async () => {
      teamRepository = getTeamRepository();
      playerRepository = getPlayerRepository();

      // Create a test team first
      testTeam = await teamRepository.create({
        name: 'Test Team',
        settings: {
          defaultFormation: { name: '4-4-2', positions: [], description: 'Standard' },
          preferredStrategy: 'equal-time',
          defaultShiftLength: 15,
          advanceWarningTime: 3
        }
      });
    });

    it('should create a new player', async () => {
      const playerData = {
        teamId: testTeam.id,
        name: 'John Doe',
        jerseyNumber: 10,
        positions: ['midfielder', 'forward'] as const,
        isActive: true
      };

      const player = await playerRepository.create(playerData);

      expect(player.id).toBeDefined();
      expect(player.name).toBe('John Doe');
      expect(player.jerseyNumber).toBe(10);
      expect(player.positions).toEqual(['midfielder', 'forward']);
      expect(player.createdAt).toBeDefined();
    });

    it('should enforce jersey number uniqueness within team', async () => {
      const playerData1 = {
        teamId: testTeam.id,
        name: 'Player 1',
        jerseyNumber: 10,
        positions: ['midfielder'] as const,
        isActive: true
      };

      const playerData2 = {
        teamId: testTeam.id,
        name: 'Player 2',
        jerseyNumber: 10, // Same jersey number
        positions: ['defender'] as const,
        isActive: true
      };

      await playerRepository.create(playerData1);

      await expect(playerRepository.create(playerData2))
        .rejects.toThrow('Jersey number 10 is already taken by Player 1');
    });

    it('should validate jersey number range', async () => {
      const playerData = {
        teamId: testTeam.id,
        name: 'Invalid Jersey',
        jerseyNumber: 100, // Invalid - must be 1-99
        positions: ['midfielder'] as const,
        isActive: true
      };

      await expect(playerRepository.create(playerData))
        .rejects.toThrow('Jersey number must be between 1 and 99');
    });

    it('should find players by team', async () => {
      const player1Data = {
        teamId: testTeam.id,
        name: 'Player 1',
        jerseyNumber: 1,
        positions: ['goalkeeper'] as const,
        isActive: true
      };

      const player2Data = {
        teamId: testTeam.id,
        name: 'Player 2',
        jerseyNumber: 2,
        positions: ['defender'] as const,
        isActive: true
      };

      await playerRepository.create(player1Data);
      await playerRepository.create(player2Data);

      const players = await playerRepository.findByTeamId(testTeam.id);
      expect(players).toHaveLength(2);
    });

    it('should find active players only', async () => {
      const activePlayer = {
        teamId: testTeam.id,
        name: 'Active Player',
        jerseyNumber: 1,
        positions: ['midfielder'] as const,
        isActive: true
      };

      const inactivePlayer = {
        teamId: testTeam.id,
        name: 'Inactive Player',
        jerseyNumber: 2,
        positions: ['defender'] as const,
        isActive: false
      };

      await playerRepository.create(activePlayer);
      await playerRepository.create(inactivePlayer);

      const activePlayers = await playerRepository.findActiveByTeamId(testTeam.id);
      expect(activePlayers).toHaveLength(1);
      expect(activePlayers[0].name).toBe('Active Player');
    });

    it('should update player jersey number with validation', async () => {
      const player1 = await playerRepository.create({
        teamId: testTeam.id,
        name: 'Player 1',
        jerseyNumber: 1,
        positions: ['midfielder'] as const,
        isActive: true
      });

      const player2 = await playerRepository.create({
        teamId: testTeam.id,
        name: 'Player 2',
        jerseyNumber: 2,
        positions: ['defender'] as const,
        isActive: true
      });

      // Try to update player1 to use player2's jersey number
      await expect(playerRepository.update(player1.id, { jerseyNumber: 2 }))
        .rejects.toThrow('Jersey number 2 is already taken by Player 2');
    });

    it('should deactivate and reactivate players', async () => {
      const player = await playerRepository.create({
        teamId: testTeam.id,
        name: 'Test Player',
        jerseyNumber: 10,
        positions: ['midfielder'] as const,
        isActive: true
      });

      // Deactivate
      const deactivatedPlayer = await playerRepository.deactivatePlayer(player.id);
      expect(deactivatedPlayer.isActive).toBe(false);

      // Reactivate
      const reactivatedPlayer = await playerRepository.reactivatePlayer(player.id);
      expect(reactivatedPlayer.isActive).toBe(true);
    });
  });
});