# Coding Standards

## Critical Fullstack Rules

- **Type Sharing:** Always define types in packages/shared and import from there
- **API Calls:** Never make direct HTTP calls - use the service layer
- **Environment Variables:** Access only through config objects, never process.env directly
- **Error Handling:** All API routes must use the standard error handler
- **State Updates:** Never mutate state directly - use proper state management patterns
- **PWA Offline:** All features must work offline-first with cloud sync as enhancement
- **IndexedDB Access:** Use repository pattern, never direct IndexedDB calls
- **Touch Optimization:** All interactive elements must have minimum 44px touch targets

## Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `FormationDisplay.tsx` |
| Hooks | camelCase with 'use' | - | `useGameEngine.ts` |
| API Routes | - | kebab-case | `/api/sync-data` |
| Database Tables | - | snake_case | `playing_time_records` |
