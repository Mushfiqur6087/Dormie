import { render, screen } from '@testing-library/react'
import AdminDashboard from '@/app/admincorner/page'

describe('AdminDashboard Component', () => {
  test('renders admin dashboard title', () => {
    render(<AdminDashboard />)
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
  })

  test('shows coming soon message', () => {
    render(<AdminDashboard />)
    expect(screen.getByText('Coming Soon...')).toBeInTheDocument()
  })

  test('displays under development message', () => {
    render(<AdminDashboard />)
    expect(screen.getByText('Dashboard Under Development')).toBeInTheDocument()
    expect(screen.getByText(/This page is currently being developed/)).toBeInTheDocument()
  })

  test('renders settings icons', () => {
    render(<AdminDashboard />)
    const settingsIcons = document.querySelectorAll('svg')
    expect(settingsIcons.length).toBeGreaterThan(0)
  })
})
