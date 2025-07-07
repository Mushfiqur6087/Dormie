import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useRouter, usePathname } from 'next/navigation'
import StudentLayout from '../app/studentscorner/layout'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}))

describe('StudentLayout', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    useRouter.mockReturnValue({
      push: mockPush,
    })
    usePathname.mockReturnValue('/studentscorner')
    
    // Set up authentication in localStorage
    localStorage.setItem('jwtToken', 'mock-jwt-token')
    localStorage.setItem('userName', 'Test Student')
    localStorage.setItem('userRoles', JSON.stringify(['ROLE_STUDENT']))

    mockPush.mockClear()
    jest.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('renders student layout with navigation', () => {
    render(
      <StudentLayout>
        <div>Test Content</div>
      </StudentLayout>
    )
    
    expect(screen.getByText(/student corner/i)).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  test('displays user name from localStorage', () => {
    render(
      <StudentLayout>
        <div>Test Content</div>
      </StudentLayout>
    )
    
    expect(screen.getByText('Test Student')).toBeInTheDocument()
  })

  test('shows navigation menu items', () => {
    render(
      <StudentLayout>
        <div>Test Content</div>
      </StudentLayout>
    )
    
    expect(screen.getByText(/my information/i)).toBeInTheDocument()
    expect(screen.getByText(/apply for seat/i)).toBeInTheDocument()
    expect(screen.getByText(/my dues/i)).toBeInTheDocument()
  })



  test('handles logout functionality', () => {
    render(
      <StudentLayout>
        <div>Test Content</div>
      </StudentLayout>
    )
    
    const logoutButton = screen.getByText(/logout/i)
    fireEvent.click(logoutButton)
    
    expect(localStorage.removeItem).toHaveBeenCalledWith('jwtToken')
    expect(localStorage.removeItem).toHaveBeenCalledWith('userName')
    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  test('renders children content properly', () => {
    const testContent = <div data-testid="child-content">Child Component</div>
    
    render(
      <StudentLayout>
        {testContent}
      </StudentLayout>
    )
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByText('Child Component')).toBeInTheDocument()
  })

  test('has responsive design classes', () => {
    render(
      <StudentLayout>
        <div>Test Content</div>
      </StudentLayout>
    )
    
    const sidebar = screen.getByRole('complementary')
    expect(sidebar).toHaveClass('lg:translate-x-0')
  })
})
