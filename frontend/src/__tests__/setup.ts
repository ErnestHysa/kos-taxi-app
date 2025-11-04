import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Reset spies/mocks automatically between tests
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
