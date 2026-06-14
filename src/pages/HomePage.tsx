import { useCollections, useAllProducts } from '@/hooks/useProducts'
import HeroParallax from '@/components/home/HeroParallax'
import DropsGrid from '@/components/home/DropsGrid'
import BrandStatement from '@/components/home/BrandStatement'
import MarqueeTicker from '@/components/home/MarqueeTicker'
import { AnimatedSectionTitle } from '@/components/ui/animated-section-title'
import { Skeleton } from '@/components/ui/skeleton'
import ProductCard from '@/components/product/ProductCard'
import PageMeta from '@/components/seo/PageMeta'

export default function HomePage() {
  const { collections, loading: loadingCollections } = useCollections()
  const { products, loading: loadingProducts } = useAllProducts()
  const featured = products.slice(0, 4)
  const loading = loadingCollections || loadingProducts

  return (
    <>
      <PageMeta title="DROPEN" description="Jeans baggy premium. Streetwear consciente desde Lima." />
      <HeroParallax />
      <MarqueeTicker />
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
          <AnimatedSectionTitle className="font-display font-bold text-3xl tracking-widest text-text-primary mb-12 uppercase">
            Destacados
          </AnimatedSectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4] bg-surface" />
                ))
              : featured.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
          </div>
        </div>
      </section>
      <BrandStatement />
    </>
  )
}
