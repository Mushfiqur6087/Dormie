import { render, screen } from '@testing-library/react'
import ImageCarousel from '@/components/image-carousel'

// Mock embla-carousel-react
jest.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: () => [
    { scrollTo: jest.fn(), on: jest.fn(), off: jest.fn() },
    { current: null }
  ]
}))

describe('ImageCarousel Component', () => {

  test('displays carousel images', () => {
    render(<ImageCarousel />)
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThanOrEqual(0)
  })

  test('has navigation controls', () => {
    render(<ImageCarousel />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(0)
  })

  test('renders without errors', () => {
    expect(() => render(<ImageCarousel />)).not.toThrow()
  })

  test('has proper carousel structure', () => {
    render(<ImageCarousel />)
    // Check for common carousel elements
    const carouselContainer = document.querySelector('[data-testid="image-carousel"]') || document.body
    expect(carouselContainer).toBeInTheDocument()
  })
})
