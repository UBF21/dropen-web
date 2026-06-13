import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn(),
        }),
      }),
      update: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
  },
}))

import { supabase } from '@/lib/supabase'
import { createReservations } from '../reservations'
import type { CartItem } from '@/types'

const item: CartItem = {
  variantId: 'variant-1',
  productId: 'product-1',
  productName: 'Jean Baggy Cargo',
  size: '32',
  color: 'Black',
  price: 189,
  quantity: 1,
  imageUrl: '',
}

beforeEach(() => {
  vi.clearAllMocks()
  // Reset the mock chain
  const singleMock = vi.fn()
  const selectMock = vi.fn().mockReturnValue({ single: singleMock })
  const insertMock = vi.fn().mockReturnValue({ select: selectMock })
  const inMock = vi.fn().mockResolvedValue({ error: null })
  const updateMock = vi.fn().mockReturnValue({ in: inMock })
  ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
    insert: insertMock,
    update: updateMock,
  })
  // Store for access in tests
  ;(supabase as unknown as { _singleMock: typeof singleMock })._singleMock = singleMock
})

describe('createReservations', () => {
  it('retorna success true con ids y referencia cuando todo va bien', async () => {
    const singleMock = (supabase as unknown as { _singleMock: ReturnType<typeof vi.fn> })._singleMock
    singleMock.mockResolvedValueOnce({ data: { id: 'abc12345-0000-0000-0000-000000000000' }, error: null })

    const result = await createReservations([item])

    expect(result.success).toBe(true)
    expect(result.reservationIds).toHaveLength(1)
    expect(result.reference).toMatch(/^DRP-/)
    expect(result.expiresAt).toBeTruthy()
  })

  it('retorna success false si Supabase lanza error', async () => {
    const singleMock = (supabase as unknown as { _singleMock: ReturnType<typeof vi.fn> })._singleMock
    singleMock.mockResolvedValueOnce({ data: null, error: { message: 'Stock insuficiente' } })

    const result = await createReservations([item])

    expect(result.success).toBe(false)
    expect(result.error).toBe('Stock insuficiente')
  })

  it('llama insert con variant_id y quantity correctos', async () => {
    const singleMock = (supabase as unknown as { _singleMock: ReturnType<typeof vi.fn> })._singleMock
    singleMock.mockResolvedValueOnce({ data: { id: 'uuid-1' }, error: null })

    await createReservations([item])

    const fromMock = supabase.from as ReturnType<typeof vi.fn>
    expect(fromMock).toHaveBeenCalledWith('reservations')
  })
})
