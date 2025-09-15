// IndexedDB Schema Definition for Match Manager
// Based on architecture/database-schema.md

export interface DatabaseSchema {
  name: string;
  version: number;
  stores: StoreConfig[];
}

export interface StoreConfig {
  name: string;
  keyPath: string | string[];
  autoIncrement: boolean;
  indexes: IndexConfig[];
}

export interface IndexConfig {
  name: string;
  keyPath: string | string[];
  unique: boolean;
  multiEntry?: boolean;
}

// Match Manager Database Schema v1
export const MATCH_MANAGER_DB_SCHEMA: DatabaseSchema = {
  name: 'MatchManagerDB',
  version: 1,
  stores: [
    {
      name: 'teams',
      keyPath: 'id',
      autoIncrement: false,
      indexes: [
        { name: 'name', keyPath: 'name', unique: false },
        { name: 'createdAt', keyPath: 'createdAt', unique: false }
      ]
    },
    {
      name: 'players',
      keyPath: 'id',
      autoIncrement: false,
      indexes: [
        { name: 'teamId', keyPath: 'teamId', unique: false },
        { name: 'jerseyNumber', keyPath: ['teamId', 'jerseyNumber'], unique: true },
        { name: 'isActive', keyPath: 'isActive', unique: false },
        { name: 'positions', keyPath: 'positions', unique: false, multiEntry: true }
      ]
    },
    {
      name: 'games',
      keyPath: 'id',
      autoIncrement: false,
      indexes: [
        { name: 'teamId', keyPath: 'teamId', unique: false },
        { name: 'date', keyPath: 'date', unique: false },
        { name: 'status', keyPath: 'status', unique: false },
        { name: 'teamId_status', keyPath: ['teamId', 'status'], unique: false }
      ]
    },
    {
      name: 'player_game_status',
      keyPath: ['playerId', 'gameId'],
      autoIncrement: false,
      indexes: [
        { name: 'playerId', keyPath: 'playerId', unique: false },
        { name: 'gameId', keyPath: 'gameId', unique: false },
        { name: 'availability', keyPath: 'availability', unique: false },
        { name: 'substitutionStatus', keyPath: 'substitutionStatus', unique: false },
        { name: 'gameId_onField', keyPath: ['gameId', 'substitutionStatus'], unique: false }
      ]
    },
    {
      name: 'playing_time_records',
      keyPath: 'id',
      autoIncrement: false,
      indexes: [
        { name: 'playerId', keyPath: 'playerId', unique: false },
        { name: 'gameId', keyPath: 'gameId', unique: false },
        { name: 'playerId_gameId', keyPath: ['playerId', 'gameId'], unique: false },
        { name: 'startTime', keyPath: 'startTime', unique: false },
        { name: 'endTime', keyPath: 'endTime', unique: false },
        { name: 'active_records', keyPath: ['gameId', 'endTime'], unique: false }
      ]
    },
    {
      name: 'substitution_events',
      keyPath: 'id',
      autoIncrement: false,
      indexes: [
        { name: 'gameId', keyPath: 'gameId', unique: false },
        { name: 'playerOffId', keyPath: 'playerOffId', unique: false },
        { name: 'playerOnId', keyPath: 'playerOnId', unique: false },
        { name: 'gameTimeSeconds', keyPath: 'gameTimeSeconds', unique: false },
        { name: 'timestamp', keyPath: 'timestamp', unique: false }
      ]
    },
    {
      name: 'formations',
      keyPath: 'name',
      autoIncrement: false,
      indexes: [
        { name: 'name', keyPath: 'name', unique: true }
      ]
    },
    {
      name: 'sync_queue',
      keyPath: 'id',
      autoIncrement: false,
      indexes: [
        { name: 'entityType', keyPath: 'entityType', unique: false },
        { name: 'operation', keyPath: 'operation', unique: false },
        { name: 'createdAt', keyPath: 'createdAt', unique: false },
        { name: 'status', keyPath: 'status', unique: false }
      ]
    }
  ]
};

// Database connection singleton
let dbInstance: IDBDatabase | null = null;

export async function initializeDatabase(): Promise<IDBDatabase> {
  if (dbInstance && !dbInstance.objectStoreNames.contains('teams')) {
    // Database was closed, reset instance
    dbInstance = null;
  }

  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(MATCH_MANAGER_DB_SCHEMA.name, MATCH_MANAGER_DB_SCHEMA.version);

    request.onerror = () => {
      reject(new Error(`Failed to open database: ${request.error?.message}`));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores and indexes
      MATCH_MANAGER_DB_SCHEMA.stores.forEach(storeConfig => {
        // Delete existing store if it exists (for upgrades)
        if (db.objectStoreNames.contains(storeConfig.name)) {
          db.deleteObjectStore(storeConfig.name);
        }

        // Create object store
        const store = db.createObjectStore(storeConfig.name, {
          keyPath: storeConfig.keyPath,
          autoIncrement: storeConfig.autoIncrement
        });

        // Create indexes
        storeConfig.indexes.forEach(indexConfig => {
          store.createIndex(indexConfig.name, indexConfig.keyPath, {
            unique: indexConfig.unique,
            multiEntry: indexConfig.multiEntry || false
          });
        });
      });
    };
  });
}

// Utility function to get database instance
export async function getDatabase(): Promise<IDBDatabase> {
  if (!dbInstance) {
    return initializeDatabase();
  }
  return dbInstance;
}

// Reset database instance (for testing)
export function resetDatabaseInstance(): void {
  dbInstance = null;
}