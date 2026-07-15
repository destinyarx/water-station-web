import { describe, expect, it } from 'vitest'

import { documentFormSchema, documentRowSchema } from '../documents.schema'

describe('document schemas', () => {
  it('coerces an optional amount and validates visibility', () => {
    const result = documentFormSchema.parse({ title: 'Permit', category: 'Business Permits', amount: '125.50', visibility: 'only_me' })
    expect(result.amount).toBe(125.5)
  })

  it('requires the storage path shape on database rows', () => {
    const result = documentRowSchema.safeParse({ id: 1 })
    expect(result.success).toBe(false)
  })
})
