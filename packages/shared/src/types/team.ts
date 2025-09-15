// Team-related TypeScript interfaces for Match Manager
// Based on architecture/data-models.md#team

export interface Team {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  settings: TeamSettings;
}

export interface TeamSettings {
  defaultFormation: Formation;
  preferredStrategy: SubstitutionStrategy;
  defaultShiftLength: number; // minutes
  advanceWarningTime: number; // minutes
}

// Formation interface (basic definition for team settings)
export interface Formation {
  name: string;
  positions: FormationPosition[];
  description: string;
}

export interface FormationPosition {
  id: string;
  position: Position;
  x: number; // 0-100 percentage of field width
  y: number; // 0-100 percentage of field length
  isRequired: boolean;
  label: string; // e.g., "Left Back", "Center Forward"
}

// Substitution strategy types
export type SubstitutionStrategy = 'equal-time' | 'minimum-time' | 'flexible' | 'performance-based';

// Position type shared between team and game modules
export type Position = 'goalkeeper' | 'defender' | 'midfielder' | 'forward';