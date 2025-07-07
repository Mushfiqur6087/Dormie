import { cn } from '@/lib/utils'

describe('Utils', () => {
  describe('cn function', () => {
    test('combines class names correctly', () => {
      const result = cn('bg-red-500', 'text-white', 'p-4')
      expect(result).toContain('bg-red-500')
      expect(result).toContain('text-white')
      expect(result).toContain('p-4')
    })

    test('handles conditional classes', () => {
      const isActive = true
      const result = cn('base-class', isActive && 'active-class')
      expect(result).toContain('base-class')
      expect(result).toContain('active-class')
    })

    test('handles falsy conditional classes', () => {
      const isActive = false
      const result = cn('base-class', isActive && 'active-class')
      expect(result).toContain('base-class')
      expect(result).not.toContain('active-class')
    })

    test('handles undefined and null values', () => {
      const result = cn('base-class', undefined, null, 'other-class')
      expect(result).toContain('base-class')
      expect(result).toContain('other-class')
    })

    test('merges conflicting Tailwind classes correctly', () => {
      // This tests the tailwind-merge functionality
      const result = cn('p-4 p-6')
      // Should keep only the last conflicting class
      expect(result).toContain('p-6')
      expect(result).not.toContain('p-4')
    })
  })
})
