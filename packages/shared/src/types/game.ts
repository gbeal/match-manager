// Game and Player-related TypeScript interfaces for Match Manager
// Based on architecture/data-models.md#player and #game

import type { Position, Formation, FormationPosition } from './team';

export interface Player {
  id: string;
  teamId: string;
  name: string;
  jerseyNumber: number;
  positions: Position[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Game-related interfaces for future use
export interface Game {
  id: string;
  teamId: string;
  date: Date;
  opponent: string;
  venue?: string;
  status: GameStatus;
  gameTimer: GameTimer;
  currentFormation: Formation;
  strategy: SubstitutionStrategy;
  createdAt: Date;
  updatedAt: Date;
}

export type GameStatus = 'setup' | 'first-half' | 'halftime' | 'second-half' | 'completed';

export interface GameTimer {
  isRunning: boolean;
  startTime: Date | null;
  elapsedSeconds: number;
  period: GamePeriod;
  pausedAt: Date | null;
}

export type GamePeriod = 'first-half' | 'halftime' | 'second-half' | 'overtime';

export interface PlayerGameStatus {
  playerId: string;
  gameId: string;
  availability: PlayerAvailability;
  currentPosition: FormationPosition | null;
  substitutionStatus: SubstitutionStatus;
  lastSubstitutionAt: Date | null;
}

export type PlayerAvailability = 'available' | 'late' | 'absent' | 'injured';
export type SubstitutionStatus = 'on-field' | 'on-bench' | 'coming-off' | 'going-on';

export interface PlayingTimeRecord {
  id: string;
  playerId: string;
  gameId: string;
  startTime: Date;
  endTime: Date | null;
  position: Position;
  durationSeconds: number;
  createdAt: Date;
}

export interface SubstitutionEvent {
  id: string;
  gameId: string;
  playerOffId: string;
  playerOnId: string;
  position: FormationPosition;
  gameTimeSeconds: number;
  reason: SubstitutionReason;
  timestamp: Date;
}

export type SubstitutionReason = 'strategy' | 'injury' | 'disciplinary' | 'playing-time' | 'tactical';
export type SubstitutionStrategy = 'equal-time' | 'minimum-time' | 'flexible' | 'performance-based';

// Re-export Position type for convenience
export type { Position };