# Frontend Architecture

The frontend architecture leverages React 19, Next.js 15 App Router, and TypeScript to create a high-performance PWA optimized for real-time coaching workflows and offline-first operation.

## Component Architecture

### Component Organization

```
apps/web/src/
├── components/
│   ├── game/
│   │   ├── FormationDisplay/
│   │   │   ├── FormationDisplay.tsx          # Main field visualization
│   │   │   ├── PlayerPosition.tsx            # Individual player markers
│   │   │   ├── FieldBackground.tsx           # SVG field rendering
│   │   │   └── TouchInteractionLayer.tsx     # Drag/drop handling
│   │   ├── SubstitutionAlert/
│   │   │   ├── AlertModal.tsx                # Modal overlay for alerts
│   │   │   ├── SubstitutionPreview.tsx       # Red/green player preview
│   │   │   └── ConfirmationDialog.tsx        # Two-step confirmation
│   │   ├── PlayingTimeTracker/
│   │   │   ├── PlayingTimeDashboard.tsx      # Balance overview
│   │   │   ├── PlayerTimeCard.tsx            # Individual time display
│   │   │   └── BalanceIndicator.tsx          # Visual variance indicator
│   │   └── GameTimer/
│   │       ├── GameClock.tsx                 # Main timer display
│   │       ├── PeriodControls.tsx            # Start/stop/period controls
│   │       └── TimerPersistence.tsx          # Background timer logic
│   ├── setup/
│   │   ├── TeamSetup/
│   │   ├── PlayerSetup/
│   │   └── StrategySetup/
│   ├── shared/
│   │   ├── Layout/
│   │   ├── Navigation/
│   │   └── PWAControls/
│   └── ui/                                   # Reusable UI components
│       ├── Button/
│       ├── Modal/
│       ├── TouchTarget/
│       └── LoadingSpinner/
├── hooks/                                    # Custom React hooks
│   ├── useGameEngine.ts                      # Game logic integration
│   ├── useOfflineStatus.ts                  # Network status
│   ├── usePlayingTime.ts                     # Real-time calculations
│   ├── usePersistence.ts                     # IndexedDB operations
│   └── usePWA.ts                             # PWA capabilities
├── stores/                                   # Context-based state
│   ├── GameContext.tsx                       # Current game state
│   ├── TeamContext.tsx                       # Team/player data
│   ├── TimerContext.tsx                      # Game timer state
│   └── OfflineContext.tsx                    # Network/sync status
├── services/                                 # Business logic layer
│   ├── gameEngine/                           # Core game calculations
│   ├── persistence/                          # Data access layer
│   └── strategies/                           # Substitution algorithms
└── utils/                                    # Utility functions
    ├── calculations/                         # Playing time math
    ├── validation/                           # Data validation
    └── formatting/                           # Display formatting
```

### Component Template

```typescript
// Standard component template with PWA optimizations
import React, { memo, useCallback, useMemo } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import type { Player, FormationPosition } from '@/types/game';

interface FormationDisplayProps {
  gameId: string;
  formation: Formation;
  players: Player[];
  onPlayerMove: (playerId: string, position: FormationPosition) => void;
  className?: string;
}

export const FormationDisplay = memo<FormationDisplayProps>(({
  gameId,
  formation,
  players,
  onPlayerMove,
  className
}) => {
  const { isOffline } = useOfflineStatus();
  const { getPlayerStatus, updatePlayerPosition } = useGameEngine(gameId);

  // Memoize expensive calculations
  const playerPositions = useMemo(() =>
    formation.positions.map(pos => ({
      position: pos,
      player: players.find(p => getPlayerStatus(p.id)?.currentPosition?.id === pos.id)
    })), [formation.positions, players, getPlayerStatus]
  );

  // Optimize touch interactions for outdoor conditions
  const handlePlayerMove = useCallback((
    playerId: string,
    newPosition: FormationPosition
  ) => {
    // Optimistic update for immediate feedback
    updatePlayerPosition(playerId, newPosition);
    onPlayerMove(playerId, newPosition);
  }, [updatePlayerPosition, onPlayerMove]);

  return (
    <div
      className={`formation-display touch-optimized ${className}`}
      role="application"
      aria-label="Soccer formation management"
    >
      {/* Component implementation */}
      <FieldBackground formation={formation} />
      <TouchInteractionLayer
        positions={playerPositions}
        onMove={handlePlayerMove}
        disabled={isOffline}
      />
    </div>
  );
});

FormationDisplay.displayName = 'FormationDisplay';
```

## State Management Architecture

### State Structure

```typescript
// Centralized game state using React Context + useReducer
interface GameState {
  // Core game data
  currentGame: Game | null;
  gameTimer: GameTimer;
  formation: Formation;

  // Player management
  players: Player[];
  playerStatuses: Map<string, PlayerGameStatus>;
  playingTimeRecords: PlayingTimeRecord[];

  // Real-time calculations
  currentPlayingTime: Map<string, number>; // playerId -> seconds
  substitutionRecommendations: SubstitutionRecommendation[];

  // UI state
  alertQueue: SubstitutionAlert[];
  selectedPlayer: string | null;
  isTimerRunning: boolean;

  // Offline/sync state
  isOffline: boolean;
  pendingChanges: PendingChange[];
  lastSyncTimestamp: Date | null;
}

type GameAction =
  | { type: 'GAME_START'; payload: { gameId: string } }
  | { type: 'TIMER_START'; payload: { timestamp: Date } }
  | { type: 'TIMER_STOP'; payload: { timestamp: Date } }
  | { type: 'PLAYER_SUBSTITUTE'; payload: SubstitutionEvent }
  | { type: 'PLAYING_TIME_UPDATE'; payload: Map<string, number> }
  | { type: 'FORMATION_CHANGE'; payload: Formation }
  | { type: 'OFFLINE_STATUS_CHANGE'; payload: { isOffline: boolean } }
  | { type: 'ALERT_ADD'; payload: SubstitutionAlert }
  | { type: 'ALERT_DISMISS'; payload: { alertId: string } };

// Game state reducer with optimistic updates
const gameStateReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'PLAYER_SUBSTITUTE':
      return {
        ...state,
        // Optimistic update - apply changes immediately
        playerStatuses: updatePlayerStatuses(state.playerStatuses, action.payload),
        playingTimeRecords: addPlayingTimeRecord(state.playingTimeRecords, action.payload),
        pendingChanges: [...state.pendingChanges, { type: 'substitution', data: action.payload }]
      };

    case 'PLAYING_TIME_UPDATE':
      return {
        ...state,
        currentPlayingTime: action.payload,
        // Trigger substitution recommendations calculation
        substitutionRecommendations: calculateSubstitutionRecommendations(
          state.players,
          state.playerStatuses,
          action.payload,
          state.formation
        )
      };

    default:
      return state;
  }
};
```

### State Management Patterns

- **Real-time Updates:** Playing time calculations update every 30 seconds via useEffect with cleanup
- **Optimistic Updates:** UI changes applied immediately, persisted asynchronously to IndexedDB
- **Conflict Resolution:** Last-write-wins with timestamp comparison for multi-device sync preparation
- **Memory Optimization:** Large arrays memoized, expensive calculations moved to Web Workers
- **Persistence Integration:** State changes automatically queued for background persistence

## Routing Architecture

### Route Organization

```
apps/web/src/app/
├── layout.tsx                               # Root layout with PWA setup
├── page.tsx                                 # Dashboard/team selection
├── globals.css                              # Tailwind + custom PWA styles
├── manifest.ts                              # Web App Manifest generation
├── teams/
│   ├── page.tsx                             # Team list
│   ├── [teamId]/
│   │   ├── page.tsx                         # Team management
│   │   ├── players/
│   │   │   ├── page.tsx                     # Player management
│   │   │   └── [playerId]/
│   │   │       └── page.tsx                 # Player details/positions
│   │   └── games/
│   │       ├── page.tsx                     # Game history
│   │       ├── new/
│   │       │   └── page.tsx                 # Game setup wizard
│   │       └── [gameId]/
│   │           ├── page.tsx                 # Live game management
│   │           ├── setup/
│   │           │   └── page.tsx             # Pre-game configuration
│   │           └── analysis/
│   │               └── page.tsx             # Post-game analysis
├── offline/
│   └── page.tsx                             # Offline status page
└── install/
    └── page.tsx                             # PWA installation guide
```

### Protected Route Pattern

```typescript
// Route protection for game state consistency
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameEngine } from '@/hooks/useGameEngine';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface GameRouteGuardProps {
  gameId: string;
  children: React.ReactNode;
  requiredStatus?: GameStatus[];
}

export const GameRouteGuard: React.FC<GameRouteGuardProps> = ({
  gameId,
  children,
  requiredStatus = []
}) => {
  const router = useRouter();
  const { currentGame, isLoading, error } = useGameEngine(gameId);

  useEffect(() => {
    if (!isLoading && !currentGame) {
      // Game not found, redirect to team selection
      router.replace('/teams');
      return;
    }

    if (currentGame && requiredStatus.length > 0) {
      if (!requiredStatus.includes(currentGame.status)) {
        // Game in wrong status, redirect appropriately
        if (currentGame.status === 'setup') {
          router.replace(`/teams/${currentGame.teamId}/games/${gameId}/setup`);
        } else if (currentGame.status === 'completed') {
          router.replace(`/teams/${currentGame.teamId}/games/${gameId}/analysis`);
        }
        return;
      }
    }
  }, [currentGame, isLoading, requiredStatus, gameId, router]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  if (!currentGame) return null;

  return <>{children}</>;
};

// Usage in game management page
export default function GameManagementPage({
  params
}: {
  params: { gameId: string }
}) {
  return (
    <GameRouteGuard
      gameId={params.gameId}
      requiredStatus={['first-half', 'halftime', 'second-half']}
    >
      <FormationDisplay gameId={params.gameId} />
      <SubstitutionAlerts gameId={params.gameId} />
      <PlayingTimeTracker gameId={params.gameId} />
    </GameRouteGuard>
  );
}
```

## Frontend Services Layer

### API Client Setup

```typescript
// Service layer for future API integration (MVP operates offline-only)
import type {
  Team,
  Player,
  Game,
  SyncUploadRequest,
  SyncDownloadResponse
} from '@/types/api';

class MatchManagerAPIClient {
  private baseURL: string;
  private authToken: string | null = null;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || '') {
    this.baseURL = baseURL;
  }

  // Authentication methods for future cloud sync
  async authenticate(token: string): Promise<void> {
    this.authToken = token;
  }

  // Future sync endpoints (not used in MVP)
  async uploadGameData(data: SyncUploadRequest): Promise<void> {
    if (!this.baseURL) {
      throw new Error('API not configured - operating offline only');
    }

    const response = await fetch(`${this.baseURL}/sync/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Sync upload failed: ${response.statusText}`);
    }
  }

  async downloadUpdates(since: Date): Promise<SyncDownloadResponse> {
    if (!this.baseURL) {
      throw new Error('API not configured - operating offline only');
    }

    const response = await fetch(
      `${this.baseURL}/sync/download?since=${since.toISOString()}`,
      {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Sync download failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiClient = new MatchManagerAPIClient();
```

### Service Example

```typescript
// Game management service integrating persistence with business logic
import { gameEngineService } from '@/services/gameEngine';
import { persistenceService } from '@/services/persistence';
import type { SubstitutionEvent, PlayingTimeUpdate } from '@/types/game';

class GameManagementService {
  async executeSubstitution(
    gameId: string,
    playerOffId: string,
    playerOnId: string,
    position: FormationPosition,
    reason: SubstitutionReason = 'strategy'
  ): Promise<SubstitutionEvent> {
    try {
      // Validate substitution through game engine
      const validation = await gameEngineService.validateSubstitution(
        gameId,
        playerOffId,
        playerOnId,
        position
      );

      if (!validation.isValid) {
        throw new Error(`Invalid substitution: ${validation.reason}`);
      }

      // Create substitution event
      const substitutionEvent: SubstitutionEvent = {
        id: crypto.randomUUID(),
        gameId,
        playerOffId,
        playerOnId,
        position,
        gameTimeSeconds: await gameEngineService.getCurrentGameTime(gameId),
        reason,
        timestamp: new Date()
      };

      // Execute optimistically (update UI immediately)
      await gameEngineService.applySubstitution(substitutionEvent);

      // Persist to IndexedDB (async, non-blocking)
      persistenceService.saveSubstitutionEvent(substitutionEvent)
        .catch(error => {
          console.error('Failed to persist substitution:', error);
          // TODO: Add to retry queue
        });

      return substitutionEvent;

    } catch (error) {
      console.error('Substitution execution failed:', error);
      throw error;
    }
  }

  async updatePlayingTime(gameId: string): Promise<PlayingTimeUpdate> {
    const currentTime = Date.now();
    const activeRecords = await persistenceService.getActivePlayingTimeRecords(gameId);

    const playingTimeMap = new Map<string, number>();

    for (const record of activeRecords) {
      const currentMinutes = (currentTime - record.startTime.getTime()) / (1000 * 60);
      const totalMinutes = record.durationSeconds / 60 + currentMinutes;
      playingTimeMap.set(record.playerId, Math.round(totalMinutes * 60)); // Convert to seconds
    }

    // Update game engine state
    gameEngineService.updatePlayingTime(gameId, playingTimeMap);

    return {
      gameId,
      playingTime: playingTimeMap,
      timestamp: new Date()
    };
  }
}

export const gameManagementService = new GameManagementService();
```
