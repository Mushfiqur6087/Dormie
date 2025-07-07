import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useRouter } from 'next/navigation'
import MyDues from '../app/studentscorner/mydues/page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock API calls
global.fetch = jest.fn()

describe('MyDues', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    useRouter.mockReturnValue({
      push: mockPush,
    })
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(() => 'mock-jwt-token'),
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    })

    global.fetch.mockClear()
    mockPush.mockClear()
  })

  test('renders my dues page header', () => {
    render(<MyDues />)
    expect(screen.getByText(/my dues/i)).toBeInTheDocument()
  })

  test('displays loading state initially', () => {
    global.fetch.mockImplementationOnce(() => new Promise(() => {}))
    
    render(<MyDues />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  test('renders without errors', () => {
    expect(() => render(<MyDues />)).not.toThrow()
  })
})
