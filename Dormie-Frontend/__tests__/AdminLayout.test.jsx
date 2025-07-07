import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminLayout from '@/app/admincorner/layout'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }) => {
    return <a href={href}>{children}</a>
  }
})

describe('AdminLayout Component', () => {
  const mockPush = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    mockPush.mockClear()
    
    // Mock useRouter and usePathname for this test suite
    require('next/navigation').useRouter.mockReturnValue({
      push: mockPush,
    })
    require('next/navigation').usePathname.mockReturnValue('/admincorner')
  })

  test('renders admin layout with sidebar', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>
    )
    
    expect(screen.getByText('Admin Panel')).toBeInTheDocument()
    expect(screen.getByText('Admin Corner')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  test('displays username from localStorage', () => {
    localStorage.getItem.mockReturnValue('John Doe')
    
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>
    )
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  test('shows default Administrator text when no username', () => {
    localStorage.getItem.mockReturnValue(null)
    
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>
    )
    
    expect(screen.getByText('Administrator')).toBeInTheDocument()
  })

  test('renders all menu items', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>
    )
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Submit Student List')).toBeInTheDocument()
    expect(screen.getByText('Submit Room List')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  test('menu items have correct href attributes', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>
    )
    
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    const studentListLink = screen.getByRole('link', { name: /submit student list/i })
    const roomListLink = screen.getByRole('link', { name: /submit room list/i })
    
    expect(dashboardLink).toHaveAttribute('href', '/admincorner')
    expect(studentListLink).toHaveAttribute('href', '/admincorner/submitstudentlist')
    expect(roomListLink).toHaveAttribute('href', '/admincorner/submitroomlist')
  })

  test('mobile menu toggle works', async () => {
    const user = userEvent.setup()
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>
    )
    
    // Find the mobile menu button (the first button, which is the menu toggle)
    const allButtons = screen.getAllByRole('button')
    const mobileMenuButton = allButtons[0] // First button should be the mobile menu toggle
    
    // Click to open mobile menu
    await user.click(mobileMenuButton)
    
    // The sidebar should be visible (transform class changes)
    const sidebar = screen.getByRole('complementary')
    expect(sidebar).toHaveClass('translate-x-0')
  })

  test('logout functionality works', async () => {
    const user = userEvent.setup()
    
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>
    )
    
    const logoutButton = screen.getByRole('button', { name: /logout/i })
    await user.click(logoutButton)
    
    // Check if localStorage items were removed
    expect(localStorage.removeItem).toHaveBeenCalledWith('jwtToken')
    expect(localStorage.removeItem).toHaveBeenCalledWith('userName')
    expect(localStorage.removeItem).toHaveBeenCalledWith('userId')
    expect(localStorage.removeItem).toHaveBeenCalledWith('userEmail')
    expect(localStorage.removeItem).toHaveBeenCalledWith('userRoles')
    
    // Check if router.push was called with login route
    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  test('active menu item has correct styling', () => {
    // Dashboard should be active since pathname is '/admincorner'
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>
    )
    
    const dashboardButton = screen.getByRole('button', { name: /dashboard/i })
    expect(dashboardButton).toHaveClass('bg-blue-600')
  })

  test('renders children content correctly', () => {
    const testContent = <div data-testid="child-content">Child Component Content</div>
    
    render(<AdminLayout>{testContent}</AdminLayout>)
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByText('Child Component Content')).toBeInTheDocument()
  })
})
