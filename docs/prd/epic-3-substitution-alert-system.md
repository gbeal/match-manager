# Epic 3: Substitution Alert System

**Epic Goal:** Build configurable alert system with timing logic, advance warnings, and manual confirmation workflows that proactively supports coaches with substitution timing while preserving their decision-making autonomy during games.

## Story 3.1: Basic Game Timer and Period Management

As a volunteer coach,
I want an independent game clock that tracks elapsed time and game periods,
so that I have timing context for all substitution and playing time decisions.

### Acceptance Criteria

1. Independent game timer with start, stop, reset functionality separate from system clock
2. Period management for first half, halftime, and second half tracking
3. Timer persists across app interruptions and device sleep/wake cycles
4. Timer display always visible during game management with large, readable numbers
5. Manual time adjustment capabilities for referee time management differences
6. Timer state saves to local storage and resumes accurately after app restart
7. Visual indicators for current game period (1st half, halftime, 2nd half, overtime)

## Story 3.2: Playing Time Calculation Engine

As a volunteer coach,
I want the system to automatically calculate how many minutes each player has played,
so that I can make informed substitution decisions without manual time tracking.

### Acceptance Criteria

1. Real-time calculation of playing time for each player based on field assignments
2. Playing time tracking starts when game timer starts and player is on field
3. Automatic time accumulation pause when players are substituted off field
4. Playing time data persists and remains accurate across game interruptions
5. Manual time adjustment capabilities for referee stoppage time or errors
6. Historical playing time display showing total minutes played per player
7. Playing time calculations integrate with game timer and formation position tracking

## Story 3.3: Substitution Strategy Configuration

As a volunteer coach,
I want to configure my substitution strategy and timing preferences,
so that the system can provide personalized recommendations based on my coaching philosophy.

### Acceptance Criteria

1. Strategy selection: Equal Playing Time, Minimum Minutes per Player, Flexible/Performance-Based
2. Configurable shift length settings (6, 8, 10, 12, or custom minute intervals)
3. Advance warning timing configuration (2, 4, 6 minutes before substitution recommended)
4. Position-specific substitution rules (goalkeeper vs. field player handling)
5. Strategy settings persist with team configuration for reuse across games
6. Strategy preview showing expected playing time distribution before game start
7. Mid-game strategy adjustment capability for changing circumstances

## Story 3.4: Intelligent Substitution Alerts

As a volunteer coach,
I want to receive proactive alerts when substitution opportunities align with my strategy,
so that I can prepare substitutions in advance rather than making reactive decisions.

### Acceptance Criteria

1. Alert notifications based on configured advance warning timing (e.g., 6 minutes before 8-minute shift ends)
2. Alert content includes specific players coming off, recommended replacements, and timing context
3. Alerts respect position eligibility constraints and formation requirements
4. Visual and optional vibration alerts optimized for sideline coaching environment
5. Alert history tracking to prevent duplicate notifications for same substitution window
6. Smart alert suppression during critical game moments (opposing team attacks, set pieces)
7. Alert dismissal and snooze capabilities for coach timing flexibility

## Story 3.5: Manual Substitution Confirmation Workflow

As a volunteer coach,
I want a simple confirmation process for executing planned substitutions,
so that I maintain control over final decisions while benefiting from system recommendations.

### Acceptance Criteria

1. Two-step confirmation workflow: Alert acknowledgment followed by execution confirmation
2. Substitution preview showing players coming off (red) and going on (green) with position assignments
3. Manual override capability to modify system recommendations before execution
4. Batch substitution support for multiple simultaneous player changes
5. Substitution execution updates formation display, playing time tracking, and game state immediately
6. Substitution history log with timestamps for post-game review
7. Emergency substitution capability bypassing normal workflow for injuries or disciplinary actions
