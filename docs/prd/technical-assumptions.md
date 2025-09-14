# Technical Assumptions

## Repository Structure: Monorepo

**Decision:** Single repository containing all Match Manager components (PWA frontend, future API services, shared utilities, and deployment configurations).

**Rationale:** Your existing Next.js 15 setup already establishes monorepo foundation. For MVP scope focusing on client-side functionality, monorepo provides simplicity while accommodating future backend services without major restructuring.

## Service Architecture

**Primary Architecture:** Client-first monolith with all game management logic running locally in the browser

**Future Evolution Path:** Serverless functions for cloud sync and organization-level features in Phase 2, maintaining client-side autonomy as core principle

**Key Technical Decision:** All critical functionality (formation management, substitution alerts, playing time tracking) operates independently of backend services. API layer designed as enhancement rather than dependency.

## Testing Requirements

**MVP Testing Strategy:** Unit testing for core game logic components (playing time calculations, substitution algorithms, formation management) with manual testing convenience methods for UI workflows

**Testing Priorities:** Focus on offline functionality validation, state persistence testing, and touch interaction reliability. Automated tests for mathematical accuracy of playing time distribution algorithms.

**Phase 2 Expansion:** Integration testing for cloud sync, end-to-end testing for complete user journeys, and performance testing under field conditions.

## Additional Technical Assumptions and Requests

**Frontend Framework:** Next.js 15 with App Router (already established), React 19, TypeScript for type safety, Tailwind CSS v4 for responsive design optimized for mobile-first PWA

**State Management:** Client-side state management solution optimized for offline-first operation, likely Context API with useReducer for complex game state, with persistence layer using IndexedDB

**PWA Requirements:** Service worker for offline functionality, Web App Manifest for installation, background sync capabilities for eventual cloud features, push notifications for substitution alerts

**Performance Constraints:** Bundle size optimization for mobile networks, lazy loading for non-critical features, efficient re-rendering strategies for real-time updates during games

**Browser Storage:** IndexedDB as primary storage for game data, settings, and team configurations. LocalStorage for user preferences and lightweight session data

**Deployment Architecture:** Static site generation with edge CDN distribution, serverless functions for future API endpoints, global edge optimization to minimize latency

**Development Tools:** ESLint with Next.js TypeScript config (already configured), Turbo for build optimization, TypeScript strict mode with path mapping

**Security Considerations:** Client-side data encryption for sensitive player information, COPPA compliance planning for youth data handling, secure authentication patterns for future cloud sync
