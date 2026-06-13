import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface VariantWithProduct {
  id: string
  sku: string
  size: string
  color: string
  stock: number
  product: { id: string; name: string }
}

interface UseVariantsResult {
  variants: VariantWithProduct[]
  loading: boolean
  error: string | null
  loadVariants: () => Promise<void>
}

interface VariantRow {
  id: string
  sku: string
  size: string
  color: string
  stock: number
  product: { id: string; name: string } | { id: string; name: string }[] | null
}

function normalizeProduct(raw: VariantRow['product']): { id: string; name: string } {
  if (!raw) return { id: '', name: '—' }
  return Array.isArray(raw) ? raw[0] : raw
}

export function useVariants(): UseVariantsResult {
  const [variants, setVariants] = useState<VariantWithProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadVariants = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('product_variants')
        .select('id, sku, size, color, stock, product:products(id, name)')
        .order('sku')

      if (err) throw err
      setVariants(
        ((data ?? []) as unknown as VariantRow[]).map(row => ({
          id: row.id,
          sku: row.sku,
          size: row.size,
          color: row.color,
          stock: row.stock,
          product: normalizeProduct(row.product),
        }))
      )
    } catch {
      setError('No se pudieron cargar las variantes.')
    } finally {
      setLoading(false)
    }
  }, [])

  return { variants, loading, error, loadVariants }
}
