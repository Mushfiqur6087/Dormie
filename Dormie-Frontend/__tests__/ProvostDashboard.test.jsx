import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useRouter } from 'next/navigation'
import ProvostDashboard from '../app/authoritycorner/provost/page'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock fetch API
global.fetch = jest.fn()

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

describe('ProvostDashboard', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    useRouter.mockReturnValue({
      push: mockPush,
    })
    
    // Mock authentication token
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'jwtToken') return 'mock-jwt-token'
      return null
    })
    
    // Mock successful API responses
    fetch.mockImplementation((url) => {
      if (url.includes('/api/students')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { 
              userId: 1, 
              studentId: 'S001', 
              firstName: 'John', 
              lastName: 'Doe',
              residencyStatus: 'resident',
              department: 'CSE',
              batch: 2021,
              contactNo: '01234567890'
            },
            { 
              userId: 2, 
              studentId: 'S002', 
              firstName: 'Jane', 
              lastName: 'Smith',
              residencyStatus: 'attached',
              department: 'EEE',
              batch: 2022,
              contactNo: '01987654321'
            }
          ])
        })
      }
      return Promise.reject(new Error('Not found'))
    })
  })

  test('displays dashboard title', async () => {
    render(<ProvostDashboard />)
    expect(screen.getByText('Provost Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Hall Management Overview')).toBeInTheDocument()
  })

  test('shows loading state initially', () => {
    render(<ProvostDashboard />)
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument()
  })

  test('displays student statistics after loading', async () => {
    render(<ProvostDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Students Overview')).toBeInTheDocument()
    })
  })

  test('displays view details button', async () => {
    render(<ProvostDashboard />)
    
    await waitFor(() => {
      const detailButton = screen.getByText('View Details')
      expect(detailButton).toBeInTheDocument()
    })
  })

  test('displays total students count', async () => {
    render(<ProvostDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Total Registered Students')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument() // Based on mock data
    })
  })

  test('renders without errors', () => {
    expect(() => render(<ProvostDashboard />)).not.toThrow()
  })

  test('handles authentication error gracefully', async () => {
    localStorageMock.getItem.mockReturnValue(null) // No token
    
    render(<ProvostDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('You are not logged in. Please log in as Provost.')).toBeInTheDocument()
    })
  })

  test('handles API error gracefully', async () => {
    fetch.mockImplementation(() => Promise.reject(new Error('API Error')))
    
    render(<ProvostDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText(/An unexpected error occurred while fetching dashboard data/)).toBeInTheDocument()
    })
  })
})
