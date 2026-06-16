import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createOrder, getOrder } from '../orders'

const mockSingle = vi.fn()
const mockSelectChain = vi.fn(() => ({ single: mockSingle }))
const mockInsert = vi.fn(() => ({ select: mockSelectChain }))
const mockEq = vi.fn(() => ({ single: mockSingle }))
const mockSelectFrom = vi.fn(() => ({ eq: mockEq }))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'orders') {
        return { insert: mockInsert, select: mockSelectFrom }
      }
      return {}
    }),
  },
}))

const BASE_INPUT = {
  reference: 'DRP-ABC12345',
  first_name: 'Felipe',
  last_name: 'Montenegro',
  doc_type: 'DNI' as const,
  doc_number: '74521803',
  phone: '+51999888777',
  address: 'Av. Javier Prado 1520, Miraflores',
  lat: -12.0953,
  lng: -77.0278,
  department: 'Lima',
  province: 'Lima',
  district: 'Miraflores',
  country: 'PE',
  items: [],
  total: 359.0,
  currency: 'PEN',
  reservation_ids: ['uuid-1'],
}

describe('createOrder', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns success with order when insert succeeds', async () => {
    const order = { id: 'order-uuid', ...BASE_INPUT }
    mockSingle.mockResolvedValue({ data: order, error: null })

    const result = await createOrder(BASE_INPUT)

    expect(result.success).toBe(true)
    expect(result.order?.reference).toBe('DRP-ABC12345')
  })

  it('returns error when supabase insert fails', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'DB error' } })

    const result = await createOrder(BASE_INPUT)

    expect(result.success).toBe(false)
    expect(result.error).toBe('DB error')
  })
})

describe('getOrder', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns order data when found', async () => {
    const order = { id: 'order-uuid', reference: 'DRP-ABC12345' }
    mockSingle.mockResolvedValue({ data: order, error: null })

    const result = await getOrder('order-uuid')

    expect(result?.reference).toBe('DRP-ABC12345')
  })

  it('returns null when not found', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } })

    const result = await getOrder('missing-id')

    expect(result).toBeNull()
  })
})
