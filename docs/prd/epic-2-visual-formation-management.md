# Epic 2: Visual Formation Management

**Epic Goal:** Implement the core formation display with real-time player positioning and color-coded substitution status, delivering the primary visual interface that reduces cognitive load through spatial recognition and enables quick substitution decision-making during games.

## Story 2.1: Formation Field Display

As a volunteer coach,
I want to see a visual representation of the soccer field with player positions matching my selected formation,
so that I can quickly understand the current tactical setup at a glance.

### Acceptance Criteria

1. Soccer field visualization with proper proportions and field markings (penalty areas, center circle, sidelines)
2. Player positions displayed as interactive elements positioned according to selected formation
3. Field display optimized for mobile portrait orientation with touch-friendly sizing
4. Formation positions accurately reflect tactical arrangement (4-4-2, 4-3-3, etc.)
5. Visual distinction between goalkeeper and field player positions
6. Responsive design maintains field proportions across different screen sizes
7. Field display integrates with team configuration data from Epic 1

## Story 2.2: Player Assignment to Formation Positions

As a volunteer coach,
I want to assign specific players to formation positions on the field display,
so that I can visualize my starting lineup and current tactical arrangement.

### Acceptance Criteria

1. Drag-and-drop or tap-to-assign interface for placing players in formation positions
2. Player names and jersey numbers displayed within position markers on field
3. Position assignment validates against player position eligibility from Epic 1
4. Visual feedback when attempting invalid position assignments
5. Unassigned players displayed in a sideline bench area
6. Quick swap functionality between positioned players
7. Assignment state persists within game session data

## Story 2.3: Substitution Status Color Coding

As a volunteer coach,
I want to see color-coded indicators showing which players are coming on (green) and coming off (red) the field,
so that I can quickly identify substitution status during game pressure.

### Acceptance Criteria

1. Red color coding for players marked as coming off the field
2. Green color coding for players marked as going on the field
3. Neutral/default color for players with no pending substitution status
4. Color coding applies to both positioned players and bench players
5. High contrast colors optimized for outdoor sunlight readability
6. Alternative visual patterns for color-blind accessibility (shapes, borders, icons)
7. Color status updates in real-time based on substitution planning

## Story 2.4: Touch-Optimized Field Interactions

As a volunteer coach,
I want to interact with the field display using simple touch gestures optimized for outdoor conditions,
so that I can manage formations effectively while wearing gloves or in challenging weather.

### Acceptance Criteria

1. Touch targets minimum 44px for reliable finger and glove operation
2. Long-press actions for detailed player information and options
3. Swipe gestures for quick actions (swipe player to bench, swipe bench player to position)
4. Visual feedback for all touch interactions (highlight, animation, confirmation)
5. Prevent accidental touches during scrolling or device movement
6. Optimized for single-handed operation within thumb reach zones
7. Touch interactions work reliably in cold weather with winter gloves

## Story 2.5: Real-Time Formation Updates

As a volunteer coach,
I want the formation display to update immediately when I make tactical changes,
so that the visual representation always reflects my current game plan.

### Acceptance Criteria

1. Formation display updates instantly when players are moved or substituted
2. Position changes reflect immediately in formation visualization
3. Substitution status changes update color coding in real-time
4. Formation switching updates all position assignments dynamically
5. Changes persist automatically to local storage without manual save
6. Formation state remains consistent across app interruptions or restarts
7. Visual transitions smooth and responsive for professional coaching appearance
