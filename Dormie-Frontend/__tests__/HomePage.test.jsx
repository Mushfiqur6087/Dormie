import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }) => {
    return <a href={href}>{children}</a>
  }
})

// Mock the carousel components
jest.mock('@/components/image-carousel', () => {
  return function MockImageCarousel() {
    return <div data-testid="image-carousel">Image Carousel</div>
  }
})

jest.mock('@/components/feature-scroll', () => {
  return function MockFeatureScroll() {
    return <div data-testid="feature-scroll">Feature Scroll</div>
  }
})

describe('Home Page', () => {
  test('renders main heading', () => {
    render(<Home />)
    expect(screen.getByText(/Welcome to/)).toBeInTheDocument()
    expect(screen.getByText('Dorm-E')).toBeInTheDocument()
  })

  test('renders hero section content', () => {
    render(<Home />)
    expect(screen.getByText(/The future of dormitory management is here/)).toBeInTheDocument()
    expect(screen.getByText(/Smart, efficient, and student-centered/)).toBeInTheDocument()
  })

  test('renders login button', () => {
    render(<Home />)
    const loginButtons = screen.getAllByRole('link', { name: /login/i })
    expect(loginButtons.length).toBeGreaterThan(0)
    expect(loginButtons[0]).toHaveAttribute('href', '/login')
  })

  test('renders navigation links', () => {
    render(<Home />)
    expect(screen.getByRole('link', { name: /about us/i })).toHaveAttribute('href', '/about')
    expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute('href', '/contact')
  })

  test('renders stats section', () => {
    render(<Home />)
    expect(screen.getByText('Trusted by Students Worldwide')).toBeInTheDocument()
    expect(screen.getByText('500+')).toBeInTheDocument()
    expect(screen.getByText('Active Students')).toBeInTheDocument()
    expect(screen.getByText('24/7')).toBeInTheDocument()
    expect(screen.getByText('Support Available')).toBeInTheDocument()
    expect(screen.getByText('99%')).toBeInTheDocument()
    expect(screen.getByText('Uptime Guarantee')).toBeInTheDocument()
    expect(screen.getByText('10+')).toBeInTheDocument()
    expect(screen.getByText('Years Experience')).toBeInTheDocument()
  })

  test('renders CTA section', () => {
    render(<Home />)
    expect(screen.getByText('Transform Your Dormitory Experience')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /login to get started/i })).toHaveAttribute('href', '/login')
  })

  test('renders image carousel', () => {
    render(<Home />)
    expect(screen.getByTestId('image-carousel')).toBeInTheDocument()
  })

  test('renders feature scroll', () => {
    render(<Home />)
    expect(screen.getByTestId('feature-scroll')).toBeInTheDocument()
  })

  test('does not render signup links', () => {
    render(<Home />)
    // After removing signup functionality, these should not exist
    expect(screen.queryByText(/sign up/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /sign up/i })).not.toBeInTheDocument()
  })

  test('has proper semantic structure', () => {
    render(<Home />)
    
    // Check for proper heading hierarchy
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2)
    
    // Check for links
    expect(screen.getAllByRole('link')).toHaveLength(4) // Login (2x), About Us, Contact
  })
})
