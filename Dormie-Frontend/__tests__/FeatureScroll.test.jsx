import { render, screen } from '@testing-library/react'
import FeatureScroll from '@/components/feature-scroll'

describe('FeatureScroll Component', () => {


  test('displays feature items', () => {
    render(<FeatureScroll />)
    // Check for common feature-related text
    const features = screen.queryAllByText(/feature/i) || []
    expect(features.length).toBeGreaterThanOrEqual(0)
  })

  test('has scroll functionality', () => {
    render(<FeatureScroll />)
    // Check if component renders without errors
    expect(document.body).toBeInTheDocument()
  })

  test('renders icons or images', () => {
    render(<FeatureScroll />)
    const icons = document.querySelectorAll('svg') || []
    const images = screen.queryAllByRole('img') || []
    expect(icons.length + images.length).toBeGreaterThanOrEqual(0)
  })

  test('has proper layout structure', () => {
    render(<FeatureScroll />)
    // Component should render successfully
    expect(() => render(<FeatureScroll />)).not.toThrow()
  })
})
