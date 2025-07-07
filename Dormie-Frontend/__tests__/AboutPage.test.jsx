import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import AboutPage from '../app/about/page'

describe('AboutPage', () => {
  test('renders about page title', () => {
    render(<AboutPage />)
    expect(screen.getByText(/about/i)).toBeInTheDocument()
  })

  test('displays mission statement', () => {
    render(<AboutPage />)
    expect(screen.getByText(/our mission/i)).toBeInTheDocument()
  })

  test('contains mission description', () => {
    render(<AboutPage />)
    expect(screen.getByText(/technology-driven dormitory experience/i)).toBeInTheDocument()
  })



  test('renders without throwing errors', () => {
    expect(() => render(<AboutPage />)).not.toThrow()
  })



  test('displays educational focus message', () => {
    render(<AboutPage />)
    expect(screen.getByText(/academic journey/i)).toBeInTheDocument()
  })
})
