import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface CatalogFilters {
  precioMin: number
  precioMax: number
  tallas: string[]
  colores: string[]
  soloStock: boolean
  orden: 'recent' | 'price_asc' | 'price_desc' | 'name_asc' | 'popular'
  pagina: number
  porPagina: number
}

export interface CatalogProduct {
  id: string
  name: string
  slug: string
  price: number
  moneda_code: string
  primary_image_url: string | null
  total_stock: number
}

export interface CatalogMeta {
  price_min: number
  price_max: number
  available_sizes: string[]
  available_colors: string[]
}

interface UseCatalogResult {
  products: CatalogProduct[]
  totalCount: number
  totalPages: number
  loading: boolean
  error: string | null
}

interface UseCatalogMetaResult {
  meta: CatalogMeta | null
  loading: boolean
}

export function useProductsCatalogMeta(): UseCatalogMetaResult {
  const [meta, setMeta] = useState<CatalogMeta | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.resolve(
      supabase.rpc('get_products_catalog_meta')
    )
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error && data) setMeta(data as CatalogMeta)
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { meta, loading }
}

export function useProductsCatalog(filters: CatalogFilters): UseCatalogResult {
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const tallasKey = [...filters.tallas].sort().join(',')
  const coloresKey = [...filters.colores].sort().join(',')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.resolve(
      supabase.rpc('get_products_catalog', {
        p_filters: {
          precio_min: filters.precioMin,
          precio_max: filters.precioMax,
          tallas: filters.tallas,
          colores: filters.colores,
          solo_stock: filters.soloStock,
          orden: filters.orden,
          pagina: filters.pagina,
          por_pagina: filters.porPagina,
        },
      })
    )
      .then(({ data, error: err }) => {
        if (cancelled) return
        if (err) {
          setError(err.message)
          setProducts([])
          setTotalCount(0)
        } else {
          type Row = CatalogProduct & { total_count: number }
          const rows = (data as Row[]) ?? []
          setProducts(rows.map(({ total_count: _tc, ...p }) => p))
          setTotalCount(rows[0]?.total_count ?? 0)
        }
        setLoading(false)
      })
      .catch((e: Error) => {
        if (cancelled) return
        setError(e.message)
        setProducts([])
        setTotalCount(0)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.precioMin,
    filters.precioMax,
    tallasKey,
    coloresKey,
    filters.soloStock,
    filters.orden,
    filters.pagina,
    filters.porPagina,
  ])

  return {
    products,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / filters.porPagina)),
    loading,
    error,
  }
}
