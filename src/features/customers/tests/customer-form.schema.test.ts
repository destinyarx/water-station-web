import { describe, it, expect } from 'vitest'
import { customerFormSchema } from '../customers.schema'

const validInput = {
  name: 'Crystal Springs',
  isBusiness: false,
  contactNumber: '09171234567',
  facebookUrl: 'https://facebook.com/crystal',
  streetAddress: '123 Main St',
  barangay: 'San Antonio',
  municipality: 'Pasig',
  province: 'Metro Manila',
  latitude: '14.5995',
  longitude: '120.9842',
}

describe('customerFormSchema', () => {
  it('accepts a fully populated valid input', () => {
    const result = customerFormSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('accepts the minimal input of just a name', () => {
    const result = customerFormSchema.safeParse({
      name: 'Walk-in',
      isBusiness: false,
      contactNumber: '',
      facebookUrl: '',
      streetAddress: '',
      barangay: '',
      municipality: '',
      province: '',
      latitude: '',
      longitude: '',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an empty name', () => {
    const result = customerFormSchema.safeParse({ ...validInput, name: '   ' })
    expect(result.success).toBe(false)
  })

  it('rejects a name longer than 100 characters', () => {
    const result = customerFormSchema.safeParse({
      ...validInput,
      name: 'a'.repeat(101),
    })
    expect(result.success).toBe(false)
  })

  it('rejects a contact number longer than 15 characters', () => {
    const result = customerFormSchema.safeParse({
      ...validInput,
      contactNumber: '1'.repeat(16),
    })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid facebook url', () => {
    const result = customerFormSchema.safeParse({
      ...validInput,
      facebookUrl: 'not-a-url',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a latitude outside the valid range', () => {
    const result = customerFormSchema.safeParse({
      ...validInput,
      latitude: '120',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a longitude outside the valid range', () => {
    const result = customerFormSchema.safeParse({
      ...validInput,
      longitude: '200',
    })
    expect(result.success).toBe(false)
  })

  it('parses coordinate strings into numbers', () => {
    const result = customerFormSchema.safeParse(validInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.latitude).toBe(14.5995)
      expect(result.data.longitude).toBe(120.9842)
    }
  })

  it('treats blank coordinate strings as undefined', () => {
    const result = customerFormSchema.safeParse({
      ...validInput,
      latitude: '',
      longitude: '',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.latitude).toBeUndefined()
      expect(result.data.longitude).toBeUndefined()
    }
  })
})
