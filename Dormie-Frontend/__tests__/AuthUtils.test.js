import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock authentication utilities
const AUTH_TOKEN_KEY = 'jwtToken'
const USER_DATA_KEYS = {
  userName: 'userName',
  userId: 'userId',
  userEmail: 'userEmail',
  userRoles: 'userRoles',
}

// Authentication utilities that use the global localStorage mock
const authUtils = {
  setAuthData: (data) => {
    localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken)
    localStorage.setItem(USER_DATA_KEYS.userName, data.username)
    localStorage.setItem(USER_DATA_KEYS.userId, data.id)
    localStorage.setItem(USER_DATA_KEYS.userEmail, data.email)
    localStorage.setItem(USER_DATA_KEYS.userRoles, JSON.stringify(data.roles))
  },

  getAuthToken: () => {
    return localStorage.getItem(AUTH_TOKEN_KEY)
  },

  getUserData: () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (!token) return null

    return {
      token,
      userName: localStorage.getItem(USER_DATA_KEYS.userName),
      userId: localStorage.getItem(USER_DATA_KEYS.userId),
      userEmail: localStorage.getItem(USER_DATA_KEYS.userEmail),
      userRoles: JSON.parse(localStorage.getItem(USER_DATA_KEYS.userRoles) || '[]'),
    }
  },

  clearAuthData: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(USER_DATA_KEYS.userName)
    localStorage.removeItem(USER_DATA_KEYS.userId)
    localStorage.removeItem(USER_DATA_KEYS.userEmail)
    localStorage.removeItem(USER_DATA_KEYS.userRoles)
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(AUTH_TOKEN_KEY)
  },

  hasRole: (role) => {
    const userData = authUtils.getUserData()
    return userData?.userRoles?.includes(role) || false
  },

  hasAnyRole: (roles) => {
    const userData = authUtils.getUserData()
    return roles.some(role => userData?.userRoles?.includes(role))
  },

  isTokenExpired: (token) => {
    if (!token) return true
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch {
      return true
    }
  },

  redirectBasedOnRole: (router) => {
    const userData = authUtils.getUserData()
    if (!userData || !userData.userRoles) {
      router.push('/login')
      return
    }

    const roles = userData.userRoles
    if (roles.includes('ROLE_ADMIN')) {
      router.push('/admincorner')
    } else if (roles.includes('ROLE_HALL_MANAGER')) {
      router.push('/authority/hallmanagercorner')
    } else if (roles.includes('ROLE_PROVOST')) {
      router.push('/authoritycorner/provost')
    } else if (roles.includes('ROLE_SUPERVISOR')) {
      router.push('/authority/supervisorcorner')
    } else if (roles.includes('ROLE_STUDENT')) {
      router.push('/studentscorner')
    } else {
      router.push('/unknownrole')
    }
  },
}

// JWT token utilities
const jwtUtils = {
  decode: (token) => {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) throw new Error('Invalid token format')
      
      const payload = JSON.parse(atob(parts[1]))
      return payload
    } catch {
      return null
    }
  },

  isValid: (token) => {
    const decoded = jwtUtils.decode(token)
    if (!decoded) return false
    
    const currentTime = Date.now() / 1000
    return decoded.exp > currentTime
  },

  getExpirationTime: (token) => {
    const decoded = jwtUtils.decode(token)
    return decoded?.exp ? new Date(decoded.exp * 1000) : null
  },

  getRemainingTime: (token) => {
    const expirationTime = jwtUtils.getExpirationTime(token)
    if (!expirationTime) return 0
    
    return Math.max(0, expirationTime.getTime() - Date.now())
  },
}

describe('Authentication Utilities', () => {
  beforeEach(() => {
    // Clear localStorage and reset mocks
    localStorage.clear()
    jest.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('sets and retrieves authentication data', () => {
    const authData = {
      accessToken: 'test-token',
      username: 'testuser',
      id: '123',
      email: 'test@example.com',
      roles: ['ROLE_STUDENT'],
    }

    authUtils.setAuthData(authData)

    // Check that localStorage was called correctly
    expect(localStorage.setItem).toHaveBeenCalledWith('jwtToken', 'test-token')
    expect(localStorage.setItem).toHaveBeenCalledWith('userName', 'testuser')
    expect(localStorage.setItem).toHaveBeenCalledWith('userRoles', JSON.stringify(['ROLE_STUDENT']))

    // Check that data can be retrieved
    const userData = authUtils.getUserData()
    expect(userData.token).toBe('test-token')
    expect(userData.userName).toBe('testuser')
    expect(userData.userRoles).toEqual(['ROLE_STUDENT'])
  })

  test('clears authentication data', () => {
    authUtils.setAuthData({
      accessToken: 'test-token',
      username: 'testuser',
      id: '123',
      email: 'test@example.com',
      roles: ['ROLE_STUDENT'],
    })

    authUtils.clearAuthData()

    // Check that localStorage removeItem was called
    expect(localStorage.removeItem).toHaveBeenCalledWith('jwtToken')
    expect(localStorage.removeItem).toHaveBeenCalledWith('userName')
    
    // Check that authentication status is now false
    expect(authUtils.isAuthenticated()).toBe(false)
  })

  test('checks authentication status', () => {
    expect(authUtils.isAuthenticated()).toBe(false)

    // Set token directly in localStorage
    localStorage.setItem('jwtToken', 'test-token')
    expect(authUtils.isAuthenticated()).toBe(true)
  })

  test('checks user roles', () => {
    authUtils.setAuthData({
      accessToken: 'test-token',
      username: 'testuser',
      id: '123',
      email: 'test@example.com',
      roles: ['ROLE_STUDENT', 'ROLE_USER'],
    })

    expect(authUtils.hasRole('ROLE_STUDENT')).toBe(true)
    expect(authUtils.hasRole('ROLE_ADMIN')).toBe(false)
    expect(authUtils.hasAnyRole(['ROLE_ADMIN', 'ROLE_STUDENT'])).toBe(true)
    expect(authUtils.hasAnyRole(['ROLE_ADMIN', 'ROLE_PROVOST'])).toBe(false)
  })

  test('redirects based on user role', () => {
    const mockRouter = { push: jest.fn() }

    // Test admin redirect
    authUtils.setAuthData({
      accessToken: 'token',
      username: 'admin',
      id: '1',
      email: 'admin@test.com',
      roles: ['ROLE_ADMIN'],
    })
    authUtils.redirectBasedOnRole(mockRouter)
    expect(mockRouter.push).toHaveBeenCalledWith('/admincorner')

    // Test student redirect
    mockRouter.push.mockClear()
    authUtils.setAuthData({
      accessToken: 'token',
      username: 'student',
      id: '2',
      email: 'student@test.com',
      roles: ['ROLE_STUDENT'],
    })
    authUtils.redirectBasedOnRole(mockRouter)
    expect(mockRouter.push).toHaveBeenCalledWith('/studentscorner')

    // Test unknown role
    mockRouter.push.mockClear()
    authUtils.setAuthData({
      accessToken: 'token',
      username: 'unknown',
      id: '3',
      email: 'unknown@test.com',
      roles: ['ROLE_UNKNOWN'],
    })
    authUtils.redirectBasedOnRole(mockRouter)
    expect(mockRouter.push).toHaveBeenCalledWith('/unknownrole')
  })
})

describe('JWT Utilities', () => {
  test('decodes valid JWT token', () => {
    // Mock JWT token (header.payload.signature)
    const payload = { sub: 'user123', exp: Math.floor(Date.now() / 1000) + 3600 }
    const encodedPayload = btoa(JSON.stringify(payload))
    const mockToken = `header.${encodedPayload}.signature`

    const decoded = jwtUtils.decode(mockToken)
    expect(decoded.sub).toBe('user123')
    expect(decoded.exp).toBeDefined()
  })

  test('returns null for invalid JWT token', () => {
    expect(jwtUtils.decode('invalid-token')).toBeNull()
    expect(jwtUtils.decode('')).toBeNull()
    expect(jwtUtils.decode(null)).toBeNull()
  })

  test('validates JWT token expiration', () => {
    // Valid token (expires in 1 hour)
    const validPayload = { exp: Math.floor(Date.now() / 1000) + 3600 }
    const validToken = `header.${btoa(JSON.stringify(validPayload))}.signature`
    expect(jwtUtils.isValid(validToken)).toBe(true)

    // Expired token
    const expiredPayload = { exp: Math.floor(Date.now() / 1000) - 3600 }
    const expiredToken = `header.${btoa(JSON.stringify(expiredPayload))}.signature`
    expect(jwtUtils.isValid(expiredToken)).toBe(false)
  })

  test('calculates token remaining time', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
    const payload = { exp: futureExp }
    const token = `header.${btoa(JSON.stringify(payload))}.signature`

    const remainingTime = jwtUtils.getRemainingTime(token)
    expect(remainingTime).toBeGreaterThan(3590000) // Roughly 1 hour in ms
    expect(remainingTime).toBeLessThan(3600000)
  })

  test('returns zero remaining time for expired tokens', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
    const payload = { exp: pastExp }
    const token = `header.${btoa(JSON.stringify(payload))}.signature`

    expect(jwtUtils.getRemainingTime(token)).toBe(0)
  })
})

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    // Use the global localStorage mock from jest.setup.js
    global.localStorageMock.store = {}
    global.fetch = jest.fn()
  })

  afterEach(() => {
    global.localStorageMock.clear()
    global.fetch.mockClear()
  })

  test('complete login flow', async () => {
    const loginResponse = {
      accessToken: 'new-jwt-token',
      username: 'testuser',
      id: '123',
      email: 'test@example.com',
      roles: ['ROLE_STUDENT'],
    }

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(loginResponse),
    })

    // Simulate login request
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'testuser', password: 'password' }),
    })

    const data = await response.json()
    authUtils.setAuthData(data)

    expect(authUtils.isAuthenticated()).toBe(true)
    expect(authUtils.hasRole('ROLE_STUDENT')).toBe(true)
    expect(authUtils.getUserData().userName).toBe('testuser')
  })

  test('logout flow', () => {
    // Setup authenticated state
    authUtils.setAuthData({
      accessToken: 'test-token',
      username: 'testuser',
      id: '123',
      email: 'test@example.com',
      roles: ['ROLE_STUDENT'],
    })

    expect(authUtils.isAuthenticated()).toBe(true)

    // Logout
    authUtils.clearAuthData()

    expect(authUtils.isAuthenticated()).toBe(false)
    expect(authUtils.getUserData()).toBeNull()
  })

  test('token expiration handling', () => {
    // Create expired token
    const expiredPayload = { exp: Math.floor(Date.now() / 1000) - 3600 }
    const expiredToken = `header.${btoa(JSON.stringify(expiredPayload))}.signature`

    global.localStorageMock.store['jwtToken'] = expiredToken
    
    expect(authUtils.isAuthenticated()).toBe(true) // Token exists
    expect(authUtils.isTokenExpired(expiredToken)).toBe(true) // But expired
  })
})
