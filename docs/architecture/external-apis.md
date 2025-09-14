# External APIs

Based on the PRD requirements and component design, Match Manager's MVP operates entirely offline without external API dependencies. However, future Phase 2 enhancements will integrate specific external services for cloud sync and enhanced functionality.

## Current MVP Status: No External APIs Required

The Match Manager MVP is specifically designed to operate **completely independently** of external services to meet the core offline-first requirement. All game management functionality (formation display, substitution alerts, playing time tracking) operates using local browser capabilities only.

## Future External API Integrations (Phase 2)

## Supabase Authentication API

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

## Supabase Database API

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

## Browser Geolocation API

- **Purpose:** Automatic field location detection for game metadata and future weather integration
- **Documentation:** https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
- **Base URL(s):** Browser native API
- **Authentication:** User permission prompt
- **Rate Limits:** Browser-imposed (typically once per session)

**Key Endpoints Used:**
- `getCurrentPosition()` - One-time location for game setup
- `watchPosition()` - Monitor location changes during travel between fields

**Integration Notes:** Location data used only for game metadata (venue identification). All location features optional with manual venue entry fallback. Privacy-focused implementation with minimal data retention.

## Web Push Notifications API (Future)

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
