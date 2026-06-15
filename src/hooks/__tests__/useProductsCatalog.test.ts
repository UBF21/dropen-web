import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockRpc } from '@/test/mocks/supabase'
import {
  useProductsCatalog,
  useProductsCatalogMeta,
  type CatalogFilters,
} from '../useProductsCatalog'

const DEFAULT_FILTERS: CatalogFilters = {
  precioMin: 0,
  precioMax: 9999,
  tallas: [],
  colores: [],
  soloStock: false,
  orden: 'recent',
  pagina: 1,
  porPagina: 12,
}

const PRODUCT_ROW = {
  id: 'p1',
  name: 'Jean Baggy',
  slug: 'jean-baggy',
  price: 189,
  moneda_code: 'PEN',
  primary_image_url: null,
  total_stock: 5,
  total_count: 1,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useProductsCatalog', () => {
  it('retorna productos cuando la RPC responde correctamente', async () => {
    mockRpc.mockResolvedValue({ data: [PRODUCT_ROW], error: null })
    const { result } = renderHook(() => useProductsCatalog(DEFAULT_FILTERS))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.products).toHaveLength(1)
    expect(result.current.products[0].name).toBe('Jean Baggy')
    expect(result.current.totalCount).toBe(1)
    expect(result.current.totalPages).toBe(1)
  })

  it('retorna lista vacía y totalCount 0 cuando la RPC retorna []', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null })
    const { result } = renderHook(() => useProductsCatalog(DEFAULT_FILTERS))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.products).toHaveLength(0)
    expect(result.current.totalCount).toBe(0)
  })

  it('setea error cuando la RPC falla', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const { result } = renderHook(() => useProductsCatalog(DEFAULT_FILTERS))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('DB error')
    expect(result.current.products).toHaveLength(0)
  })

  it('loading es true al inicio', () => {
    mockRpc.mockResolvedValue({ data: [], error: null })
    const { result } = renderHook(() => useProductsCatalog(DEFAULT_FILTERS))
    expect(result.current.loading).toBe(true)
  })

  it('calcula totalPages correctamente', async () => {
    const rows = Array.from({ length: 5 }, (_, i) => ({ ...PRODUCT_ROW, id: `p${i}`, total_count: 25 }))
    mockRpc.mockResolvedValue({ data: rows, error: null })
    const { result } = renderHook(() => useProductsCatalog({ ...DEFAULT_FILTERS, porPagina: 12 }))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.totalPages).toBe(3)
  })
})

describe('useProductsCatalogMeta', () => {
  it('retorna metadata cuando la RPC responde', async () => {
    mockRpc.mockResolvedValue({
      data: { price_min: 50, price_max: 500, available_sizes: ['32', '34'], available_colors: ['Black'] },
      error: null,
    })
    const { result } = renderHook(() => useProductsCatalogMeta())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.meta?.price_min).toBe(50)
    expect(result.current.meta?.available_sizes).toEqual(['32', '34'])
  })

  it('meta es null si la RPC falla', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'err' } })
    const { result } = renderHook(() => useProductsCatalogMeta())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.meta).toBeNull()
  })
})
