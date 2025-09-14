# Testing Strategy

## Testing Pyramid

```
        E2E Tests (Playwright)
       /                    \
   Integration Tests (Jest)
  /                        \
Frontend Unit Tests    Backend Unit Tests
     (Jest + RTL)         (Jest + Supertest)
```

## Test Organization

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

## Test Examples

### Frontend Component Test

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

### Backend API Test

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

### E2E Test

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
