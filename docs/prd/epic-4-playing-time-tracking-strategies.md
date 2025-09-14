# Epic 4: Playing Time Tracking & Strategies

**Epic Goal:** Create comprehensive playing time calculation, multiple strategy support, and real-time balance monitoring with game clock integration that delivers automated playing time equity and completes the cognitive load reduction value proposition.

## Story 4.1: Playing Time Balance Dashboard

As a volunteer coach,
I want to see real-time playing time balance across all players with visual indicators,
so that I can quickly assess fairness and identify players needing more or less playing time.

### Acceptance Criteria

1. Dashboard showing total playing time per player with visual progress bars or meters
2. Playing time variance indicators highlighting players above or below target time
3. Color-coded balance status (green for balanced, yellow for minor variance, red for significant imbalance)
4. Target playing time calculations based on selected strategy (equal time, minimum time, flexible)
5. Dashboard updates in real-time as game progresses and substitutions occur
6. Quick-access dashboard overlay available from formation display screen
7. Playing time data displays in minutes and seconds for precision tracking

## Story 4.2: Equal Playing Time Strategy Implementation

As a volunteer coach,
I want an equal playing time strategy that automatically balances minutes across all players,
so that I can ensure fairness without manual calculation during games.

### Acceptance Criteria

1. Automatic calculation of target playing time per player based on game duration and roster size
2. Real-time tracking of variance from equal time target for each player
3. Substitution recommendations prioritizing players with lowest current playing time
4. Playing time rebalancing suggestions when new players arrive late or others leave early
5. Tolerance settings for acceptable variance (e.g., within 3 minutes considered equal)
6. Visual alerts when playing time imbalances exceed tolerance thresholds
7. End-of-game summary showing final playing time distribution and variance statistics

## Story 4.3: Minimum Playing Time Strategy Implementation

As a volunteer coach,
I want a minimum playing time strategy that ensures every player gets baseline minutes while allowing flexibility above that threshold,
so that I can guarantee participation while maintaining tactical flexibility.

### Acceptance Criteria

1. Configurable minimum playing time per player (e.g., 15 minutes minimum in 90-minute game)
2. Priority tracking ensuring minimum time players get substitution opportunities first
3. Flexible allocation of remaining time based on performance, position needs, or coach preference
4. Visual indicators showing which players have/haven't reached minimum time requirements
5. Automatic alerts when minimum time requirements are at risk due to remaining game time
6. Strategy supports different minimum times for different player roles (starters vs. bench players)
7. Minimum time validation during pre-game setup to ensure mathematical feasibility

## Story 4.4: Advanced Playing Time Analytics

As a volunteer coach,
I want detailed playing time analytics and projections,
so that I can make informed decisions about future substitutions and strategy adjustments.

### Acceptance Criteria

1. Playing time projections showing expected final minutes if current patterns continue
2. "What-if" scenarios for different substitution timing options
3. Playing time history tracking across multiple games for season-long fairness
4. Position-specific playing time analysis (minutes at goalkeeper vs. field positions)
5. Substitution efficiency metrics showing how well strategy objectives are being met
6. Export capability for playing time data to share with parents or league officials
7. Analytics dashboard accessible during game for real-time strategy adjustments

## Story 4.5: Strategy Integration with Formation Management

As a volunteer coach,
I want playing time strategies to integrate seamlessly with formation and position management,
so that substitution recommendations respect tactical requirements while achieving time balance.

### Acceptance Criteria

1. Substitution recommendations respect position eligibility constraints from Epic 1
2. Playing time calculations account for different position requirements (goalkeeper rotation vs. field player rotation)
3. Formation changes trigger playing time recalculation for affected positions
4. Strategy algorithms consider tactical impact of suggested substitutions
5. Integration with substitution alert system from Epic 3 for comprehensive game management
6. Emergency substitution handling that maintains strategy goals when possible
7. Strategy flexibility settings allowing tactical overrides when game situation demands
