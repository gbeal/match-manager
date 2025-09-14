# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application called "match-manager" built with React 19, TypeScript, and Tailwind CSS v4. The project uses Turbo for faster builds and development.

## Development Commands

- `npm run dev` - Start development server with Turbo
- `npm run build` - Build production app with Turbo  
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Architecture

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4 with PostCSS
- **Fonts**: Geist and Geist Mono from Google Fonts
- **TypeScript**: Strict mode enabled with path mapping (`@/*` → `./src/*`)
- **Linting**: ESLint with Next.js TypeScript config

## Project Structure

- `src/app/` - Next.js App Router pages and layouts
  - `layout.tsx` - Root layout with font configuration
  - `page.tsx` - Homepage component
  - `globals.css` - Global styles including Tailwind directives
- `public/` - Static assets (SVG icons, favicon)
- `tsconfig.json` - TypeScript configuration with strict settings
- `eslint.config.mjs` - ESLint flat config with Next.js rules
- `next.config.ts` - Next.js configuration
- `postcss.config.mjs` - PostCSS configuration for Tailwind

## BMad Development Workflow

This project uses the BMad Method with integrated Test Architect (Quinn) for quality assurance. The workflow includes story creation, implementation, and comprehensive testing at multiple stages. See `.bmad-core/enhanced-ide-development-workflow.md` for detailed workflow guidance.

## Key Development Notes

- Uses Next.js App Router (not Pages Router)
- Tailwind CSS v4 with modern configuration
- Turbo mode enabled for faster development and builds
- TypeScript path mapping configured for clean imports
- ESLint configured with Next.js and TypeScript best practices