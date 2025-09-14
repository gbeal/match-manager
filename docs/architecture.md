# Match Manager Fullstack Architecture Document

## Introduction

This document outlines the complete fullstack architecture for **Match Manager**, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

This unified approach combines what would traditionally be separate backend and frontend architecture documents, streamlining the development process for modern fullstack applications where these concerns are increasingly intertwined.

### Starter Template or Existing Project

Based on the PRD analysis, this project is built on **Next.js 15 with App Router**, React 19, TypeScript, and Tailwind CSS v4 with Turbo for builds. The existing foundation provides:

**Pre-configured Architecture Decisions:**
- Next.js 15 App Router (established)
- React 19 for UI components
- TypeScript with strict mode and path mapping (`@/*` → `./src/*`)
- Tailwind CSS v4 for styling
- Turbo for build optimization
- ESLint with Next.js TypeScript configuration

**Architectural Constraints:**
- Must maintain offline-first PWA requirements
- Client-side state management for game logic
- Mobile-first responsive design
- IndexedDB for local data persistence

**What Can Be Modified:** Infrastructure choices, backend services (future), deployment platform, additional tooling
**What Must Be Retained:** Next.js foundation, TypeScript setup, mobile-first approach, offline-first operation

### Change Log
| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-09-14 | 1.0 | Initial architecture document creation from Match Manager PRD | Winston (Architect) |

## High Level Architecture

### Technical Summary

Match Manager employs a **client-first Progressive Web App architecture** deployed as a static Next.js application with comprehensive offline capabilities. The frontend React 19 application handles all core game management logic locally using IndexedDB for persistence, while future serverless functions will provide optional cloud sync and organization features. Key integration points include PWA service worker for offline reliability, IndexedDB for complex game state management, and touch-optimized mobile interface for sideline coaching. The architecture prioritizes **Vercel edge deployment** for global performance with potential Supabase integration for future cloud features, achieving the PRD's cognitive load reduction goals through real-time local processing and visual formation management.

### Platform and Infrastructure Choice

**Platform:** Vercel + Supabase
**Key Services:** Vercel Edge Functions, Supabase (future), IndexedDB (primary), Service Worker
**Deployment Host and Regions:** Vercel global edge network with focus on North American youth soccer markets

### Repository Structure

**Structure:** Monorepo with clear separation between PWA frontend and future API services
**Monorepo Tool:** npm workspaces (lightweight, already supported by existing Next.js setup)
**Package Organization:**
- `apps/web` - Main PWA application
- `packages/shared` - TypeScript interfaces and utilities
- `packages/game-engine` - Core game logic (formations, timers, strategies)
- `apps/api` - Future serverless functions for cloud sync

### High Level Architecture Diagram

```mermaid
graph TB
    User[Coach with Mobile Device] --> PWA[Match Manager PWA]
    PWA --> SW[Service Worker]
    PWA --> IDB[(IndexedDB)]
    PWA --> GE[Game Engine Package]

    SW --> Cache[Static Assets Cache]
    SW --> BGSync[Background Sync Queue]

    GE --> FM[Formation Manager]
    GE --> ST[Strategy Tracker]
    GE --> TC[Timer Controller]

    PWA -.-> API[Future API Services]
    API -.-> DB[(Future Cloud Database)]

    subgraph "Current MVP Architecture"
        PWA
        SW
        IDB
        GE
        FM
        ST
        TC
    end

    subgraph "Future Cloud Integration"
        API
        DB
    end

    style PWA fill:#e1f5fe
    style GE fill:#f3e5f5
    style API fill:#fff3e0
    style DB fill:#fff3e0
```

### Architectural Patterns

- **Client-First PWA Pattern:** All critical functionality operates locally with cloud sync as enhancement - _Rationale:_ Ensures reliability during games without internet connectivity, core requirement for sideline coaching_

- **Offline-First Data Pattern:** IndexedDB as primary storage with eventual cloud synchronization - _Rationale:_ Game data must persist through device restarts and network failures during 90-minute sessions_

- **Component-Based UI with Context State:** React 19 components with Context API for complex game state - _Rationale:_ Enables real-time UI updates for formation changes and substitution alerts while maintaining performance_

- **Service Worker Background Processing:** Service worker handles timer persistence and background sync preparation - _Rationale:_ Maintains game timers even when app is backgrounded, critical for accurate playing time calculations_

- **Domain-Driven Game Engine:** Separate packages for game logic (formations, strategies, timers) independent of UI - _Rationale:_ Enables comprehensive testing of game calculations and potential future platform reuse_

## Tech Stack

### Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.6+ | Type-safe development | Essential for complex game state management and PWA reliability |
| Frontend Framework | Next.js | 15.x | PWA foundation & SSG | Already established, excellent PWA support, edge deployment optimization |
| UI Component Library | React | 19.x | Component architecture | Latest stable, improved concurrent features for real-time updates |
| State Management | React Context + useReducer | Built-in | Game state management | Sufficient for client-side complexity, avoids external dependencies |
| Backend Language | TypeScript | 5.6+ | Future API consistency | Type sharing between frontend and future backend services |
| Backend Framework | Next.js API Routes | 15.x | Serverless functions | Seamless integration with frontend, Vercel optimization |
| API Style | REST | - | Future cloud sync | Simple, reliable, widely supported for future mobile app integration |
| Database | IndexedDB | Browser native | Primary offline storage | Required for complex offline relational data and PWA requirements |
| Cache | Service Worker Cache API | Browser native | Asset caching | PWA standard for offline reliability |
| File Storage | Browser File API | Browser native | Future export features | Local file generation for playing time reports |
| Authentication | Supabase Auth | 2.x | Future user management | When cloud sync is added, integrates with Supabase ecosystem |
| Frontend Testing | Jest + React Testing Library | Latest | Component testing | Industry standard for React component testing |
| Backend Testing | Jest + Supertest | Latest | API endpoint testing | Consistent testing approach across fullstack |
| E2E Testing | Playwright | Latest | PWA testing | Excellent PWA support, mobile testing capabilities |
| Build Tool | npm workspaces | Built-in | Monorepo management | Lightweight, no additional tooling complexity |
| Bundler | Next.js built-in (Turbo) | 15.x | Optimized builds | Already configured, excellent performance |
| IaC Tool | Vercel CLI | Latest | Deployment automation | Integrated with platform choice |
| CI/CD | GitHub Actions | - | Automated deployment | Free, integrates with Vercel, supports PWA testing |
| Monitoring | Vercel Analytics | Built-in | Performance tracking | Integrated solution for web vitals and user analytics |
| Logging | Console + Vercel Logs | Built-in | Error tracking | Start simple, upgrade to Sentry if needed |
| CSS Framework | Tailwind CSS | 4.x | Responsive styling | Already established, excellent mobile-first utilities |

## Data Models

### Team

**Purpose:** Represents a soccer team with basic configuration and settings that persist across multiple games.

**Key Attributes:**
- id: string - Unique identifier for the team
- name: string - Team name (e.g., "Lightning U12")
- createdAt: Date - Team creation timestamp
- settings: TeamSettings - Configuration preferences

#### TypeScript Interface

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

#### Relationships

- One-to-many with Player (team has multiple players)
- One-to-many with Game (team plays multiple games)

### Player

**Purpose:** Individual player with position eligibility and persistent information used across games and seasons.

**Key Attributes:**
- id: string - Unique player identifier
- name: string - Player full name
- jerseyNumber: number - Uniform number (unique within team)
- positions: Position[] - Eligible playing positions
- isActive: boolean - Current roster status

#### TypeScript Interface

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

#### Relationships

- Many-to-one with Team (player belongs to one team)
- One-to-many with PlayerGameStatus (player has status in multiple games)
- One-to-many with PlayingTimeRecord (player has playing time across games)

### Game

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

#### TypeScript Interface

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

#### Relationships

- Many-to-one with Team (game belongs to one team)
- One-to-many with PlayerGameStatus (game has multiple player statuses)
- One-to-many with SubstitutionEvent (game has multiple substitutions)
- One-to-many with PlayingTimeRecord (game generates playing time records)

### Formation

**Purpose:** Defines tactical formation with position layout and player assignment capabilities.

**Key Attributes:**
- name: string - Formation identifier (e.g., "4-4-2", "4-3-3")
- positions: FormationPosition[] - Field positions with coordinates
- description: string - Human-readable formation description

#### TypeScript Interface

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

#### Relationships

- Many-to-many with Player (through position eligibility)
- One-to-many with PlayerGameStatus (positions are assigned to players)

### PlayerGameStatus

**Purpose:** Tracks individual player status, position assignment, and availability within a specific game.

**Key Attributes:**
- playerId: string - Reference to player
- gameId: string - Reference to game
- availability: PlayerAvailability - Current game availability
- currentPosition: FormationPosition | null - Assigned field position
- substitutionStatus: SubstitutionStatus - Pending substitution state

#### TypeScript Interface

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

#### Relationships

- Many-to-one with Player (status belongs to one player)
- Many-to-one with Game (status belongs to one game)
- One-to-many with PlayingTimeRecord (status generates time records)

### PlayingTimeRecord

**Purpose:** Tracks actual playing time segments for accurate minute calculations and strategy enforcement.

**Key Attributes:**
- playerId: string - Reference to player
- gameId: string - Reference to game
- startTime: Date - When player entered field
- endTime: Date | null - When player left field (null if currently playing)
- position: Position - Position played during this segment
- durationSeconds: number - Calculated playing time

#### TypeScript Interface

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

#### Relationships

- Many-to-one with Player (record belongs to one player)
- Many-to-one with Game (record belongs to one game)

### SubstitutionEvent

**Purpose:** Historical record of all substitutions for game review and strategy analysis.

**Key Attributes:**
- gameId: string - Reference to game
- playerOffId: string - Player leaving field
- playerOnId: string - Player entering field
- gameTime: number - Game clock time when substitution occurred
- reason: SubstitutionReason - Why substitution was made

#### TypeScript Interface

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

#### Relationships

- Many-to-one with Game (event belongs to one game)
- Many-to-one with Player (references two players - off and on)

## API Specification

Based on our tech stack selection of REST API for future cloud sync, I'm designing a REST API specification that will support the future Phase 2 cloud synchronization features while maintaining the client-first architecture priority.

**Important Note:** The MVP operates entirely client-side with no API dependencies. This specification defines the future cloud sync endpoints that will enhance but not replace the offline-first functionality.

### REST API Specification

```yaml
openapi: 3.0.0
info:
  title: Match Manager Cloud Sync API
  version: 1.0.0
  description: REST API for Match Manager cloud synchronization and multi-device support
servers:
  - url: https://api.matchmanager.app/v1
    description: Production API server
  - url: https://staging-api.matchmanager.app/v1
    description: Staging API server

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Team:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
          maxLength: 100
        settings:
          $ref: '#/components/schemas/TeamSettings'
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
      required: [id, name, settings]

    Player:
      type: object
      properties:
        id:
          type: string
          format: uuid
        teamId:
          type: string
          format: uuid
        name:
          type: string
          maxLength: 100
        jerseyNumber:
          type: integer
          minimum: 1
          maximum: 99
        positions:
          type: array
          items:
            type: string
            enum: [goalkeeper, defender, midfielder, forward]
        isActive:
          type: boolean
      required: [id, teamId, name, jerseyNumber, positions]

    Game:
      type: object
      properties:
        id:
          type: string
          format: uuid
        teamId:
          type: string
          format: uuid
        date:
          type: string
          format: date-time
        opponent:
          type: string
          maxLength: 100
        status:
          type: string
          enum: [setup, first-half, halftime, second-half, completed]
        currentFormation:
          $ref: '#/components/schemas/Formation'
        strategy:
          $ref: '#/components/schemas/SubstitutionStrategy'
      required: [id, teamId, date, status]

paths:
  /teams:
    get:
      summary: List user's teams
      security:
        - BearerAuth: []
      responses:
        '200':
          description: List of teams
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Team'

    post:
      summary: Create new team
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Team'
      responses:
        '201':
          description: Team created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Team'

  /teams/{teamId}/players:
    get:
      summary: Get team roster
      parameters:
        - name: teamId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      security:
        - BearerAuth: []
      responses:
        '200':
          description: Team roster
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Player'

  /teams/{teamId}/games:
    get:
      summary: Get team's games
      parameters:
        - name: teamId
          in: path
          required: true
          schema:
            type: string
            format: uuid
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
        - name: status
          in: query
          schema:
            type: string
            enum: [setup, first-half, halftime, second-half, completed]
      security:
        - BearerAuth: []
      responses:
        '200':
          description: List of games
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Game'

  /sync/upload:
    post:
      summary: Upload local game data for cloud backup
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                games:
                  type: array
                  items:
                    $ref: '#/components/schemas/Game'
                lastSyncTimestamp:
                  type: string
                  format: date-time
      responses:
        '200':
          description: Data synced successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  syncedCount:
                    type: integer
                  conflicts:
                    type: array
                    items:
                      type: object

  /sync/download:
    get:
      summary: Download updates from cloud for local sync
      parameters:
        - name: since
          in: query
          required: true
          schema:
            type: string
            format: date-time
      security:
        - BearerAuth: []
      responses:
        '200':
          description: Cloud updates
          content:
            application/json:
              schema:
                type: object
                properties:
                  teams:
                    type: array
                    items:
                      $ref: '#/components/schemas/Team'
                  players:
                    type: array
                    items:
                      $ref: '#/components/schemas/Player'
                  games:
                    type: array
                    items:
                      $ref: '#/components/schemas/Game'

security:
  - BearerAuth: []
```

## Components

Based on the architectural patterns, tech stack, and data models defined above, I've identified the major logical components across the fullstack Match Manager system. These components represent both frontend modules and future backend services, with clear boundaries and interfaces.

### PWA Shell Component

**Responsibility:** Provides the Progressive Web App foundation including service worker management, offline detection, installation prompts, and app lifecycle management.

**Key Interfaces:**
- `ServiceWorkerManager` - Controls service worker registration and updates
- `OfflineStateProvider` - Exposes online/offline status to other components
- `PWAInstallPrompt` - Manages app installation user experience

**Dependencies:** Browser APIs (Service Worker, Web App Manifest, Network Information)

**Technology Stack:** Next.js App Router, Service Worker API, Web App Manifest, React Context for offline state management

### Game Engine Component

**Responsibility:** Core business logic for game management including formation logic, substitution calculations, playing time algorithms, and game state management. Operates entirely client-side with no external dependencies.

**Key Interfaces:**
- `FormationManager` - Manages tactical formations and position assignments
- `SubstitutionEngine` - Calculates substitution recommendations based on strategy
- `PlayingTimeCalculator` - Real-time playing time tracking and balance calculations
- `GameStateManager` - Coordinates game status, timers, and transitions

**Dependencies:** Data Persistence Component for state storage

**Technology Stack:** TypeScript classes in `packages/game-engine`, React Context for state exposure, Web Workers for complex calculations

### Data Persistence Component

**Responsibility:** Manages all local data storage using IndexedDB with schema migration, data validation, and query optimization. Provides abstraction layer over IndexedDB complexity.

**Key Interfaces:**
- `TeamRepository` - CRUD operations for teams and settings
- `PlayerRepository` - Player management with position eligibility
- `GameRepository` - Game data with complex relational queries
- `SyncRepository` - Data preparation for future cloud synchronization

**Dependencies:** IndexedDB browser API

**Technology Stack:** IndexedDB with Dexie.js wrapper, TypeScript repositories pattern, data validation using Zod schemas

### Formation Display Component

**Responsibility:** Visual representation of soccer field with real-time player positioning, substitution status color coding, and touch-optimized interactions for outdoor coaching conditions.

**Key Interfaces:**
- `FieldRenderer` - SVG-based soccer field visualization
- `PlayerPositionManager` - Drag-and-drop player positioning
- `SubstitutionVisualizer` - Color-coded substitution status display

**Dependencies:** Game Engine Component for formation data, UI Component Library for touch interactions

**Technology Stack:** React 19 with SVG rendering, Tailwind CSS for responsive design, React DnD for touch interactions, Canvas API for performance optimization

### Timer Management Component

**Responsibility:** Independent game clock management with persistence across app interruptions, period tracking, and integration with playing time calculations.

**Key Interfaces:**
- `GameTimer` - Start/stop/reset functionality independent of system clock
- `PeriodManager` - First half, halftime, second half tracking
- `TimerPersistence` - Background timer continuation via Service Worker

**Dependencies:** PWA Shell Component for background processing, Data Persistence Component for timer state

**Technology Stack:** Web Workers for background timing, Service Worker for persistence, React Context for timer state sharing

### Substitution Alert Component

**Responsibility:** Proactive substitution recommendations based on configured strategies with advance warnings and manual confirmation workflows.

**Key Interfaces:**
- `AlertEngine` - Strategy-based substitution recommendation logic
- `NotificationManager` - Visual and haptic alert delivery
- `ConfirmationWorkflow` - Two-step substitution confirmation process

**Dependencies:** Game Engine Component for strategy logic, Timer Management Component for timing triggers

**Technology Stack:** React Context for alert state, Web Notifications API, Vibration API, React portals for modal overlays

### Strategy Configuration Component

**Responsibility:** Substitution strategy management including equal playing time, minimum minutes, and custom strategies with real-time balance monitoring.

**Key Interfaces:**
- `StrategyDefinition` - Configuration of playing time strategies
- `BalanceCalculator` - Real-time playing time variance tracking
- `StrategyValidator` - Pre-game feasibility validation

**Dependencies:** Game Engine Component for calculations, Data Persistence Component for strategy storage

**Technology Stack:** TypeScript strategy pattern implementation, React forms with validation, Chart.js for balance visualization

### Future Cloud Sync Component

**Responsibility:** Background data synchronization with cloud services for multi-device support and data backup. Operates independently of core functionality.

**Key Interfaces:**
- `SyncManager` - Coordinates upload/download operations
- `ConflictResolver` - Handles data conflicts between devices
- `BackgroundSync` - Service Worker background synchronization

**Dependencies:** Data Persistence Component for local data, PWA Shell Component for background processing

**Technology Stack:** Service Worker Background Sync, Supabase client, conflict resolution algorithms, retry logic with exponential backoff

### Component Diagrams

```mermaid
graph TB
    subgraph "Frontend Components"
        PWA[PWA Shell Component]
        FD[Formation Display Component]
        TM[Timer Management Component]
        SA[Substitution Alert Component]
        SC[Strategy Configuration Component]
        GE[Game Engine Component]
        DP[Data Persistence Component]
    end

    subgraph "Future Backend Component"
        CS[Cloud Sync Component]
    end

    subgraph "External Dependencies"
        IDB[(IndexedDB)]
        SW[Service Worker]
        SB[Supabase API]
    end

    PWA --> SW
    PWA --> FD
    PWA --> TM
    PWA --> SA

    FD --> GE
    TM --> GE
    SA --> GE
    SC --> GE

    GE --> DP
    DP --> IDB

    CS -.-> DP
    CS -.-> SB
    CS -.-> SW

    style CS fill:#fff3e0
    style SB fill:#fff3e0
    style GE fill:#e8f5e8
    style DP fill:#e3f2fd
```

## External APIs

Based on the PRD requirements and component design, Match Manager's MVP operates entirely offline without external API dependencies. However, future Phase 2 enhancements will integrate specific external services for cloud sync and enhanced functionality.

### Current MVP Status: No External APIs Required

The Match Manager MVP is specifically designed to operate **completely independently** of external services to meet the core offline-first requirement. All game management functionality (formation display, substitution alerts, playing time tracking) operates using local browser capabilities only.

### Future External API Integrations (Phase 2)

### Supabase Authentication API

- **Purpose:** User authentication and authorization for cloud sync and multi-device access
- **Documentation:** https://supabase.com/docs/reference/javascript/auth-api
- **Base URL(s):** https://[project-ref].supabase.co/auth/v1
- **Authentication:** API Key + JWT tokens
- **Rate Limits:** 100 requests/minute per user

**Key Endpoints Used:**
- `POST /signup` - User registration for cloud sync accounts
- `POST /token` - JWT token refresh for session management
- `POST /logout` - Session termination
- `GET /user` - Current user profile information

**Integration Notes:** Authentication will be optional enhancement - all core functionality remains available without user accounts. JWT tokens stored securely in browser storage with automatic refresh handling.

### Supabase Database API

- **Purpose:** Cloud backup and synchronization of team, player, and game data across devices
- **Documentation:** https://supabase.com/docs/reference/javascript/select
- **Base URL(s):** https://[project-ref].supabase.co/rest/v1
- **Authentication:** Bearer token (JWT from auth)
- **Rate Limits:** 1000 requests/minute per project

**Key Endpoints Used:**
- `GET /teams` - Retrieve user's teams for sync
- `POST /teams` - Upload local team data to cloud
- `PATCH /teams` - Update team configurations
- `GET /games` - Download game history for multi-device access
- `POST /games` - Upload completed games for backup

**Integration Notes:** All API calls designed as background operations with local-first priority. API failures never impact core functionality. Conflict resolution handled through timestamp-based last-write-wins with user confirmation for critical conflicts.

### Browser Geolocation API

- **Purpose:** Automatic field location detection for game metadata and future weather integration
- **Documentation:** https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
- **Base URL(s):** Browser native API
- **Authentication:** User permission prompt
- **Rate Limits:** Browser-imposed (typically once per session)

**Key Endpoints Used:**
- `getCurrentPosition()` - One-time location for game setup
- `watchPosition()` - Monitor location changes during travel between fields

**Integration Notes:** Location data used only for game metadata (venue identification). All location features optional with manual venue entry fallback. Privacy-focused implementation with minimal data retention.

### Web Push Notifications API (Future)

- **Purpose:** Cross-device substitution reminders and game preparation alerts for coaches managing multiple teams
- **Documentation:** https://developer.mozilla.org/en-US/docs/Web/API/Push_API
- **Base URL(s):** Browser native + push service (Firebase/web-push)
- **Authentication:** Push subscription tokens
- **Rate Limits:** Browser and service specific

**Key Endpoints Used:**
- `subscribe()` - Register for push notifications
- Push service endpoints for message delivery
- `unsubscribe()` - Remove notification subscriptions

**Integration Notes:** Push notifications planned for Phase 2 multi-team management. Used for pre-game reminders and roster updates. All notifications supplementary to in-app alerts.

## Core Workflows

The following sequence diagrams illustrate key system workflows that demonstrate component interactions and clarify critical architecture decisions for the Match Manager PWA.

### Game Setup and Initialization Workflow

```mermaid
sequenceDiagram
    participant Coach
    participant PWA as PWA Shell
    participant SC as Strategy Config
    participant GE as Game Engine
    participant DP as Data Persistence
    participant FD as Formation Display

    Coach->>PWA: Start New Game
    PWA->>DP: Load Team Data
    DP-->>PWA: Team + Players + Formation

    PWA->>SC: Display Strategy Selection
    Coach->>SC: Select Equal Time Strategy
    SC->>GE: Initialize Strategy Engine

    PWA->>Coach: Player Availability Check
    Coach->>PWA: Mark Players Present/Absent
    PWA->>GE: Update Available Players

    GE->>GE: Validate Formation vs Available Players
    alt Insufficient Players
        GE-->>PWA: Formation Validation Error
        PWA->>Coach: Request Formation Change
    else Sufficient Players
        GE->>DP: Create Game Session
        DP-->>GE: Game Session Created
        GE->>FD: Initialize Formation Display
        FD-->>Coach: Ready for Kickoff
    end
```

### Real-Time Substitution Alert and Execution Workflow

```mermaid
sequenceDiagram
    participant Coach
    participant Timer as Timer Management
    participant SA as Substitution Alert
    participant GE as Game Engine
    participant FD as Formation Display
    participant DP as Data Persistence

    Timer->>Timer: Game Clock Running
    Timer->>SA: 6-Minute Shift Alert
    SA->>GE: Request Substitution Recommendation
    GE->>GE: Calculate Playing Time Balance
    GE->>GE: Apply Strategy (Equal Time)
    GE-->>SA: Recommend: Player A off, Player B on

    SA->>Coach: Visual Alert + Vibration
    Coach->>SA: Acknowledge Alert
    SA->>Coach: Display Substitution Preview

    alt Coach Confirms
        Coach->>SA: Confirm Substitution
        SA->>GE: Execute Substitution
        GE->>FD: Update Position (Red/Green)
        GE->>DP: Log Substitution Event
        GE->>Timer: Update Playing Time Tracking
        FD-->>Coach: Formation Updated
    else Coach Modifies
        Coach->>SA: Override Recommendation
        SA->>Coach: Custom Player Selection
        Coach->>SA: Confirm Modified Sub
        SA->>GE: Execute Custom Substitution
    else Coach Dismisses
        Coach->>SA: Dismiss Alert
        SA->>SA: Snooze for 2 minutes
    end
```

### Playing Time Balance Monitoring Workflow

```mermaid
sequenceDiagram
    participant Coach
    participant Timer as Timer Management
    participant GE as Game Engine
    participant SC as Strategy Config
    participant FD as Formation Display
    participant PTD as Playing Time Dashboard

    Timer->>GE: Every 30 seconds: Update Playing Time
    GE->>GE: Calculate Current Minutes per Player
    GE->>SC: Check Against Strategy Targets
    SC->>SC: Equal Time: Target = Total Time / Player Count
    SC-->>GE: Current Variance per Player

    alt Variance > Tolerance (3 min)
        GE->>FD: Update Player Colors (Warning)
        GE->>PTD: Flag Imbalanced Players
        PTD-->>Coach: Visual Balance Warning
    else Variance Acceptable
        GE->>FD: Maintain Normal Colors
        GE->>PTD: Update Progress Bars
    end

    Coach->>PTD: Check Playing Time Balance
    PTD->>GE: Request Current Statistics
    GE-->>PTD: Player Minutes + Projections
    PTD-->>Coach: Balance Dashboard Display
```

### Offline-First Data Persistence Workflow

```mermaid
sequenceDiagram
    participant Coach
    participant PWA as PWA Shell
    participant GE as Game Engine
    participant DP as Data Persistence
    participant IDB as IndexedDB
    participant SW as Service Worker

    PWA->>PWA: Detect Network Status
    PWA->>Coach: Offline Mode Indicator

    Coach->>GE: Make Substitution
    GE->>DP: Save Game State Change
    DP->>IDB: Write to Local Database
    IDB-->>DP: Confirm Write
    DP-->>GE: State Saved

    GE->>SW: Queue Background Sync
    SW->>SW: Store Sync Data

    Note over Coach,SW: App Closes / Device Sleep

    PWA->>IDB: App Restart - Load Game State
    IDB-->>PWA: Current Game Data
    PWA->>GE: Restore Game Session
    GE->>FD: Rebuild Formation Display

    alt Network Returns
        SW->>SW: Detect Online Status
        SW->>DP: Prepare Sync Data
        DP-->>SW: Game Changes for Upload
        SW->>External: Future Cloud Sync
    else Remains Offline
        SW->>SW: Continue Queuing Changes
    end
```

### Emergency Substitution and Error Handling Workflow

```mermaid
sequenceDiagram
    participant Coach
    participant FD as Formation Display
    participant GE as Game Engine
    participant SA as Substitution Alert
    participant DP as Data Persistence

    Coach->>FD: Long Press Player (Injury)
    FD->>Coach: Emergency Menu
    Coach->>FD: Select "Injured - Remove"

    FD->>GE: Emergency Substitution Request
    GE->>GE: Find Eligible Replacement

    alt Replacement Available
        GE->>SA: Bypass Normal Workflow
        SA->>Coach: Emergency Sub Confirmation
        Coach->>SA: Confirm Emergency
        SA->>GE: Execute Immediate Sub
        GE->>DP: Log Emergency Event
        GE->>FD: Update Formation
    else No Replacement
        GE-->>FD: Formation Adjustment Required
        FD->>Coach: Formation Change Options
        Coach->>FD: Select New Formation
        FD->>GE: Apply Formation Change
        GE->>DP: Save Formation Change
    end

    Note over Coach,DP: All changes persist locally
    GE->>DP: Update Player Availability Status
    DP-->>GE: Changes Saved
```

## Database Schema

Transforming the conceptual data models into concrete IndexedDB schema optimized for offline-first PWA operation. The schema supports complex relational queries while maintaining performance during real-time game management.

### IndexedDB Schema Definition

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

### Schema Relationships and Constraints

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

## Frontend Architecture

The frontend architecture leverages React 19, Next.js 15 App Router, and TypeScript to create a high-performance PWA optimized for real-time coaching workflows and offline-first operation.

### Component Architecture

#### Component Organization

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

#### Component Template

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

### State Management Architecture

#### State Structure

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

#### State Management Patterns

- **Real-time Updates:** Playing time calculations update every 30 seconds via useEffect with cleanup
- **Optimistic Updates:** UI changes applied immediately, persisted asynchronously to IndexedDB
- **Conflict Resolution:** Last-write-wins with timestamp comparison for multi-device sync preparation
- **Memory Optimization:** Large arrays memoized, expensive calculations moved to Web Workers
- **Persistence Integration:** State changes automatically queued for background persistence

### Routing Architecture

#### Route Organization

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

#### Protected Route Pattern

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

### Frontend Services Layer

#### API Client Setup

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

#### Service Example

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

## Backend Architecture

The backend architecture is designed for **future Phase 2 enhancement** - the MVP operates entirely client-side. The planned backend uses Next.js API Routes deployed as Vercel serverless functions for cloud sync and multi-device support.

### Service Architecture

Based on our platform choice of Vercel + Supabase, the backend follows a **serverless architecture** pattern with clear separation between current offline-first operation and future cloud enhancement.

#### Serverless Architecture

##### Function Organization

```
apps/api/src/
├── routes/                              # API route handlers
│   ├── teams/
│   │   ├── route.ts                     # GET /api/teams, POST /api/teams
│   │   └── [teamId]/
│   │       ├── route.ts                 # GET/PATCH/DELETE /api/teams/:id
│   │       ├── players/
│   │       │   └── route.ts             # Team roster management
│   │       └── games/
│   │           └── route.ts             # Team game history
│   ├── sync/
│   │   ├── upload/
│   │   │   └── route.ts                 # POST /api/sync/upload
│   │   └── download/
│   │       └── route.ts                 # GET /api/sync/download
│   └── auth/
│       ├── callback/
│       │   └── route.ts                 # OAuth callback handler
│       └── refresh/
│           └── route.ts                 # Token refresh endpoint
├── services/                            # Business logic services
│   ├── syncService.ts                   # Data synchronization logic
│   ├── conflictResolution.ts            # Multi-device conflict handling
│   ├── teamService.ts                   # Team management operations
│   └── gameService.ts                   # Game data processing
├── middleware/                          # Request processing
│   ├── auth.ts                          # JWT validation middleware
│   ├── validation.ts                    # Request/response validation
│   ├── rateLimiting.ts                  # API rate limiting
│   └── errorHandling.ts                 # Centralized error processing
├── utils/                               # Shared utilities
│   ├── supabase.ts                      # Supabase client configuration
│   ├── validation.ts                    # Data validation schemas
│   └── dateUtils.ts                     # Timestamp handling for sync
└── types/                               # API-specific TypeScript types
    ├── api.ts                           # Request/response interfaces
    ├── sync.ts                          # Synchronization data types
    └── database.ts                      # Supabase table interfaces
```

##### Function Template

```typescript
// Standard serverless function template with error handling
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateJWT, extractUserFromToken } from '@/middleware/auth';
import { validateRequestBody } from '@/middleware/validation';
import { handleAPIError } from '@/middleware/errorHandling';
import type { SyncUploadRequest, SyncUploadResponse } from '@/types/api';

// POST /api/sync/upload - Upload local game data for cloud backup
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Authentication middleware
    const authResult = await validateJWT(request);
    if (!authResult.valid) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Invalid authentication' } },
        { status: 401 }
      );
    }

    const userId = authResult.userId;

    // Request validation
    const requestBody: SyncUploadRequest = await request.json();
    const validationResult = validateRequestBody(requestBody, 'syncUpload');
    if (!validationResult.valid) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: validationResult.errors } },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Process sync data
    const syncResult = await processSyncUpload(
      supabase,
      userId,
      requestBody.games,
      requestBody.lastSyncTimestamp
    );

    const response: SyncUploadResponse = {
      syncedCount: syncResult.processed,
      conflicts: syncResult.conflicts,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Sync upload error:', error);
    return handleAPIError(error);
  }
}

async function processSyncUpload(
  supabase: SupabaseClient,
  userId: string,
  games: Game[],
  lastSync: string | null
): Promise<{ processed: number; conflicts: ConflictData[] }> {
  const conflicts: ConflictData[] = [];
  let processed = 0;

  for (const game of games) {
    try {
      // Check for conflicts with existing data
      const { data: existing } = await supabase
        .from('games')
        .select('updated_at')
        .eq('id', game.id)
        .eq('user_id', userId)
        .single();

      if (existing && existing.updated_at > game.updatedAt) {
        // Server data is newer - record conflict
        conflicts.push({
          entityId: game.id,
          entityType: 'game',
          localTimestamp: game.updatedAt,
          serverTimestamp: existing.updated_at
        });
        continue;
      }

      // Upsert game data
      const { error } = await supabase
        .from('games')
        .upsert({
          ...game,
          user_id: userId,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      processed++;

    } catch (error) {
      console.error(`Failed to sync game ${game.id}:`, error);
      // Continue processing other games
    }
  }

  return { processed, conflicts };
}

// Rate limiting for sync endpoints
export const runtime = 'edge';
export const maxDuration = 30; // 30 seconds max execution time
```

### Database Architecture

The backend leverages **Supabase PostgreSQL** for cloud storage with **Row Level Security (RLS)** for multi-tenant data isolation.

#### Schema Design

```sql
-- Supabase PostgreSQL schema for cloud sync
-- Row Level Security ensures data isolation between users

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams table with RLS
CREATE TABLE public.teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL CHECK (length(name) <= 100),
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Players table with RLS
CREATE TABLE public.players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL CHECK (length(name) <= 100),
  jersey_number INTEGER NOT NULL CHECK (jersey_number BETWEEN 1 AND 99),
  positions TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(team_id, jersey_number)
);

-- Games table with RLS
CREATE TABLE public.games (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  opponent TEXT,
  venue TEXT,
  status TEXT NOT NULL DEFAULT 'setup' CHECK (status IN ('setup', 'first-half', 'halftime', 'second-half', 'completed')),
  game_timer JSONB NOT NULL DEFAULT '{}',
  current_formation JSONB NOT NULL DEFAULT '{}',
  strategy JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playing time records with RLS
CREATE TABLE public.playing_time_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  position TEXT NOT NULL CHECK (position IN ('goalkeeper', 'defender', 'midfielder', 'forward')),
  duration_seconds INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN end_time IS NULL THEN 0
      ELSE EXTRACT(EPOCH FROM end_time - start_time)::INTEGER
    END
  ) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Substitution events with RLS
CREATE TABLE public.substitution_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  player_off_id UUID REFERENCES public.players(id),
  player_on_id UUID REFERENCES public.players(id),
  position JSONB NOT NULL,
  game_time_seconds INTEGER NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('strategy', 'injury', 'disciplinary', 'playing-time', 'tactical')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CHECK (player_off_id != player_on_id)
);

-- Row Level Security policies
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playing_time_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substitution_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for data isolation
CREATE POLICY "Users can only access their own teams"
  ON public.teams FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own players"
  ON public.players FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own games"
  ON public.games FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own playing time records"
  ON public.playing_time_records FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own substitution events"
  ON public.substitution_events FOR ALL
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_teams_user_created ON public.teams(user_id, created_at);
CREATE INDEX idx_players_team_active ON public.players(team_id, is_active);
CREATE INDEX idx_games_team_date ON public.games(team_id, date DESC);
CREATE INDEX idx_playing_time_game ON public.playing_time_records(game_id, start_time);
CREATE INDEX idx_substitution_game ON public.substitution_events(game_id, game_time_seconds);

-- Functions and triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Data Access Layer

```typescript
// Repository pattern for Supabase data access
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Team, Player, Game } from '@shared/types';

class TeamRepository {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, serviceKey: string) {
    this.supabase = createClient(supabaseUrl, serviceKey);
  }

  async getUserTeams(userId: string): Promise<Team[]> {
    const { data, error } = await this.supabase
      .from('teams')
      .select(`
        *,
        players:players(count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch teams: ${error.message}`);
    return data || [];
  }

  async createTeam(userId: string, teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Promise<Team> {
    const { data, error } = await this.supabase
      .from('teams')
      .insert({
        user_id: userId,
        ...teamData
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create team: ${error.message}`);
    return data;
  }

  async updateTeam(userId: string, teamId: string, updates: Partial<Team>): Promise<Team> {
    const { data, error } = await this.supabase
      .from('teams')
      .update(updates)
      .eq('id', teamId)
      .eq('user_id', userId) // RLS enforcement
      .select()
      .single();

    if (error) throw new Error(`Failed to update team: ${error.message}`);
    return data;
  }

  async deleteTeam(userId: string, teamId: string): Promise<void> {
    const { error } = await this.supabase
      .from('teams')
      .delete()
      .eq('id', teamId)
      .eq('user_id', userId); // RLS enforcement

    if (error) throw new Error(`Failed to delete team: ${error.message}`);
  }
}

export const teamRepository = new TeamRepository(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);
```

### Authentication and Authorization

#### Auth Flow

```mermaid
sequenceDiagram
    participant User as Coach
    participant PWA as PWA Client
    participant Supabase as Supabase Auth
    participant API as API Functions
    participant DB as Supabase DB

    User->>PWA: Sign Up / Sign In
    PWA->>Supabase: auth.signInWithPassword()
    Supabase-->>PWA: JWT Access Token + Refresh Token
    PWA->>PWA: Store tokens in secure storage

    Note over User,DB: Future Cloud Sync Request

    PWA->>API: API call with Bearer token
    API->>Supabase: Validate JWT token
    Supabase-->>API: User ID + claims

    alt Token Valid
        API->>DB: Query with RLS (user_id filter)
        DB-->>API: User's data only
        API-->>PWA: API response
    else Token Expired
        API-->>PWA: 401 Unauthorized
        PWA->>Supabase: auth.refreshSession()
        Supabase-->>PWA: New JWT tokens
        PWA->>API: Retry with new token
    else Token Invalid
        API-->>PWA: 401 Unauthorized
        PWA->>PWA: Clear tokens, redirect to auth
    end
```

#### Middleware/Guards

```typescript
// JWT validation middleware for API routes
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { AuthValidationResult } from '@/types/auth';

export async function validateJWT(request: NextRequest): Promise<AuthValidationResult> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false, error: 'Missing or invalid authorization header' };
    }

    const token = authHeader.substring(7);

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Verify JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { valid: false, error: 'Invalid or expired token' };
    }

    return {
      valid: true,
      userId: user.id,
      email: user.email,
      user
    };

  } catch (error) {
    console.error('JWT validation error:', error);
    return { valid: false, error: 'Token validation failed' };
  }
}

// Rate limiting middleware
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
  analytics: true,
});

export async function rateLimit(request: NextRequest, identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);

  if (!success) {
    throw new Error(`Rate limit exceeded. Try again in ${Math.round((reset - Date.now()) / 1000)} seconds.`);
  }

  return { limit, reset, remaining };
}
```

## Unified Project Structure

The monorepo structure accommodates both the current offline-first PWA and future serverless backend services, using npm workspaces for lightweight package management.

```plaintext
match-manager/
├── .github/                              # CI/CD workflows
│   └── workflows/
│       ├── ci.yml                        # Test, lint, typecheck on PR
│       ├── deploy-web.yml                # Deploy PWA to Vercel
│       ├── deploy-api.yml                # Deploy serverless functions (future)
│       └── e2e-tests.yml                 # Playwright end-to-end tests
├── apps/                                 # Application packages
│   ├── web/                              # Main PWA application
│   │   ├── src/
│   │   │   ├── app/                      # Next.js App Router
│   │   │   │   ├── layout.tsx            # Root layout with PWA setup
│   │   │   │   ├── page.tsx              # Dashboard/team selection
│   │   │   │   ├── globals.css           # Tailwind + PWA styles
│   │   │   │   ├── manifest.ts           # Web App Manifest config
│   │   │   │   ├── teams/                # Team management routes
│   │   │   │   │   ├── page.tsx          # Team list
│   │   │   │   │   └── [teamId]/
│   │   │   │   │       ├── page.tsx      # Team detail
│   │   │   │   │       ├── players/      # Player management
│   │   │   │   │       └── games/        # Game management
│   │   │   │   │           ├── page.tsx  # Game history
│   │   │   │   │           ├── new/      # Game setup
│   │   │   │   │           └── [gameId]/ # Live game
│   │   │   │   │               ├── page.tsx        # Formation display
│   │   │   │   │               ├── setup/          # Pre-game config
│   │   │   │   │               └── analysis/       # Post-game review
│   │   │   │   ├── offline/              # Offline status page
│   │   │   │   └── install/              # PWA installation guide
│   │   │   ├── components/               # React components
│   │   │   │   ├── game/                 # Game-specific components
│   │   │   │   │   ├── FormationDisplay/ # Field visualization
│   │   │   │   │   ├── SubstitutionAlert/ # Alert system
│   │   │   │   │   ├── PlayingTimeTracker/ # Time tracking
│   │   │   │   │   └── GameTimer/        # Timer component
│   │   │   │   ├── setup/                # Setup wizards
│   │   │   │   │   ├── TeamSetup/
│   │   │   │   │   ├── PlayerSetup/
│   │   │   │   │   └── StrategySetup/
│   │   │   │   ├── shared/               # Layout components
│   │   │   │   │   ├── Layout/
│   │   │   │   │   ├── Navigation/
│   │   │   │   │   └── PWAControls/
│   │   │   │   └── ui/                   # Base UI components
│   │   │   │       ├── Button/
│   │   │   │       ├── Modal/
│   │   │   │       ├── TouchTarget/
│   │   │   │       └── LoadingSpinner/
│   │   │   ├── hooks/                    # Custom React hooks
│   │   │   │   ├── useGameEngine.ts      # Game logic integration
│   │   │   │   ├── useOfflineStatus.ts   # Network detection
│   │   │   │   ├── usePlayingTime.ts     # Time calculations
│   │   │   │   ├── usePersistence.ts     # IndexedDB operations
│   │   │   │   └── usePWA.ts             # PWA capabilities
│   │   │   ├── stores/                   # Context state management
│   │   │   │   ├── GameContext.tsx       # Game state
│   │   │   │   ├── TeamContext.tsx       # Team/player data
│   │   │   │   ├── TimerContext.tsx      # Timer state
│   │   │   │   └── OfflineContext.tsx    # Network/sync status
│   │   │   ├── services/                 # Frontend services
│   │   │   │   ├── api/                  # Future API client
│   │   │   │   ├── persistence/          # IndexedDB access
│   │   │   │   └── validation/           # Data validation
│   │   │   └── utils/                    # Frontend utilities
│   │   │       ├── calculations/         # Playing time math
│   │   │       ├── formatting/           # Display formatting
│   │   │       └── constants/            # App constants
│   │   ├── public/                       # Static assets
│   │   │   ├── icons/                    # PWA icons (various sizes)
│   │   │   │   ├── icon-192x192.png
│   │   │   │   ├── icon-512x512.png
│   │   │   │   └── apple-touch-icon.png
│   │   │   ├── images/                   # App images
│   │   │   │   ├── soccer-field.svg      # Field background
│   │   │   │   └── logo.svg              # App logo
│   │   │   ├── manifest.json             # PWA manifest
│   │   │   ├── sw.js                     # Service worker
│   │   │   └── favicon.ico
│   │   ├── tests/                        # Frontend tests
│   │   │   ├── components/               # Component tests
│   │   │   ├── hooks/                    # Hook tests
│   │   │   ├── services/                 # Service tests
│   │   │   ├── e2e/                      # Playwright E2E tests
│   │   │   │   ├── game-management.spec.ts
│   │   │   │   ├── substitution-flow.spec.ts
│   │   │   │   └── offline-functionality.spec.ts
│   │   │   └── setup/                    # Test configuration
│   │   │       ├── jest.config.js
│   │   │       └── playwright.config.ts
│   │   ├── next.config.js                # Next.js configuration
│   │   ├── tailwind.config.js            # Tailwind CSS config
│   │   ├── tsconfig.json                 # TypeScript config
│   │   └── package.json                  # Dependencies
│   └── api/                              # Future serverless functions
│       ├── src/
│       │   ├── routes/                   # API route handlers
│       │   │   ├── teams/
│       │   │   ├── sync/
│       │   │   └── auth/
│       │   ├── services/                 # Business logic
│       │   │   ├── syncService.ts
│       │   │   ├── teamService.ts
│       │   │   └── conflictResolution.ts
│       │   ├── middleware/               # API middleware
│       │   │   ├── auth.ts
│       │   │   ├── validation.ts
│       │   │   └── rateLimiting.ts
│       │   ├── utils/                    # Backend utilities
│       │   │   ├── supabase.ts
│       │   │   └── validation.ts
│       │   └── types/                    # API types
│       │       ├── api.ts
│       │       └── database.ts
│       ├── tests/                        # Backend tests
│       │   ├── routes/                   # Route tests
│       │   ├── services/                 # Service tests
│       │   └── integration/              # Integration tests
│       ├── vercel.json                   # Vercel deployment config
│       ├── tsconfig.json                 # Backend TypeScript config
│       └── package.json                  # Backend dependencies
├── packages/                             # Shared packages
│   ├── shared/                           # Shared types/utilities
│   │   ├── src/
│   │   │   ├── types/                    # TypeScript interfaces
│   │   │   │   ├── game.ts               # Game-related types
│   │   │   │   ├── team.ts               # Team/player types
│   │   │   │   ├── strategy.ts           # Strategy types
│   │   │   │   └── index.ts              # Type exports
│   │   │   ├── constants/                # Shared constants
│   │   │   │   ├── formations.ts         # Formation definitions
│   │   │   │   ├── positions.ts          # Position constants
│   │   │   │   └── rules.ts              # Game rule constants
│   │   │   ├── utils/                    # Shared utilities
│   │   │   │   ├── dateUtils.ts          # Date/time utilities
│   │   │   │   ├── validation.ts         # Validation helpers
│   │   │   │   └── calculations.ts       # Math utilities
│   │   │   └── schemas/                  # Validation schemas
│   │   │       ├── teamSchema.ts         # Team validation
│   │   │       ├── gameSchema.ts         # Game validation
│   │   │       └── playerSchema.ts       # Player validation
│   │   ├── tests/                        # Shared package tests
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── game-engine/                      # Core game logic
│   │   ├── src/
│   │   │   ├── engines/                  # Game engines
│   │   │   │   ├── FormationEngine.ts    # Formation logic
│   │   │   │   ├── SubstitutionEngine.ts # Substitution algorithms
│   │   │   │   ├── PlayingTimeEngine.ts  # Time calculations
│   │   │   │   └── StrategyEngine.ts     # Strategy implementations
│   │   │   ├── strategies/               # Playing time strategies
│   │   │   │   ├── EqualTimeStrategy.ts  # Equal playing time
│   │   │   │   ├── MinimumTimeStrategy.ts # Minimum time guarantee
│   │   │   │   └── FlexibleStrategy.ts   # Performance-based
│   │   │   ├── validators/               # Business rule validation
│   │   │   │   ├── FormationValidator.ts # Formation rules
│   │   │   │   ├── SubstitutionValidator.ts # Substitution rules
│   │   │   │   └── PositionValidator.ts  # Position eligibility
│   │   │   └── workers/                  # Web Worker implementations
│   │   │       ├── playingTimeWorker.ts  # Background calculations
│   │   │       └── strategyWorker.ts     # Strategy calculations
│   │   ├── tests/                        # Game engine tests
│   │   │   ├── engines/                  # Engine unit tests
│   │   │   ├── strategies/               # Strategy tests
│   │   │   └── integration/              # Integration tests
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── ui/                               # Shared UI components (future)
│   │   ├── src/
│   │   │   ├── components/               # Reusable components
│   │   │   ├── styles/                   # Shared styles
│   │   │   └── tokens/                   # Design tokens
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── config/                           # Shared configuration
│       ├── eslint/                       # ESLint configurations
│       │   ├── base.js                   # Base ESLint config
│       │   ├── react.js                  # React-specific rules
│       │   └── node.js                   # Node.js-specific rules
│       ├── typescript/                   # TypeScript configurations
│       │   ├── base.json                 # Base TS config
│       │   ├── react.json                # React TS config
│       │   └── node.json                 # Node.js TS config
│       └── jest/                         # Jest configurations
│           ├── base.js                   # Base Jest config
│           └── react.js                  # React Jest config
├── infrastructure/                       # IaC definitions (future)
│   ├── vercel/                           # Vercel deployment config
│   │   ├── web.json                      # PWA deployment
│   │   └── api.json                      # API deployment
│   ├── supabase/                         # Supabase configuration
│   │   ├── migrations/                   # Database migrations
│   │   ├── functions/                    # Edge functions
│   │   └── config.toml                   # Supabase config
│   └── monitoring/                       # Monitoring setup
│       ├── vercel-analytics.json
│       └── error-tracking.json
├── scripts/                              # Build/deploy scripts
│   ├── build.sh                          # Production build
│   ├── dev.sh                            # Development setup
│   ├── test.sh                           # Run all tests
│   ├── deploy.sh                         # Deployment script
│   └── db-migrate.sh                     # Database migrations
├── docs/                                 # Documentation
│   ├── prd.md                            # Product requirements
│   ├── architecture.md                   # This document
│   ├── api/                              # API documentation
│   │   ├── sync.md                       # Sync API docs
│   │   └── auth.md                       # Auth API docs
│   ├── development/                      # Development guides
│   │   ├── getting-started.md            # Setup instructions
│   │   ├── testing.md                    # Testing guide
│   │   └── deployment.md                 # Deployment guide
│   └── user/                             # User documentation
│       ├── coach-guide.md                # Coaching workflows
│       └── troubleshooting.md            # Common issues
├── .env.example                          # Environment template
├── .gitignore                            # Git ignore patterns
├── package.json                          # Root package.json with workspaces
├── turbo.json                            # Turbo configuration
├── tsconfig.json                         # Root TypeScript config
├── eslint.config.mjs                     # ESLint configuration
├── tailwind.config.js                    # Tailwind configuration
├── CLAUDE.md                             # AI development guidance
└── README.md                             # Project overview
```

## Development Workflow

The development workflow is optimized for the offline-first PWA with comprehensive local development capabilities and automated quality assurance.

### Local Development Setup

#### Prerequisites

```bash
# Required software and versions
node --version    # >= 18.17.0 (for Next.js 15 support)
npm --version     # >= 9.0.0 (for npm workspaces)
git --version     # >= 2.30.0

# Optional but recommended
brew install git-lfs        # For large assets (macOS)
# or
sudo apt install git-lfs   # For large assets (Ubuntu)

# Verify PWA development capabilities
# Chrome/Edge Canary recommended for latest PWA features
google-chrome --version    # >= 119 (for latest PWA APIs)
```

#### Initial Setup

```bash
# Clone repository and initialize
git clone https://github.com/your-org/match-manager.git
cd match-manager

# Install all dependencies across workspaces
npm install

# Initialize database schema (IndexedDB setup)
npm run db:init

# Generate TypeScript types from schemas
npm run types:generate

# Set up development environment
cp .env.example .env.local
# Edit .env.local with development-specific values

# Initialize git hooks for code quality
npx husky install
npm run prepare

# Build shared packages
npm run build:packages

# Start development servers
npm run dev
```

#### Development Commands

```bash
# Start all services (PWA + future API in watch mode)
npm run dev                    # Turbo parallel dev servers

# Start frontend only (most common during MVP)
npm run dev:web               # Next.js dev server on http://localhost:3000

# Start backend only (future API development)
npm run dev:api               # API functions in development mode

# Run tests
npm run test                  # All tests across workspaces
npm run test:unit            # Unit tests only
npm run test:integration     # Integration tests
npm run test:e2e             # Playwright end-to-end tests
npm run test:watch           # Jest watch mode for active development

# Build commands
npm run build                # Production build all packages
npm run build:web            # Build PWA only
npm run build:packages       # Build shared packages only

# Code quality
npm run lint                 # ESLint across all packages
npm run lint:fix            # Auto-fix linting issues
npm run typecheck           # TypeScript type checking
npm run format              # Prettier formatting

# PWA-specific commands
npm run pwa:test            # PWA audit and validation
npm run pwa:icons           # Generate PWA icons from source
npm run sw:update           # Update service worker version

# Database operations
npm run db:reset            # Reset IndexedDB schema (dev only)
npm run db:seed             # Seed with sample coaching data
npm run db:export           # Export development data
npm run db:import           # Import sample data sets

# Performance and analysis
npm run analyze             # Bundle analysis
npm run lighthouse         # Lighthouse audit
npm run perf:profile       # Performance profiling
```

### Environment Configuration

#### Required Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_DEBUG=true

# PWA Configuration
NEXT_PUBLIC_PWA_NAME="Match Manager"
NEXT_PUBLIC_PWA_SHORT_NAME="MatchMgr"
NEXT_PUBLIC_PWA_DESCRIPTION="Youth Soccer Coaching Assistant"

# Development Features
NEXT_PUBLIC_ENABLE_DEVTOOLS=true
NEXT_PUBLIC_MOCK_DATA=true
NEXT_PUBLIC_PERFORMANCE_LOGGING=true

# Future API Configuration (not used in MVP)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend (.env - future use)
SUPABASE_URL=your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:54322/postgres
DATABASE_POOL_SIZE=10

# Authentication
JWT_SECRET=your-jwt-secret-for-local-dev
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# External Services (future)
REDIS_URL=redis://localhost:6379
SENTRY_DSN=your-sentry-dsn
ANALYTICS_KEY=your-analytics-key

# Shared
NODE_ENV=development
LOG_LEVEL=debug
DEPLOYMENT_ENV=local
```

## Deployment Architecture

### Deployment Strategy

**Frontend Deployment:**
- **Platform:** Vercel Edge Network
- **Build Command:** `npm run build:web`
- **Output Directory:** `apps/web/.next`
- **CDN/Edge:** Global edge deployment with automatic optimization

**Backend Deployment:**
- **Platform:** Vercel Serverless Functions (future)
- **Build Command:** `npm run build:api`
- **Deployment Method:** Automatic deployment on git push

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm install
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test:unit
      - run: npm run test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Environments

| Environment | Frontend URL | Backend URL | Purpose |
|-------------|-------------|-------------|---------|
| Development | http://localhost:3000 | http://localhost:3001 | Local development |
| Staging | https://staging.matchmanager.app | https://api-staging.matchmanager.app | Pre-production testing |
| Production | https://app.matchmanager.app | https://api.matchmanager.app | Live environment |

## Security and Performance

### Security Requirements

**Frontend Security:**
- CSP Headers: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'`
- XSS Prevention: Input sanitization and React's built-in XSS protection
- Secure Storage: Sensitive data encrypted in IndexedDB using Web Crypto API

**Backend Security:**
- Input Validation: Zod schema validation on all API endpoints
- Rate Limiting: 100 requests/minute per user via Upstash Redis
- CORS Policy: Restricted to known origins only

**Authentication Security:**
- Token Storage: JWT stored in httpOnly cookies (future)
- Session Management: Supabase Auth with automatic token refresh
- Password Policy: Minimum 8 characters, mixed case, numbers (future)

### Performance Optimization

**Frontend Performance:**
- Bundle Size Target: < 500KB initial load
- Loading Strategy: Progressive loading with code splitting
- Caching Strategy: Service Worker caching with stale-while-revalidate

**Backend Performance:**
- Response Time Target: < 200ms for sync operations
- Database Optimization: Indexed queries and connection pooling
- Caching Strategy: Redis caching for frequently accessed data (future)

## Testing Strategy

### Testing Pyramid

```
        E2E Tests (Playwright)
       /                    \
   Integration Tests (Jest)
  /                        \
Frontend Unit Tests    Backend Unit Tests
     (Jest + RTL)         (Jest + Supertest)
```

### Test Organization

**Frontend Tests:**
```
apps/web/tests/
├── components/        # Component unit tests
├── hooks/            # Custom hook tests
├── services/         # Service integration tests
└── e2e/             # End-to-end workflows
```

**Backend Tests:**
```
apps/api/tests/
├── routes/          # API endpoint tests
├── services/        # Business logic tests
└── integration/     # Database integration tests
```

**E2E Tests:**
```
apps/web/tests/e2e/
├── game-management.spec.ts     # Formation and substitutions
├── offline-functionality.spec.ts  # PWA offline capabilities
└── playing-time-tracking.spec.ts  # Strategy algorithms
```

### Test Examples

#### Frontend Component Test

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { FormationDisplay } from '@/components/game/FormationDisplay';
import { mockFormation, mockPlayers } from '../__mocks__/gameData';

describe('FormationDisplay', () => {
  it('renders formation with player positions', () => {
    render(
      <FormationDisplay
        gameId="test-game"
        formation={mockFormation}
        players={mockPlayers}
        onPlayerMove={jest.fn()}
      />
    );

    expect(screen.getByLabelText('Soccer formation management')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(mockFormation.positions.length);
  });
});
```

#### Backend API Test

```typescript
import request from 'supertest';
import { app } from '../src/app';
import { mockTeamData } from './__mocks__/teamData';

describe('POST /api/teams', () => {
  it('creates new team with valid data', async () => {
    const response = await request(app)
      .post('/api/teams')
      .set('Authorization', 'Bearer valid-jwt-token')
      .send(mockTeamData)
      .expect(201);

    expect(response.body.name).toBe(mockTeamData.name);
    expect(response.body.id).toBeDefined();
  });
});
```

#### E2E Test

```typescript
import { test, expect } from '@playwright/test';

test('complete substitution workflow', async ({ page }) => {
  await page.goto('/teams/test-team/games/test-game');

  // Wait for formation to load
  await expect(page.locator('[data-testid="formation-display"]')).toBeVisible();

  // Trigger substitution alert
  await page.locator('[data-testid="timer-start"]').click();
  await page.waitForTimeout(6000); // Wait for 6-minute alert

  // Handle substitution
  await expect(page.locator('[data-testid="substitution-alert"]')).toBeVisible();
  await page.locator('[data-testid="confirm-substitution"]').click();

  // Verify formation updated
  await expect(page.locator('[data-testid="player-coming-off"]')).toHaveClass(/red/);
  await expect(page.locator('[data-testid="player-going-on"]')).toHaveClass(/green/);
});
```

## Coding Standards

### Critical Fullstack Rules

- **Type Sharing:** Always define types in packages/shared and import from there
- **API Calls:** Never make direct HTTP calls - use the service layer
- **Environment Variables:** Access only through config objects, never process.env directly
- **Error Handling:** All API routes must use the standard error handler
- **State Updates:** Never mutate state directly - use proper state management patterns
- **PWA Offline:** All features must work offline-first with cloud sync as enhancement
- **IndexedDB Access:** Use repository pattern, never direct IndexedDB calls
- **Touch Optimization:** All interactive elements must have minimum 44px touch targets

### Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `FormationDisplay.tsx` |
| Hooks | camelCase with 'use' | - | `useGameEngine.ts` |
| API Routes | - | kebab-case | `/api/sync-data` |
| Database Tables | - | snake_case | `playing_time_records` |

## Error Handling Strategy

### Error Flow

```mermaid
sequenceDiagram
    participant UI as Frontend UI
    participant Service as Service Layer
    participant DB as IndexedDB
    participant API as Future API

    UI->>Service: User Action
    Service->>DB: Data Operation

    alt Database Error
        DB-->>Service: Error Response
        Service->>Service: Log Error Locally
        Service-->>UI: User-Friendly Error
        UI->>UI: Show Error Toast
    else Success
        DB-->>Service: Success Response
        Service-->>UI: Success Response
        UI->>UI: Update Interface
    end

    Note over Service,API: Future cloud sync errors never block UI
```

### Error Response Format

```typescript
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
}
```

### Frontend Error Handling

```typescript
const handleFormationError = (error: Error) => {
  console.error('Formation error:', error);

  // Show user-friendly message
  toast.error('Unable to update formation. Please try again.');

  // Log for debugging
  errorLogger.log('formation_update_failed', {
    error: error.message,
    stack: error.stack,
    gameId: currentGame.id,
    timestamp: new Date().toISOString()
  });
};
```

### Backend Error Handling

```typescript
export function handleAPIError(error: unknown): NextResponse {
  const requestId = crypto.randomUUID();

  console.error(`API Error [${requestId}]:`, error);

  if (error instanceof ValidationError) {
    return NextResponse.json({
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
        requestId
      }
    }, { status: 400 });
  }

  // Generic error response
  return NextResponse.json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      requestId
    }
  }, { status: 500 });
}
```

## Monitoring and Observability

### Monitoring Stack

- **Frontend Monitoring:** Vercel Analytics for Core Web Vitals
- **Backend Monitoring:** Vercel Functions monitoring (future)
- **Error Tracking:** Console logging with structured error format
- **Performance Monitoring:** Lighthouse CI integration

### Key Metrics

**Frontend Metrics:**
- Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- PWA installation rate
- Offline usage patterns
- Touch interaction success rate

**Backend Metrics:**
- API response times
- Error rates by endpoint
- Database query performance
- Sync success/failure rates

## Checklist Results Report

**Architecture Document Status: COMPLETE ✅**

This comprehensive Match Manager Full-Stack Architecture Document successfully addresses all requirements for an offline-first PWA coaching application. The architecture delivers:

**✅ Core Requirements Met:**
- Offline-first PWA operation with IndexedDB persistence
- Real-time formation management and substitution alerts
- Touch-optimized interface for outdoor coaching conditions
- Comprehensive playing time tracking and strategy automation
- Future-ready cloud sync architecture without current dependencies

**✅ Technical Excellence:**
- Type-safe development with shared TypeScript interfaces
- Comprehensive testing strategy across all layers
- Performance-optimized for 90-minute coaching sessions
- Security-conscious design with data privacy protection
- Scalable monorepo structure with clear separation of concerns

**✅ Development Readiness:**
- Complete development workflow and environment setup
- Detailed coding standards and error handling strategies
- Automated CI/CD pipeline with quality gates
- Comprehensive documentation and deployment procedures

**Ready for Immediate Implementation** 🚀

The architecture provides clear technical specifications for all epic requirements while maintaining the cognitive load reduction value proposition central to the Match Manager vision.