# Tech Stack

## Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.6+ | Type-safe development | Essential for complex game state management and PWA reliability |
| Frontend Framework | Next.js | 15.x | PWA foundation & SSG | Already established, excellent PWA support, edge deployment optimization |
| UI Component Library | React | 19.x | Component architecture | Latest stable, improved concurrent features for real-time updates |
| State Management | React Context + useReducer | Built-in | Game state management | Sufficient for client-side complexity, avoids external dependencies |
| Backend Language | TypeScript | 5.6+ | Future API consistency | Type sharing between frontend and future backend services |
| Backend Framework | Next.js API Routes | 15.x | Serverless functions | Seamless integration with frontend, Vercel optimization |
| API Style | REST | - | Future cloud sync | Simple, reliable, widely supported for future mobile app integration |
| Database | IndexedDB | Browser native | Primary offline storage | Required for complex offline relational data and PWA requirements |
| Cache | Service Worker Cache API | Browser native | Asset caching | PWA standard for offline reliability |
| File Storage | Browser File API | Browser native | Future export features | Local file generation for playing time reports |
| Authentication | Supabase Auth | 2.x | Future user management | When cloud sync is added, integrates with Supabase ecosystem |
| Frontend Testing | Jest + React Testing Library | Latest | Component testing | Industry standard for React component testing |
| Backend Testing | Jest + Supertest | Latest | API endpoint testing | Consistent testing approach across fullstack |
| E2E Testing | Playwright | Latest | PWA testing | Excellent PWA support, mobile testing capabilities |
| Build Tool | npm workspaces | Built-in | Monorepo management | Lightweight, no additional tooling complexity |
| Bundler | Next.js built-in (Turbo) | 15.x | Optimized builds | Already configured, excellent performance |
| IaC Tool | Vercel CLI | Latest | Deployment automation | Integrated with platform choice |
| CI/CD | GitHub Actions | - | Automated deployment | Free, integrates with Vercel, supports PWA testing |
| Monitoring | Vercel Analytics | Built-in | Performance tracking | Integrated solution for web vitals and user analytics |
| Logging | Console + Vercel Logs | Built-in | Error tracking | Start simple, upgrade to Sentry if needed |
| CSS Framework | Tailwind CSS | 4.x | Responsive styling | Already established, excellent mobile-first utilities |
