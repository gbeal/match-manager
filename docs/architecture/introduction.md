# Introduction

This document outlines the complete fullstack architecture for **Match Manager**, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

This unified approach combines what would traditionally be separate backend and frontend architecture documents, streamlining the development process for modern fullstack applications where these concerns are increasingly intertwined.

## Starter Template or Existing Project

Based on the PRD analysis, this project is built on **Next.js 15 with App Router**, React 19, TypeScript, and Tailwind CSS v4 with Turbo for builds. The existing foundation provides:

**Pre-configured Architecture Decisions:**
- Next.js 15 App Router (established)
- React 19 for UI components
- TypeScript with strict mode and path mapping (`@/*` → `./src/*`)
- Tailwind CSS v4 for styling
- Turbo for build optimization
- ESLint with Next.js TypeScript configuration

**Architectural Constraints:**
- Must maintain offline-first PWA requirements
- Client-side state management for game logic
- Mobile-first responsive design
- IndexedDB for local data persistence

**What Can Be Modified:** Infrastructure choices, backend services (future), deployment platform, additional tooling
**What Must Be Retained:** Next.js foundation, TypeScript setup, mobile-first approach, offline-first operation

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-09-14 | 1.0 | Initial architecture document creation from Match Manager PRD | Winston (Architect) |
