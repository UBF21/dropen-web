import { useCollections } from '@/hooks/useProducts'
import DropsGrid from '@/components/home/DropsGrid'
import { Skeleton } from '@/components/ui/skeleton'

export default function CatalogPage() {
  const { collections, loading } = useCollections()

  return (
    <div className="min-h-screen">
      <div className="pt-24 pb-4 px-4 max-w-7xl mx-auto">
        <h1 className="font-display font-bold text-4xl tracking-[0.2em] uppercase text-text-primary">
          Colecciones
        </h1>
      </div>
      {loading ? (
        <section className="px-4 max-w-7xl mx-auto py-12 space-y-8">
          <Skeleton className="h-12 w-64 bg-surface" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] bg-surface" />
            ))}
          </div>
        </section>
      ) : (
        <DropsGrid collections={collections} />
      )}
    </div>
  )
}
