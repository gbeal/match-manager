# Unified Project Structure

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
