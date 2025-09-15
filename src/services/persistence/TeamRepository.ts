// Team Repository - CRUD operations for Team entities
// Follows repository pattern as per coding standards

import type { Team } from '../../../packages/shared/src/types';
import { getDatabase } from './schema';

export class TeamRepository {
  private readonly storeName = 'teams';

  async create(team: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Promise<Team> {
    const db = await getDatabase();
    const now = new Date();

    const newTeam: Team = {
      ...team,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(newTeam);

      request.onsuccess = () => {
        resolve(newTeam);
      };

      request.onerror = () => {
        reject(new Error(`Failed to create team: ${request.error?.message}`));
      };

      transaction.onerror = () => {
        reject(new Error(`Transaction failed: ${transaction.error?.message}`));
      };
    });
  }

  async findById(id: string): Promise<Team | null> {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        const team = request.result as Team | undefined;
        resolve(team || null);
      };

      request.onerror = () => {
        reject(new Error(`Failed to find team: ${request.error?.message}`));
      };
    });
  }

  async findAll(): Promise<Team[]> {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const teams = request.result as Team[];
        resolve(teams);
      };

      request.onerror = () => {
        reject(new Error(`Failed to fetch teams: ${request.error?.message}`));
      };
    });
  }

  async update(id: string, updates: Partial<Omit<Team, 'id' | 'createdAt'>>): Promise<Team> {
    const existingTeam = await this.findById(id);
    if (!existingTeam) {
      throw new Error(`Team with id ${id} not found`);
    }

    const updatedTeam: Team = {
      ...existingTeam,
      ...updates,
      id, // Ensure ID cannot be changed
      createdAt: existingTeam.createdAt, // Preserve creation date
      updatedAt: new Date()
    };

    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(updatedTeam);

      request.onsuccess = () => {
        resolve(updatedTeam);
      };

      request.onerror = () => {
        reject(new Error(`Failed to update team: ${request.error?.message}`));
      };

      transaction.onerror = () => {
        reject(new Error(`Transaction failed: ${transaction.error?.message}`));
      };
    });
  }

  async delete(id: string): Promise<void> {
    const existingTeam = await this.findById(id);
    if (!existingTeam) {
      throw new Error(`Team with id ${id} not found`);
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
        reject(new Error(`Failed to delete team: ${request.error?.message}`));
      };

      transaction.onerror = () => {
        reject(new Error(`Transaction failed: ${transaction.error?.message}`));
      };
    });
  }

  async findByName(name: string): Promise<Team | null> {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('name');
      const request = index.get(name);

      request.onsuccess = () => {
        const team = request.result as Team | undefined;
        resolve(team || null);
      };

      request.onerror = () => {
        reject(new Error(`Failed to find team by name: ${request.error?.message}`));
      };
    });
  }

  async findRecent(limit: number = 5): Promise<Team[]> {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('createdAt');
      const request = index.openCursor(null, 'prev'); // Newest first

      const teams: Team[] = [];
      let count = 0;

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor && count < limit) {
          teams.push(cursor.value as Team);
          count++;
          cursor.continue();
        } else {
          resolve(teams);
        }
      };

      request.onerror = () => {
        reject(new Error(`Failed to fetch recent teams: ${request.error?.message}`));
      };
    });
  }
}