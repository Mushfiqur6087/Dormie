// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockPrefetch = jest.fn()
const mockBack = jest.fn()
const mockForward = jest.fn()
const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: mockPrefetch,
    back: mockBack,
    forward: mockForward,
    refresh: mockRefresh,
  })),
  usePathname: jest.fn(() => ''),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}))

// Enhanced localStorage mock with proper state management
const localStorageMock = (() => {
  let store = {}
  
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString()
    }),
    removeItem: jest.fn((key) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
    get store() {
      return store
    },
    set store(newStore) {
      store = newStore
    }
  }
})()

// Ensure localStorage is properly mocked globally
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Make localStorage available globally for tests
global.localStorageMock = localStorageMock

// Mock fetch globally
global.fetch = jest.fn()

// Mock btoa/atob for JWT token handling
global.btoa = global.btoa || ((str) => Buffer.from(str, 'binary').toString('base64'))
global.atob = global.atob || ((b64) => Buffer.from(b64, 'base64').toString('binary'))

// Reset mocks before each test
beforeEach(() => {
  // Reset router mocks
  mockPush.mockClear()
  mockReplace.mockClear()
  mockPrefetch.mockClear()
  mockBack.mockClear()
  mockForward.mockClear()
  mockRefresh.mockClear()
  
  // Reset localStorage mocks
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
  localStorageMock.store = {}
  
  // Reset fetch mock
  global.fetch.mockClear()
})

// Global cleanup after each test
afterEach(() => {
  // Clean up any remaining timers
  jest.clearAllTimers()
  jest.clearAllMocks()
})
