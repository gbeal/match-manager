// Shared TypeScript types for Match Manager
// Exports all types for easy importing across the application

// Team-related types
export type {
  Team,
  TeamSettings,
  Formation,
  FormationPosition,
  SubstitutionStrategy,
  Position
} from './team';

// Game and Player-related types
export type {
  Player,
  Game,
  GameStatus,
  GameTimer,
  GamePeriod,
  PlayerGameStatus,
  PlayerAvailability,
  SubstitutionStatus,
  PlayingTimeRecord,
  SubstitutionEvent,
  SubstitutionReason
} from './game';