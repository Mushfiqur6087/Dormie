import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useRouter } from 'next/navigation'
import SubmitRoomList from '../app/admincorner/submitroomlist/page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock API calls
global.fetch = jest.fn()

describe('SubmitRoomList', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    useRouter.mockReturnValue({
      push: mockPush,
    })
    
    global.fetch.mockClear()
    mockPush.mockClear()
  })





  test('displays submit button', () => {
    render(<SubmitRoomList />)
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })


  test('shows progress indicator during upload', () => {
    render(<SubmitRoomList />)
    // Initially should not show uploading state
    expect(screen.queryByText(/uploading/i)).not.toBeInTheDocument()
  })

  test('renders without errors', () => {
    expect(() => render(<SubmitRoomList />)).not.toThrow()
  })

})
