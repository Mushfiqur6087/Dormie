# Frontend Testing Setup

## Overview
This frontend uses Jest and React Testing Library for unit testing. The testing setup includes:

- **Jest**: JavaScript testing framework
- **React Testing Library**: Simple and complete testing utilities for React components
- **Jest DOM**: Custom jest matchers for DOM assertions
- **User Event**: Advanced simulation of user interactions

## File Structure
```
__tests__/
├── Header.test.jsx          # Tests for Header component
├── LoginPage.test.jsx       # Tests for Login page
├── AdminLayout.test.jsx     # Tests for Admin layout
├── HomePage.test.jsx        # Tests for Home page
└── utils.test.js           # Tests for utility functions

jest.config.js              # Jest configuration
jest.setup.js               # Test setup and global mocks
```

## Running Tests

### Run all tests
```bash
pnpm test
```

### Run tests in watch mode
```bash
pnpm test:watch
```

### Run tests with coverage
```bash
pnpm test:coverage
```

### Run specific test file
```bash
pnpm test Header.test.jsx
```

### Run tests matching a pattern
```bash
pnpm test --testNamePattern="login"
```

## Writing Tests

### Basic Component Test
```javascript
import { render, screen } from '@testing-library/react'
import MyComponent from '@/components/MyComponent'

test('renders component', () => {
  render(<MyComponent />)
  expect(screen.getByText('Expected Text')).toBeInTheDocument()
})
```

### Testing User Interactions
```javascript
import userEvent from '@testing-library/user-event'

test('handles button click', async () => {
  const user = userEvent.setup()
  render(<MyComponent />)
  
  await user.click(screen.getByRole('button'))
  expect(screen.getByText('Clicked!')).toBeInTheDocument()
})
```

### Testing API Calls
```javascript
// Mock fetch globally or in specific tests
global.fetch = jest.fn()

test('handles API call', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: 'response' })
  })
  
  // Test your component that makes the API call
})
```

### Testing Navigation
```javascript
// Next.js navigation is mocked in jest.setup.js
const mockPush = jest.fn()
jest.mocked(require('next/navigation').useRouter).mockReturnValue({
  push: mockPush,
})

// Test navigation
expect(mockPush).toHaveBeenCalledWith('/expected-route')
```

## Best Practices

### 1. Test Behavior, Not Implementation
- Focus on what the user sees and does
- Avoid testing internal state or implementation details
- Use accessible queries (getByRole, getByLabelText, etc.)

### 2. Use Descriptive Test Names
```javascript
// Good
test('displays error message when login fails')

// Not so good  
test('login error')
```

### 3. Arrange, Act, Assert Pattern
```javascript
test('submits form with correct data', async () => {
  // Arrange
  const user = userEvent.setup()
  render(<LoginForm />)
  
  // Act
  await user.type(screen.getByLabelText(/email/i), 'test@example.com')
  await user.click(screen.getByRole('button', { name: /submit/i }))
  
  // Assert
  expect(mockApiCall).toHaveBeenCalledWith({ email: 'test@example.com' })
})
```

### 4. Clean Up Between Tests
```javascript
beforeEach(() => {
  jest.clearAllMocks()
  localStorage.clear()
})
```

### 5. Mock External Dependencies
- API calls
- Next.js navigation
- Third-party libraries
- Browser APIs (localStorage, etc.)

## Common Testing Patterns

### Testing Forms
```javascript
test('validates required fields', async () => {
  const user = userEvent.setup()
  render(<LoginForm />)
  
  await user.click(screen.getByRole('button', { name: /submit/i }))
  
  expect(screen.getByLabelText(/email/i)).toBeRequired()
})
```

### Testing Conditional Rendering
```javascript
test('shows loading state', () => {
  render(<Component loading={true} />)
  expect(screen.getByText(/loading/i)).toBeInTheDocument()
})
```

### Testing Accessibility
```javascript
test('is accessible', () => {
  render(<Component />)
  
  // Check for proper labeling
  expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
  
  // Check for proper heading structure
  expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
})
```

## Coverage Goals
- **Statements**: 80%+
- **Branches**: 75%+  
- **Functions**: 80%+
- **Lines**: 80%+

## Debugging Tests

### Run with verbose output
```bash
pnpm test --verbose
```

### Debug specific test
```bash
pnpm test --testNamePattern="specific test" --verbose
```

### View DOM structure during test
```javascript
import { screen } from '@testing-library/react'

test('debug test', () => {
  render(<Component />)
  screen.debug() // Prints current DOM structure
})
```
