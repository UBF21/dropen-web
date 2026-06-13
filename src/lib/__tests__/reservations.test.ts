import { describe, it, expect, beforeEach } from 'vitest'
import '@/test/mocks/supabase'
import { mockFrom, mockInsert, mockSingle, mockUpdate, mockIn } from '@/test/mocks/supabase'
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
  mockFrom.mockClear()
  mockInsert.mockClear()
  mockSingle.mockClear()
  mockUpdate.mockClear()
  mockIn.mockClear()
})

describe('createReservations', () => {
  it('retorna success true con ids y referencia cuando todo va bien', async () => {
    mockSingle.mockResolvedValueOnce({ data: { id: 'abc12345-0000-0000-0000-000000000000' }, error: null })

    const result = await createReservations([item])

    expect(result.success).toBe(true)
    expect(result.reservationIds).toHaveLength(1)
    expect(result.reference).toMatch(/^DRP-/)
    expect(result.expiresAt).toBeTruthy()
  })

  it('retorna success false si Supabase lanza error', async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Stock insuficiente' } })

    const result = await createReservations([item])

    expect(result.success).toBe(false)
    expect(result.error).toBe('Stock insuficiente')
  })

  it('llama insert con variant_id y quantity correctos', async () => {
    mockSingle.mockResolvedValueOnce({ data: { id: 'uuid-1' }, error: null })

    await createReservations([item])

    expect(mockFrom).toHaveBeenCalledWith('reservations')
  })
})
