// Database initialization and repository exports
// Central access point for all database operations

import { initializeDatabase, getDatabase, resetDatabaseInstance } from './schema';
import { TeamRepository } from './TeamRepository';
import { PlayerRepository } from './PlayerRepository';

// Repository instances (singleton pattern)
let teamRepository: TeamRepository | null = null;
let playerRepository: PlayerRepository | null = null;

// Database initialization flag
let isInitialized = false;

/**
 * Initialize the database and all repositories
 * Should be called once during app startup
 */
export async function initializePersistence(): Promise<void> {
  if (isInitialized) {
    return;
  }

  try {
    // Initialize IndexedDB
    await initializeDatabase();

    // Create repository instances
    teamRepository = new TeamRepository();
    playerRepository = new PlayerRepository();

    isInitialized = true;
    console.log('Match Manager database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw new Error('Database initialization failed');
  }
}

/**
 * Get the Team repository instance
 */
export function getTeamRepository(): TeamRepository {
  if (!teamRepository) {
    throw new Error('Database not initialized. Call initializePersistence() first.');
  }
  return teamRepository;
}

/**
 * Get the Player repository instance
 */
export function getPlayerRepository(): PlayerRepository {
  if (!playerRepository) {
    throw new Error('Database not initialized. Call initializePersistence() first.');
  }
  return playerRepository;
}

/**
 * Check if the database is initialized
 */
export function isDatabaseInitialized(): boolean {
  return isInitialized;
}

/**
 * Reset the database (for testing purposes)
 * WARNING: This will delete all data
 */
export async function resetDatabase(): Promise<void> {
  try {
    // Close existing connection if it exists
    if (isInitialized) {
      try {
        const db = await getDatabase();
        db.close();
      } catch {
        // Ignore errors when closing
      }
    }

    // Delete database
    await new Promise<void>((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase('MatchManagerDB');

      deleteRequest.onsuccess = () => {
        console.log('Database deleted successfully');
        resolve();
      };

      deleteRequest.onerror = () => {
        reject(new Error(`Failed to delete database: ${deleteRequest.error?.message}`));
      };

      deleteRequest.onblocked = () => {
        // For tests, we'll resolve anyway
        console.warn('Database deletion blocked - continuing anyway');
        resolve();
      };
    });

    // Reset initialization state
    resetDatabaseInstance();
    isInitialized = false;
    teamRepository = null;
    playerRepository = null;

  } catch (error) {
    console.error('Failed to reset database:', error);
    throw error;
  }
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    if (!isInitialized) {
      return false;
    }

    const db = await getDatabase();

    // Simple test query to verify connection
    return new Promise((resolve) => {
      const transaction = db.transaction(['teams'], 'readonly');
      const store = transaction.objectStore('teams');
      const request = store.count();

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        resolve(false);
      };

      transaction.onerror = () => {
        resolve(false);
      };
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Export types for external use
export type { Team, Player } from '../../../packages/shared/src/types';