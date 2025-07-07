import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock routing utilities
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
}

// Mock useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/current-path',
  useSearchParams: () => new URLSearchParams(),
}))

// Router test utilities
const createRouterUtils = () => {
  const history = []
  let currentIndex = -1

  const navigate = (path, options = {}) => {
    if (options.replace && currentIndex >= 0) {
      history[currentIndex] = path
    } else {
      currentIndex++
      history[currentIndex] = path
      // Remove any forward history
      history.splice(currentIndex + 1)
    }
  }

  const back = () => {
    if (currentIndex > 0) {
      currentIndex--
      return history[currentIndex]
    }
    return null
  }

  const forward = () => {
    if (currentIndex < history.length - 1) {
      currentIndex++
      return history[currentIndex]
    }
    return null
  }

  const getCurrentPath = () => {
    return currentIndex >= 0 ? history[currentIndex] : '/'
  }

  return { navigate, back, forward, getCurrentPath, history }
}

// URL parameter utilities
const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString)
  const result = {}
  for (const [key, value] of params.entries()) {
    result[key] = value
  }
  return result
}

const buildQueryString = (params) => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.append(key, value.toString())
    }
  })
  return searchParams.toString()
}

// Route matching utilities
const matchRoute = (pattern, path) => {
  const patternSegments = pattern.split('/')
  const pathSegments = path.split('/')

  if (patternSegments.length !== pathSegments.length) {
    return { matches: false, params: {} }
  }

  const params = {}
  
  for (let i = 0; i < patternSegments.length; i++) {
    const patternSegment = patternSegments[i]
    const pathSegment = pathSegments[i]

    if (patternSegment.startsWith('[') && patternSegment.endsWith(']')) {
      // Dynamic segment
      const paramName = patternSegment.slice(1, -1)
      params[paramName] = pathSegment
    } else if (patternSegment !== pathSegment) {
      return { matches: false, params: {} }
    }
  }

  return { matches: true, params }
}

// Protected route utility
const isProtectedRoute = (path) => {
  const protectedPaths = [
    '/admincorner',
    '/studentscorner',
    '/authoritycorner',
  ]
  
  return protectedPaths.some(protectedPath => path.startsWith(protectedPath))
}

// Role-based access control
const checkRouteAccess = (path, userRoles = []) => {
  const routePermissions = {
    '/admincorner': ['ROLE_ADMIN'],
    '/studentscorner': ['ROLE_STUDENT'],
    '/authoritycorner/provost': ['ROLE_PROVOST'],
    '/authoritycorner/hallmanager': ['ROLE_HALL_MANAGER'],
  }

  for (const [routePath, requiredRoles] of Object.entries(routePermissions)) {
    if (path.startsWith(routePath)) {
      return requiredRoles.some(role => userRoles.includes(role))
    }
  }

  return !isProtectedRoute(path) // Public routes are accessible
}

describe('Routing Utilities', () => {
  beforeEach(() => {
    mockRouter.push.mockClear()
    mockRouter.replace.mockClear()
    mockRouter.back.mockClear()
    mockRouter.forward.mockClear()
  })

  test('router navigation utilities work correctly', () => {
    const utils = createRouterUtils()
    
    utils.navigate('/home')
    expect(utils.getCurrentPath()).toBe('/home')
    
    utils.navigate('/about')
    expect(utils.getCurrentPath()).toBe('/about')
    expect(utils.history).toEqual(['/home', '/about'])
    
    const backPath = utils.back()
    expect(backPath).toBe('/home')
    expect(utils.getCurrentPath()).toBe('/home')
    
    const forwardPath = utils.forward()
    expect(forwardPath).toBe('/about')
    expect(utils.getCurrentPath()).toBe('/about')
  })

  test('replace navigation overwrites current history entry', () => {
    const utils = createRouterUtils()
    
    utils.navigate('/page1')
    utils.navigate('/page2')
    utils.navigate('/page3', { replace: true })
    
    expect(utils.history).toEqual(['/page1', '/page3'])
    expect(utils.getCurrentPath()).toBe('/page3')
  })

  test('query string parsing works correctly', () => {
    const queryString = 'page=1&limit=10&sort=name&filter=active'
    const params = parseQueryString(queryString)
    
    expect(params).toEqual({
      page: '1',
      limit: '10',
      sort: 'name',
      filter: 'active',
    })
  })

  test('query string building handles various value types', () => {
    const params = {
      page: 1,
      search: 'test query',
      active: true,
      empty: null,
      undefined: undefined,
    }
    
    const queryString = buildQueryString(params)
    expect(queryString).toBe('page=1&search=test+query&active=true')
  })

  test('route matching with static segments', () => {
    const result = matchRoute('/users/profile', '/users/profile')
    expect(result.matches).toBe(true)
    expect(result.params).toEqual({})
    
    const noMatch = matchRoute('/users/profile', '/users/settings')
    expect(noMatch.matches).toBe(false)
  })

  test('route matching with dynamic segments', () => {
    const result = matchRoute('/users/[id]/posts/[postId]', '/users/123/posts/456')
    expect(result.matches).toBe(true)
    expect(result.params).toEqual({
      id: '123',
      postId: '456',
    })
  })

  test('protected route detection', () => {
    expect(isProtectedRoute('/admincorner')).toBe(true)
    expect(isProtectedRoute('/admincorner/users')).toBe(true)
    expect(isProtectedRoute('/studentscorner/apply')).toBe(true)
    expect(isProtectedRoute('/login')).toBe(false)
    expect(isProtectedRoute('/about')).toBe(false)
  })

  test('role-based access control', () => {
    expect(checkRouteAccess('/admincorner', ['ROLE_ADMIN'])).toBe(true)
    expect(checkRouteAccess('/admincorner', ['ROLE_STUDENT'])).toBe(false)
    expect(checkRouteAccess('/studentscorner', ['ROLE_STUDENT'])).toBe(true)
    expect(checkRouteAccess('/authoritycorner/provost', ['ROLE_PROVOST'])).toBe(true)
    expect(checkRouteAccess('/login', [])).toBe(true) // Public route
  })

  test('multiple roles access control', () => {
    const userRoles = ['ROLE_STUDENT', 'ROLE_ADMIN']
    
    expect(checkRouteAccess('/admincorner', userRoles)).toBe(true)
    expect(checkRouteAccess('/studentscorner', userRoles)).toBe(true)
    expect(checkRouteAccess('/authoritycorner/provost', userRoles)).toBe(false)
  })
})

describe('Navigation Component Tests', () => {
  // Mock navigation component
  const Navigation = ({ userRoles = [] }) => {
    const router = mockRouter

    const handleNavigation = (path) => {
      if (checkRouteAccess(path, userRoles)) {
        router.push(path)
      } else {
        router.push('/unauthorized')
      }
    }

    return React.createElement('nav', {},
      React.createElement('button', {
        'data-testid': 'home-link',
        onClick: () => handleNavigation('/'),
      }, 'Home'),
      React.createElement('button', {
        'data-testid': 'admin-link',
        onClick: () => handleNavigation('/admincorner'),
      }, 'Admin'),
      React.createElement('button', {
        'data-testid': 'student-link',
        onClick: () => handleNavigation('/studentscorner'),
      }, 'Student'),
      React.createElement('button', {
        'data-testid': 'back-button',
        onClick: () => router.back(),
      }, 'Back')
    )
  }


})
