# Data Models

## Team

**Purpose:** Represents a soccer team with basic configuration and settings that persist across multiple games.

**Key Attributes:**
- id: string - Unique identifier for the team
- name: string - Team name (e.g., "Lightning U12")
- createdAt: Date - Team creation timestamp
- settings: TeamSettings - Configuration preferences

### TypeScript Interface

```typescript
interface Team {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  settings: TeamSettings;
}

interface TeamSettings {
  defaultFormation: Formation;
  preferredStrategy: SubstitutionStrategy;
  defaultShiftLength: number; // minutes
  advanceWarningTime: number; // minutes
}
```

### Relationships

- One-to-many with Player (team has multiple players)
- One-to-many with Game (team plays multiple games)

## Player

**Purpose:** Individual player with position eligibility and persistent information used across games and seasons.

**Key Attributes:**
- id: string - Unique player identifier
- name: string - Player full name
- jerseyNumber: number - Uniform number (unique within team)
- positions: Position[] - Eligible playing positions
- isActive: boolean - Current roster status

### TypeScript Interface

```typescript
interface Player {
  id: string;
  teamId: string;
  name: string;
  jerseyNumber: number;
  positions: Position[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type Position = 'goalkeeper' | 'defender' | 'midfielder' | 'forward';
```

### Relationships

- Many-to-one with Team (player belongs to one team)
- One-to-many with PlayerGameStatus (player has status in multiple games)
- One-to-many with PlayingTimeRecord (player has playing time across games)

## Game

**Purpose:** Represents a single soccer match with all associated game state, timing, and configuration.

**Key Attributes:**
- id: string - Unique game identifier
- teamId: string - Reference to team
- date: Date - Game date and time
- opponent: string - Opposing team name
- status: GameStatus - Current game state
- gameTimer: GameTimer - Independent game clock
- formation: Formation - Current tactical formation
- strategy: SubstitutionStrategy - Active substitution strategy

### TypeScript Interface

```typescript
interface Game {
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

type GameStatus = 'setup' | 'first-half' | 'halftime' | 'second-half' | 'completed';

interface GameTimer {
  isRunning: boolean;
  startTime: Date | null;
  elapsedSeconds: number;
  period: GamePeriod;
  pausedAt: Date | null;
}

type GamePeriod = 'first-half' | 'halftime' | 'second-half' | 'overtime';
```

### Relationships

- Many-to-one with Team (game belongs to one team)
- One-to-many with PlayerGameStatus (game has multiple player statuses)
- One-to-many with SubstitutionEvent (game has multiple substitutions)
- One-to-many with PlayingTimeRecord (game generates playing time records)

## Formation

**Purpose:** Defines tactical formation with position layout and player assignment capabilities.

**Key Attributes:**
- name: string - Formation identifier (e.g., "4-4-2", "4-3-3")
- positions: FormationPosition[] - Field positions with coordinates
- description: string - Human-readable formation description

### TypeScript Interface

```typescript
interface Formation {
  name: string;
  positions: FormationPosition[];
  description: string;
}

interface FormationPosition {
  id: string;
  position: Position;
  x: number; // 0-100 percentage of field width
  y: number; // 0-100 percentage of field length
  isRequired: boolean;
  label: string; // e.g., "Left Back", "Center Forward"
}
```

### Relationships

- Many-to-many with Player (through position eligibility)
- One-to-many with PlayerGameStatus (positions are assigned to players)

## PlayerGameStatus

**Purpose:** Tracks individual player status, position assignment, and availability within a specific game.

**Key Attributes:**
- playerId: string - Reference to player
- gameId: string - Reference to game
- availability: PlayerAvailability - Current game availability
- currentPosition: FormationPosition | null - Assigned field position
- substitutionStatus: SubstitutionStatus - Pending substitution state

### TypeScript Interface

```typescript
interface PlayerGameStatus {
  playerId: string;
  gameId: string;
  availability: PlayerAvailability;
  currentPosition: FormationPosition | null;
  substitutionStatus: SubstitutionStatus;
  lastSubstitutionAt: Date | null;
}

type PlayerAvailability = 'available' | 'late' | 'absent' | 'injured';
type SubstitutionStatus = 'on-field' | 'on-bench' | 'coming-off' | 'going-on';
```

### Relationships

- Many-to-one with Player (status belongs to one player)
- Many-to-one with Game (status belongs to one game)
- One-to-many with PlayingTimeRecord (status generates time records)

## PlayingTimeRecord

**Purpose:** Tracks actual playing time segments for accurate minute calculations and strategy enforcement.

**Key Attributes:**
- playerId: string - Reference to player
- gameId: string - Reference to game
- startTime: Date - When player entered field
- endTime: Date | null - When player left field (null if currently playing)
- position: Position - Position played during this segment
- durationSeconds: number - Calculated playing time

### TypeScript Interface

```typescript
interface PlayingTimeRecord {
  id: string;
  playerId: string;
  gameId: string;
  startTime: Date;
  endTime: Date | null;
  position: Position;
  durationSeconds: number;
  createdAt: Date;
}
```

### Relationships

- Many-to-one with Player (record belongs to one player)
- Many-to-one with Game (record belongs to one game)

## SubstitutionEvent

**Purpose:** Historical record of all substitutions for game review and strategy analysis.

**Key Attributes:**
- gameId: string - Reference to game
- playerOffId: string - Player leaving field
- playerOnId: string - Player entering field
- gameTime: number - Game clock time when substitution occurred
- reason: SubstitutionReason - Why substitution was made

### TypeScript Interface

```typescript
interface SubstitutionEvent {
  id: string;
  gameId: string;
  playerOffId: string;
  playerOnId: string;
  position: FormationPosition;
  gameTimeSeconds: number;
  reason: SubstitutionReason;
  timestamp: Date;
}

type SubstitutionReason = 'strategy' | 'injury' | 'disciplinary' | 'playing-time' | 'tactical';
```

### Relationships

- Many-to-one with Game (event belongs to one game)
- Many-to-one with Player (references two players - off and on)
