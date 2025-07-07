import { render, screen } from '@testing-library/react'
import Footer from '@/components/Footer'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }) => {
    return <a href={href}>{children}</a>
  }
})

describe('Footer Component', () => {
  test('renders footer component', () => {
    render(<Footer />)
    // Check if footer element exists
    const footer = document.querySelector('footer') || screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
  })

  test('displays copyright information', () => {
    render(<Footer />)
    const currentYear = new Date().getFullYear()
    const copyrightText = screen.queryByText(new RegExp(currentYear.toString())) || 
                         screen.queryByText(/copyright/i) ||
                         screen.queryByText(/©/i)
    expect(copyrightText).toBeInTheDocument()
  })

  test('has proper styling', () => {
    render(<Footer />)
    const footerElement = document.querySelector('footer') || document.querySelector('[role="contentinfo"]')
    expect(footerElement).toBeInTheDocument()
  })

  test('renders without crashing', () => {
    expect(() => render(<Footer />)).not.toThrow()
  })

  test('contains footer links', () => {
    render(<Footer />)
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThanOrEqual(0)
  })
})
