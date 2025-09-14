# Core Workflows

The following sequence diagrams illustrate key system workflows that demonstrate component interactions and clarify critical architecture decisions for the Match Manager PWA.

## Game Setup and Initialization Workflow

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

## Real-Time Substitution Alert and Execution Workflow

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

## Playing Time Balance Monitoring Workflow

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

## Offline-First Data Persistence Workflow

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

## Emergency Substitution and Error Handling Workflow

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
