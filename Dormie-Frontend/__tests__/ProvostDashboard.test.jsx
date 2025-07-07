import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProvostDashboard from '../app/authoritycorner/provost/page'

describe('ProvostDashboard', () => {
 

  test('displays coming soon message', () => {
    render(<ProvostDashboard />)
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument()
  })

  test('shows under development notice', () => {
    render(<ProvostDashboard />)
    expect(screen.getByText(/dashboard under development/i)).toBeInTheDocument()
  })




  test('displays development message', () => {
    render(<ProvostDashboard />)
    expect(screen.getByText(/check back later for provost dashboard features/i)).toBeInTheDocument()
  })

  test('renders without errors', () => {
    expect(() => render(<ProvostDashboard />)).not.toThrow()
  })

})
