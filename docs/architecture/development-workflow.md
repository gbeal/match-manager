# Development Workflow

The development workflow is optimized for the offline-first PWA with comprehensive local development capabilities and automated quality assurance.

## Local Development Setup

### Prerequisites

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

### Initial Setup

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

### Development Commands

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

## Environment Configuration

### Required Environment Variables

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
