import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock PWA APIs
global.navigator = {
  ...global.navigator,
  onLine: true,
  standalone: false,
  serviceWorker: {
    register: jest.fn().mockResolvedValue({}),
    getRegistration: jest.fn().mockResolvedValue({}),
  },
}

// Mock window.matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock BeforeInstallPromptEvent for PWA install testing
global.BeforeInstallPromptEvent = class BeforeInstallPromptEvent extends Event {
  constructor(type, eventInitDict) {
    super(type, eventInitDict)
    this.platforms = ['web']
    this.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' })
  }

  prompt() {
    return Promise.resolve()
  }
}

// Setup for PWA event testing
global.window.addEventListener = jest.fn()
global.window.removeEventListener = jest.fn()