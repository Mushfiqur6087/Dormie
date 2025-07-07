import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ContactPage from '../app/contact/page'

describe('ContactPage', () => {
  test('renders contact page title', () => {
    render(<ContactPage />)
    expect(screen.getByText(/contact/i)).toBeInTheDocument()
  })



  test('renders without errors', () => {
    expect(() => render(<ContactPage />)).not.toThrow()
  })
})
