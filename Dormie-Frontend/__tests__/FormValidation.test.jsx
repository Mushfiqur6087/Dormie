import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock form validation utilities
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

const validateStudentId = (id) => {
  return /^\d{4,}$/.test(id)
}

const validateRequired = (value) => {
  return value && value.trim().length > 0
}

const validateMinLength = (value, minLength) => {
  return value && value.length >= minLength
}

const validateMaxLength = (value, maxLength) => {
  return !value || value.length <= maxLength
}

const validateNumeric = (value) => {
  return /^\d+$/.test(value)
}

const validateAlphabetic = (value) => {
  return /^[a-zA-Z\s]+$/.test(value)
}

const sanitizeInput = (input) => {
  return input.trim().replace(/[<>\"']/g, '')
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
  }).format(amount)
}

describe('Form Validation Utilities', () => {
  test('validates email addresses correctly', () => {
    expect(validateEmail('test@example.com')).toBe(true)
    expect(validateEmail('user.name@domain.co.uk')).toBe(true)
    expect(validateEmail('invalid-email')).toBe(false)
    expect(validateEmail('test@')).toBe(false)
    expect(validateEmail('@domain.com')).toBe(false)
    expect(validateEmail('')).toBe(false)
  })

  test('validates phone numbers correctly', () => {
    expect(validatePhone('01712345678')).toBe(true)
    expect(validatePhone('+8801712345678')).toBe(true)
    expect(validatePhone('017-123-45678')).toBe(true)
    expect(validatePhone('(017) 123-45678')).toBe(true)
    expect(validatePhone('123')).toBe(false)
    expect(validatePhone('abcd1234567890')).toBe(false)
    expect(validatePhone('')).toBe(false)
  })

  test('validates student ID format', () => {
    expect(validateStudentId('2020123456')).toBe(true)
    expect(validateStudentId('1234')).toBe(true)
    expect(validateStudentId('123')).toBe(false)
    expect(validateStudentId('abc123')).toBe(false)
    expect(validateStudentId('')).toBe(false)
  })



  test('validates maximum length requirements', () => {
    expect(validateMaxLength('short', 10)).toBe(true)
    expect(validateMaxLength('this is a very long string', 10)).toBe(false)
    expect(validateMaxLength('', 10)).toBe(true)
    expect(validateMaxLength(null, 10)).toBe(true)
    expect(validateMaxLength('exactly10!', 10)).toBe(true)
  })

  test('validates numeric inputs', () => {
    expect(validateNumeric('123456')).toBe(true)
    expect(validateNumeric('0')).toBe(true)
    expect(validateNumeric('abc123')).toBe(false)
    expect(validateNumeric('12.34')).toBe(false)
    expect(validateNumeric('')).toBe(false)
  })

  test('validates alphabetic inputs', () => {
    expect(validateAlphabetic('John Doe')).toBe(true)
    expect(validateAlphabetic('Mary Jane Watson')).toBe(true)
    expect(validateAlphabetic('John123')).toBe(false)
    expect(validateAlphabetic('Name-with-dash')).toBe(false)
    expect(validateAlphabetic('')).toBe(false)
  })

  test('sanitizes input correctly', () => {
    expect(sanitizeInput('  Normal input  ')).toBe('Normal input')
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert(xss)/script')
    expect(sanitizeInput('Text with "quotes" and \'apostrophes\'')).toBe('Text with quotes and apostrophes')
    expect(sanitizeInput('')).toBe('')
  })
})

describe('Form Integration Tests', () => {
  // Mock form component for testing
  const TestForm = ({ onSubmit }) => {
    const [formData, setFormData] = React.useState({
      email: '',
      phone: '',
      studentId: '',
      name: '',
    })
    const [errors, setErrors] = React.useState({})

    const handleSubmit = (e) => {
      e.preventDefault()
      const newErrors = {}

      if (!validateEmail(formData.email)) {
        newErrors.email = 'Invalid email format'
      }
      if (!validatePhone(formData.phone)) {
        newErrors.phone = 'Invalid phone number'
      }
      if (!validateStudentId(formData.studentId)) {
        newErrors.studentId = 'Student ID must be at least 4 digits'
      }
      if (!validateRequired(formData.name)) {
        newErrors.name = 'Name is required'
      }

      setErrors(newErrors)

      if (Object.keys(newErrors).length === 0) {
        onSubmit(formData)
      }
    }

    return React.createElement('form', { onSubmit: handleSubmit },
      React.createElement('input', {
        'data-testid': 'email-input',
        type: 'email',
        value: formData.email,
        onChange: (e) => setFormData({ ...formData, email: e.target.value }),
        placeholder: 'Email'
      }),
      errors.email && React.createElement('div', { 'data-testid': 'email-error' }, errors.email),
      
      React.createElement('input', {
        'data-testid': 'phone-input',
        type: 'tel',
        value: formData.phone,
        onChange: (e) => setFormData({ ...formData, phone: e.target.value }),
        placeholder: 'Phone'
      }),
      errors.phone && React.createElement('div', { 'data-testid': 'phone-error' }, errors.phone),
      
      React.createElement('input', {
        'data-testid': 'student-id-input',
        type: 'text',
        value: formData.studentId,
        onChange: (e) => setFormData({ ...formData, studentId: e.target.value }),
        placeholder: 'Student ID'
      }),
      errors.studentId && React.createElement('div', { 'data-testid': 'student-id-error' }, errors.studentId),
      
      React.createElement('input', {
        'data-testid': 'name-input',
        type: 'text',
        value: formData.name,
        onChange: (e) => setFormData({ ...formData, name: e.target.value }),
        placeholder: 'Name'
      }),
      errors.name && React.createElement('div', { 'data-testid': 'name-error' }, errors.name),
      
      React.createElement('button', { type: 'submit', 'data-testid': 'submit-button' }, 'Submit')
    )
  }

})
