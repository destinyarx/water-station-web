import { beforeEach, describe, expect, it } from 'vitest'

import {
  dismissToast,
  getToasts,
  toast,
} from './toast-store'

describe('toast store', () => {
  beforeEach(() => {
    getToasts().forEach((item) => dismissToast(item.id))
  })

  it('keeps only the five most recent toasts', () => {
    for (let index = 1; index <= 6; index += 1) {
      toast.error(`Error ${index}`, { autoClose: false })
    }

    expect(getToasts().map((item) => item.message)).toEqual([
      'Error 2',
      'Error 3',
      'Error 4',
      'Error 5',
      'Error 6',
    ])
  })
})
