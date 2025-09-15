// Player Repository - CRUD operations for Player entities with jersey number validation
// Follows repository pattern as per coding standards

import type { Player } from '../../../packages/shared/src/types';
import { getDatabase } from './schema';

export class PlayerRepository {
  private readonly storeName = 'players';

  async create(player: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>): Promise<Player> {
    // Validate jersey number uniqueness within team
    await this.validateJerseyNumber(player.teamId, player.jerseyNumber);

    const db = await getDatabase();
    const now = new Date();

    const newPlayer: Player = {
      ...player,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(newPlayer);

      request.onsuccess = () => {
        resolve(newPlayer);
      };

      request.onerror = () => {
        reject(new Error(`Failed to create player: ${request.error?.message}`));
      };

      transaction.onerror = () => {
        reject(new Error(`Transaction failed: ${transaction.error?.message}`));
      };
    });
  }

  async findById(id: string): Promise<Player | null> {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        const player = request.result as Player | undefined;
        resolve(player || null);
      };

      request.onerror = () => {
        reject(new Error(`Failed to find player: ${request.error?.message}`));
      };
    });
  }

  async findByTeamId(teamId: string): Promise<Player[]> {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('teamId');
      const request = index.getAll(teamId);

      request.onsuccess = () => {
        const players = request.result as Player[];
        resolve(players);
      };

      request.onerror = () => {
        reject(new Error(`Failed to fetch players for team: ${request.error?.message}`));
      };
    });
  }

  async findActiveByTeamId(teamId: string): Promise<Player[]> {
    const players = await this.findByTeamId(teamId);
    return players.filter(player => player.isActive);
  }

  async update(id: string, updates: Partial<Omit<Player, 'id' | 'createdAt'>>): Promise<Player> {
    const existingPlayer = await this.findById(id);
    if (!existingPlayer) {
      throw new Error(`Player with id ${id} not found`);
    }

    // If jersey number is being updated, validate uniqueness
    if (updates.jerseyNumber && updates.jerseyNumber !== existingPlayer.jerseyNumber) {
      await this.validateJerseyNumber(existingPlayer.teamId, updates.jerseyNumber, id);
    }

    const updatedPlayer: Player = {
      ...existingPlayer,
      ...updates,
      id, // Ensure ID cannot be changed
      createdAt: existingPlayer.createdAt, // Preserve creation date
      updatedAt: new Date()
    };

    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(updatedPlayer);

      request.onsuccess = () => {
        resolve(updatedPlayer);
      };

      request.onerror = () => {
        reject(new Error(`Failed to update player: ${request.error?.message}`));
      };

      transaction.onerror = () => {
        reject(new Error(`Transaction failed: ${transaction.error?.message}`));
      };
    });
  }

  async delete(id: string): Promise<void> {
    const existingPlayer = await this.findById(id);
    if (!existingPlayer) {
      throw new Error(`Player with id ${id} not found`);
    }

    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to delete player: ${request.error?.message}`));
      };

      transaction.onerror = () => {
        reject(new Error(`Transaction failed: ${transaction.error?.message}`));
      };
    });
  }

  async findByJerseyNumber(teamId: string, jerseyNumber: number): Promise<Player | null> {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('jerseyNumber');
      const request = index.get([teamId, jerseyNumber]);

      request.onsuccess = () => {
        const player = request.result as Player | undefined;
        resolve(player || null);
      };

      request.onerror = () => {
        reject(new Error(`Failed to find player by jersey number: ${request.error?.message}`));
      };
    });
  }

  private async validateJerseyNumber(teamId: string, jerseyNumber: number, excludePlayerId?: string): Promise<void> {
    // Validate jersey number range (1-99 for soccer)
    if (jerseyNumber < 1 || jerseyNumber > 99) {
      throw new Error('Jersey number must be between 1 and 99');
    }

    // Check for uniqueness within team
    const existingPlayer = await this.findByJerseyNumber(teamId, jerseyNumber);
    if (existingPlayer && existingPlayer.id !== excludePlayerId) {
      throw new Error(`Jersey number ${jerseyNumber} is already taken by ${existingPlayer.name}`);
    }
  }

  async findByPosition(teamId: string, position: string): Promise<Player[]> {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('positions');
      const request = index.getAll(position);

      request.onsuccess = () => {
        const allPlayers = request.result as Player[];
        // Filter by team ID since positions index is multi-entry across teams
        const teamPlayers = allPlayers.filter(player => player.teamId === teamId);
        resolve(teamPlayers);
      };

      request.onerror = () => {
        reject(new Error(`Failed to find players by position: ${request.error?.message}`));
      };
    });
  }

  async deactivatePlayer(id: string): Promise<Player> {
    return this.update(id, { isActive: false });
  }

  async reactivatePlayer(id: string): Promise<Player> {
    return this.update(id, { isActive: true });
  }
}