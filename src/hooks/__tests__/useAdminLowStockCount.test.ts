import '@/test/mocks/supabase'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockGt, mockFrom } from '@/test/mocks/supabase'
import { useAdminLowStockCount } from '../useAdminLowStockCount'

beforeEach(() => {
  vi.clearAllMocks()
  // Cadena ligera específica para este hook: from → select → lte → gt(Promise)
  mockFrom.mockReturnValue({
    select: () => ({ lte: () => ({ gt: mockGt }) }),
  })
})

describe('useAdminLowStockCount', () => {
  it('retorna el count de variantes en stock bajo', async () => {
    mockGt.mockResolvedValue({ count: 4, error: null })
    const { result } = renderHook(() => useAdminLowStockCount())
    await waitFor(() => expect(result.current.count).toBe(4))
  })

  it('mantiene 0 si la query falla', async () => {
    mockGt.mockResolvedValue({ count: null, error: { message: 'boom' } })
    const { result } = renderHook(() => useAdminLowStockCount())
    await waitFor(() => expect(result.current.count).toBe(0))
  })
})
