import { render, screen, fireEvent } from '@testing-library/react'
import Header from '@/components/Header'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }) => {
    return <a href={href}>{children}</a>
  }
})

describe('Header Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  test('renders Dorm-E logo', () => {
    render(<Header />)
    expect(screen.getByText('Dorm-E')).toBeInTheDocument()
  })

  test('renders all navigation links', () => {
    render(<Header />)
    
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  test('mobile menu toggle works', () => {
    render(<Header />)
    
    // Initially, mobile menu should not be visible
    const mobileMenuButton = screen.getByRole('button')
    
    // Click to open mobile menu
    fireEvent.click(mobileMenuButton)
    
    // Check if mobile menu links are visible
    const mobileLinks = screen.getAllByText('Home')
    expect(mobileLinks.length).toBeGreaterThan(1) // Desktop and mobile versions
  })

  test('navigation links have correct href attributes', () => {
    render(<Header />)
    
    expect(screen.getByRole('link', { name: /dorm-e/i })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute('href', '/about')
    expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute('href', '/contact')
    expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute('href', '/login')
  })

  test('renders with proper CSS classes', () => {
    render(<Header />)
    
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('bg-white', 'dark:bg-gray-800', 'shadow-md')
  })
})
