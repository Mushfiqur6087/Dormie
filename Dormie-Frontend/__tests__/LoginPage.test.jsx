import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/login/page'

// Mock fetch
global.fetch = jest.fn()

describe('LoginPage Component', () => {
  const mockPush = jest.fn()
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
    fetch.mockClear()
    mockPush.mockClear()
    
    // Mock useRouter for this test suite
    require('next/navigation').useRouter.mockReturnValue({
      push: mockPush,
    })
  })

  test('renders login form elements', () => {
    render(<LoginPage />)
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  test('shows validation error for empty form submission', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)
    
    // Check for HTML5 validation (required fields)
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    expect(emailInput).toBeRequired()
    expect(passwordInput).toBeRequired()
  })

  test('toggles password visibility', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    
    const passwordInput = screen.getByLabelText(/password/i)
    const toggleButtons = screen.getAllByRole('button')
    const toggleButton = toggleButtons.find(btn => btn.type === 'button' && btn !== screen.getByRole('button', { name: /sign in/i }))
    
    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    // Click to show password
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')
    
    // Click to hide password again
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('handles successful login', async () => {
    const user = userEvent.setup()
    
    // Mock successful API response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessToken: 'mock-token',
        username: 'testuser',
        id: '123',
        email: 'test@example.com',
        roles: ['ROLE_STUDENT']
      }),
    })
    
    render(<LoginPage />)
    
    // Fill in the form
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    // Wait for the success message
    await waitFor(() => {
      expect(screen.getByText('Login successful!')).toBeInTheDocument()
    })
    
    // Check if localStorage was called
    expect(localStorage.setItem).toHaveBeenCalledWith('jwtToken', 'mock-token')
    expect(localStorage.setItem).toHaveBeenCalledWith('userName', 'testuser')
    
    // Check if router.push was called with student route
    expect(mockPush).toHaveBeenCalledWith('/studentscorner')
  })

  test('handles login error', async () => {
    const user = userEvent.setup()
    
    // Mock failed API response
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Invalid credentials'
      }),
    })
    
    render(<LoginPage />)
    
    // Fill in the form
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    // Wait for the error message
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  test('shows loading state during submission', async () => {
    const user = userEvent.setup()
    
    // Mock a delayed response
    fetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<LoginPage />)
    
    // Fill in the form
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)
    
    // Check for loading spinner - find the submit button that is now disabled
    const buttons = screen.getAllByRole('button')
    const submitBtn = buttons.find(btn => btn.type === 'submit')
    expect(submitBtn).toBeDisabled()
  })

  test('redirects admin users to admin corner', async () => {
    const user = userEvent.setup()
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessToken: 'mock-token',
        username: 'admin',
        id: '123',
        email: 'admin@example.com',
        roles: ['ROLE_ADMIN']
      }),
    })
    
    render(<LoginPage />)
    
    await user.type(screen.getByLabelText(/email address/i), 'admin@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admincorner')
    })
  })
})
