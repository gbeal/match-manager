# Database Schema

Transforming the conceptual data models into concrete IndexedDB schema optimized for offline-first PWA operation. The schema supports complex relational queries while maintaining performance during real-time game management.

## IndexedDB Schema Definition

```javascript
// Primary IndexedDB Database Schema
const MATCH_MANAGER_DB = {
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

// Critical Query Patterns and Performance Optimization

// 1. Real-time Playing Time Query (Most Critical)
const getCurrentPlayingTime = async (gameId) => {
  return db.playing_time_records
    .where(['gameId', 'endTime'])
    .equals([gameId, null])  // Active players (no end time)
    .toArray();
};

// 2. Formation Display Query (High Frequency)
const getFormationStatus = async (gameId) => {
  return db.player_game_status
    .where('gameId')
    .equals(gameId)
    .toArray();
};

// 3. Substitution Eligibility Query (Strategy Critical)
const getEligibleSubstitutions = async (gameId, position) => {
  const benchPlayers = await db.player_game_status
    .where(['gameId', 'substitutionStatus'])
    .equals([gameId, 'on-bench'])
    .toArray();

  // Filter by position eligibility in application layer
  return benchPlayers.filter(status =>
    status.player.positions.includes(position)
  );
};

// 4. Playing Time Balance Query (Strategy Engine)
const getPlayingTimeBalance = async (gameId) => {
  return db.playing_time_records
    .where('gameId')
    .equals(gameId)
    .toArray();
};
```

## Schema Relationships and Constraints

```sql
-- Conceptual SQL representation of IndexedDB relationships
-- (IndexedDB doesn't enforce constraints but application logic does)

CREATE TABLE teams (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  settings JSON NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE players (
  id UUID PRIMARY KEY,
  team_id UUID REFERENCES teams(id),
  name VARCHAR(100) NOT NULL,
  jersey_number INTEGER NOT NULL,
  positions TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT unique_jersey_per_team UNIQUE (team_id, jersey_number),
  CONSTRAINT valid_jersey_number CHECK (jersey_number BETWEEN 1 AND 99)
);

CREATE TABLE games (
  id UUID PRIMARY KEY,
  team_id UUID REFERENCES teams(id),
  date TIMESTAMP NOT NULL,
  opponent VARCHAR(100),
  venue VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'setup',
  game_timer JSON NOT NULL,
  current_formation JSON NOT NULL,
  strategy JSON NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (status IN ('setup', 'first-half', 'halftime', 'second-half', 'completed'))
);

CREATE TABLE player_game_status (
  player_id UUID REFERENCES players(id),
  game_id UUID REFERENCES games(id),
  availability VARCHAR(20) NOT NULL DEFAULT 'available',
  current_position JSON,
  substitution_status VARCHAR(20) NOT NULL DEFAULT 'on-bench',
  last_substitution_at TIMESTAMP,

  PRIMARY KEY (player_id, game_id),
  CONSTRAINT valid_availability CHECK (availability IN ('available', 'late', 'absent', 'injured')),
  CONSTRAINT valid_substitution_status CHECK (substitution_status IN ('on-field', 'on-bench', 'coming-off', 'going-on'))
);

CREATE TABLE playing_time_records (
  id UUID PRIMARY KEY,
  player_id UUID REFERENCES players(id),
  game_id UUID REFERENCES games(id),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  position VARCHAR(20) NOT NULL,
  duration_seconds INTEGER GENERATED ALWAYS AS (
    CASE WHEN end_time IS NULL
    THEN EXTRACT(EPOCH FROM NOW() - start_time)
    ELSE EXTRACT(EPOCH FROM end_time - start_time) END
  ) STORED,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT valid_position CHECK (position IN ('goalkeeper', 'defender', 'midfielder', 'forward')),
  CONSTRAINT valid_time_range CHECK (end_time IS NULL OR end_time > start_time)
);

CREATE TABLE substitution_events (
  id UUID PRIMARY KEY,
  game_id UUID REFERENCES games(id),
  player_off_id UUID REFERENCES players(id),
  player_on_id UUID REFERENCES players(id),
  position JSON NOT NULL,
  game_time_seconds INTEGER NOT NULL,
  reason VARCHAR(20) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),

  CONSTRAINT valid_reason CHECK (reason IN ('strategy', 'injury', 'disciplinary', 'playing-time', 'tactical')),
  CONSTRAINT different_players CHECK (player_off_id != player_on_id)
);

-- Indexes for Performance (represented as IndexedDB indexes above)
CREATE INDEX idx_players_team_active ON players(team_id, is_active);
CREATE INDEX idx_games_team_status ON games(team_id, status);
CREATE INDEX idx_playing_time_active ON playing_time_records(game_id, end_time) WHERE end_time IS NULL;
CREATE INDEX idx_player_status_formation ON player_game_status(game_id, substitution_status);
```
