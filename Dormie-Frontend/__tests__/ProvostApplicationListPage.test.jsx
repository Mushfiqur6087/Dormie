import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useRouter, useSearchParams } from 'next/navigation'
import ProvostApplicationListPage from '../app/authoritycorner/provost/applications/page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

// Mock API calls
global.fetch = jest.fn()

describe('ProvostApplicationListPage', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    // Clear localStorage first
    localStorage.clear()
    
    // Set up authentication in localStorage
    localStorage.setItem('jwtToken', 'mock-jwt-token')
    localStorage.setItem('userName', 'testuser')
    localStorage.setItem('userRoles', JSON.stringify(['ROLE_PROVOST']))

    useRouter.mockReturnValue({
      push: mockPush,
    })
    useSearchParams.mockReturnValue({
      get: jest.fn(() => null),
    })

    // Mock successful API response by default
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        {
          applicationId: 123,
          username: 'testuser',
          studentIdNo: 'ST001',
          applicationStatus: 'PENDING',
          applicationDate: '2025-01-01'
        }
      ]),
    })

    mockPush.mockClear()
    jest.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('renders applications page header', async () => {
    render(<ProvostApplicationListPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/hall seat applications/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('displays loading state initially', () => {
    // Mock fetch to never resolve to test loading state
    global.fetch.mockImplementation(() => new Promise(() => {}))
    
    render(<ProvostApplicationListPage />)
    expect(screen.getByText(/loading applications/i)).toBeInTheDocument()
  })

  test('shows search input', async () => {
    render(<ProvostApplicationListPage />)
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search by name/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('displays status filter dropdown', async () => {
    render(<ProvostApplicationListPage />)
    
    await waitFor(() => {
      expect(screen.getByDisplayValue(/all status/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('displays no applications message when empty', async () => {
    // Mock empty response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    })

    render(<ProvostApplicationListPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/no applications found/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })



  test('shows sort buttons', async () => {
    render(<ProvostApplicationListPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/income/i)).toBeInTheDocument()
      expect(screen.getByText(/distance/i)).toBeInTheDocument()
      expect(screen.getByText(/date/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('renders application management interface', async () => {
    render(<ProvostApplicationListPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/review and manage student applications/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})
