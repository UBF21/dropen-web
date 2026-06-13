import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  COLLECTION_FIELDS,
  PRODUCT_FIELDS,
  PRODUCT_WITH_COLLECTION,
} from '@/lib/query-fields'
import type { Collection, Product } from '@/types'

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('collections')
      .select(COLLECTION_FIELDS)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setCollections(data ?? [])
        setLoading(false)
      })
  }, [])

  return { collections, loading, error }
}

export function useCollection(slug: string) {
  const [collection, setCollection] = useState<Collection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    supabase
      .from('collections')
      .select(COLLECTION_FIELDS)
      .eq('slug', slug)
      .single()
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setCollection(data)
        setLoading(false)
      })
  }, [slug])

  return { collection, loading, error }
}

// collectionId no-nullable: pasar string vacío para no ejecutar la query
export function useProductsByCollection(collectionId: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(!!collectionId)

  useEffect(() => {
    if (!collectionId) return
    setLoading(true)
    supabase
      .from('products')
      .select(PRODUCT_FIELDS)
      .eq('collection_id', collectionId)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setProducts((data ?? []) as Product[])
        setLoading(false)
      })
  }, [collectionId])

  return { products, loading }
}

// Todos los productos activos — usar en wholesale y búsqueda global
export function useAllProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('products')
      .select(PRODUCT_FIELDS)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setProducts((data ?? []) as Product[])
        setLoading(false)
      })
  }, [])

  return { products, loading }
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    supabase
      .from('products')
      .select(PRODUCT_WITH_COLLECTION)
      .eq('slug', slug)
      .single()
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setProduct(data as unknown as Product)
        setLoading(false)
      })
  }, [slug])

  return { product, loading, error }
}
