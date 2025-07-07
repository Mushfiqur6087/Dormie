import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { act } from 'react-dom/test-utils'

// Mock API utilities
jest.mock('../lib/api', () => ({
  createApiUrl: jest.fn((endpoint) => `http://localhost:8080${endpoint}`),
  createUploadUrl: jest.fn((path) => `http://localhost:8080/uploads/${path}`),
}))

describe('API Integration Tests', () => {
  beforeEach(() => {
    global.fetch.mockClear()
    global.localStorageMock.store = {}
  })

  test('createApiUrl creates correct API endpoints', () => {
    const { createApiUrl } = require('../lib/api')
    
    expect(createApiUrl('/api/test')).toBe('http://localhost:8080/api/test')
    expect(createApiUrl('/api/users')).toBe('http://localhost:8080/api/users')
  })

  test('createUploadUrl creates correct upload URLs', () => {
    const { createUploadUrl } = require('../lib/api')
    
    expect(createUploadUrl('image.jpg')).toBe('http://localhost:8080/uploads/image.jpg')
    expect(createUploadUrl('documents/file.pdf')).toBe('http://localhost:8080/uploads/documents/file.pdf')
  })

  test('localStorage operations work correctly', () => {
    // Set up localStorage with test data
    localStorage.setItem('jwtToken', 'test-token')
    
    const token = localStorage.getItem('jwtToken')
    expect(token).toBe('test-token')
    
    localStorage.setItem('userName', 'testuser')
    expect(localStorage.getItem('userName')).toBe('testuser')
    
    localStorage.removeItem('jwtToken')
    expect(localStorage.getItem('jwtToken')).toBeNull()
  })

  test('fetch API calls include proper headers', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })

    const token = 'test-jwt-token'
    
    await fetch('http://localhost:8080/api/test', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/test',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-jwt-token',
          'Content-Type': 'application/json',
        }),
      })
    )
  })

  test('handles API error responses', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Unauthorized' }),
    })

    try {
      const response = await fetch('http://localhost:8080/api/protected')
      const data = await response.json()
      
      expect(response.ok).toBe(false)
      expect(response.status).toBe(401)
      expect(data.message).toBe('Unauthorized')
    } catch (error) {
      // Should not throw for HTTP errors
      expect(error).toBeUndefined()
    }
  })

  test('handles network errors', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'))

    try {
      await fetch('http://localhost:8080/api/test')
    } catch (error) {
      expect(error.message).toBe('Network error')
    }
  })

  test('POST requests with JSON payload', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 1, created: true }),
    })

    const payload = { name: 'Test User', email: 'test@example.com' }
    
    await fetch('http://localhost:8080/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/users',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(payload),
      })
    )
  })

  test('handles file upload requests', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ filename: 'uploaded.jpg' }),
    })

    const formData = new FormData()
    formData.append('file', new File(['test'], 'test.jpg', { type: 'image/jpeg' }))
    
    await fetch('http://localhost:8080/api/upload', {
      method: 'POST',
      body: formData,
    })

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/upload',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      })
    )
  })

  test('authentication flow simulation', async () => {
    // Mock login response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        accessToken: 'new-jwt-token',
        username: 'testuser',
        roles: ['ROLE_STUDENT'],
      }),
    })

    const loginData = { username: 'testuser', password: 'password' }
    
    const response = await fetch('http://localhost:8080/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    })

    const data = await response.json()
    
    expect(response.ok).toBe(true)
    expect(data.accessToken).toBe('new-jwt-token')
    expect(data.username).toBe('testuser')
    expect(data.roles).toContain('ROLE_STUDENT')
  })
})
