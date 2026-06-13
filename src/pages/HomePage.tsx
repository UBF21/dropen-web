import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  COLLECTION_FIELDS,
  PRODUCT_FIELDS,
} from '@/lib/query-fields'
import type { Collection, Product } from '@/types'
import HeroParallax from '@/components/home/HeroParallax'
import DropsGrid from '@/components/home/DropsGrid'
import BrandStatement from '@/components/home/BrandStatement'
import { Skeleton } from '@/components/ui/skeleton'

export default function HomePage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [colRes, prodRes] = await Promise.all([
        supabase
          .from('collections')
          .select(COLLECTION_FIELDS)
          .eq('active', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('products')
          .select(PRODUCT_FIELDS)
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(6),
      ])
      if (colRes.data) setCollections(colRes.data as Collection[])
      if (prodRes.data) setFeatured(prodRes.data as Product[])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <>
      <HeroParallax />
      {loading ? (
        <section className="py-20 px-4 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] bg-surface" />
            ))}
          </div>
        </section>
      ) : (
        <DropsGrid collections={collections} limit={2} />
      )}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display font-bold text-3xl tracking-widest text-text-primary mb-12 uppercase">
            Destacados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4] bg-surface" />
                ))
              : featured.map((p) => (
                  <div key={p.id} className="aspect-[3/4] bg-surface border border-border flex items-end p-4">
                    <div>
                      <p className="text-text-primary text-sm font-medium">{p.name}</p>
                      <p className="text-accent text-sm">S/ {p.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>
      <BrandStatement />
    </>
  )
}
