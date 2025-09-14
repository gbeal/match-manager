/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require('next/jest')

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const config = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.js'],

  testEnvironment: 'jsdom',

  // Test paths
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/tests/e2e/'],
  testMatch: [
    '<rootDir>/tests/components/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/tests/hooks/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/tests/components/**/*.spec.{js,jsx,ts,tsx}',
    '<rootDir>/tests/hooks/**/*.spec.{js,jsx,ts,tsx}'
  ],

  // Module name mapping for absolute imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Coverage settings
  collectCoverageFrom: [
    'src/**/*.{js,ts,jsx,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx', // Skip layout file
  ],

  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // PWA-specific test environment setup
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(config)