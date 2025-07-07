import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useRouter, useParams } from 'next/navigation'
import ProvostApplicationDetailPage from '../app/authoritycorner/provost/applications/[id]/page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}))

describe('ProvostApplicationDetailPage', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    // Clear localStorage first
    localStorage.clear()
    
    // Set up authenticated user with proper role
    localStorage.setItem('jwtToken', 'mock-jwt-token')
    localStorage.setItem('userName', 'provost_user')
    localStorage.setItem('userId', '1')
    localStorage.setItem('userEmail', 'provost@example.com')
    localStorage.setItem('userRoles', JSON.stringify(['ROLE_PROVOST']))

    useRouter.mockReturnValue({
      push: mockPush,
    })
    useParams.mockReturnValue({ id: '123' })
    
    // Mock successful API response by default
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        applicationId: 123,
        username: 'testuser',
        studentIdNo: 'ST001',
        applicationStatus: 'PENDING',
        applicationDate: '2025-01-01',
        personalInfo: {
          fullName: 'Test User',
          email: 'test@example.com'
        }
      }),
    })

    global.fetch.mockClear()
    mockPush.mockClear()
    jest.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('displays loading state initially', () => {
    // Mock fetch to never resolve to test loading state
    global.fetch.mockImplementation(() => new Promise(() => {}))
    
    render(<ProvostApplicationDetailPage />)
    expect(screen.getByText(/loading application details/i)).toBeInTheDocument()
  })

  test('shows application details when loaded', async () => {
    render(<ProvostApplicationDetailPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/application details/i)).toBeInTheDocument()
      expect(screen.getByText(/application #123/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('displays accept and reject buttons for pending applications', async () => {
    render(<ProvostApplicationDetailPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/Accept Application/i)).toBeInTheDocument()
      expect(screen.getByText(/Reject Application/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('shows back to list button', async () => {
    render(<ProvostApplicationDetailPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/back to list/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('displays error message when application not found', async () => {
    // Mock 404 response
    global.fetch.mockRejectedValueOnce(new Error('Application not found.'))

    render(<ProvostApplicationDetailPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText('Application not found.')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('handles application acceptance', async () => {
    // Mock successful PUT request for acceptance
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          applicationId: 123,
          username: 'testuser',
          studentIdNo: 'ST001',
          applicationStatus: 'PENDING',
          applicationDate: '2025-01-01',
          personalInfo: {
            fullName: 'Test User',
            email: 'test@example.com'
          }
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Application accepted' }),
      })

    // Mock window.alert
    window.alert = jest.fn()

    render(<ProvostApplicationDetailPage />)
    
    await waitFor(() => {
      const acceptButton = screen.getByText(/Accept Application/i)
      fireEvent.click(acceptButton)
    }, { timeout: 3000 })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/accept'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-jwt-token',
        }),
      })
    )
  })

  test('shows personal information section', async () => {
    render(<ProvostApplicationDetailPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/personal information/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  
})
