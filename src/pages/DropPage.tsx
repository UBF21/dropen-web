import { useParams, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useCollection, useProductsByCollection } from '@/hooks/useProducts'
import ProductCard from '@/components/product/ProductCard'
import { Skeleton } from '@/components/ui/skeleton'

export default function DropPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { collection, loading: colLoading } = useCollection(slug)
  const collectionId = collection?.id ?? ''
  const { products, loading: prodLoading } = useProductsByCollection(collectionId)
  const loading = colLoading || (!!collectionId && prodLoading)

  return (
    <div className="min-h-screen">
      <div className="relative h-64 md:h-96 bg-surface overflow-hidden">
        {collection?.cover_url && (
          <img
            src={`${collection.cover_url}?width=1200&quality=80`}
            alt={collection.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-8 left-8">
          <Link
            to="/colecciones"
            className="flex items-center gap-1 text-text-muted text-sm mb-4 hover:text-text-primary"
          >
            <ChevronLeft className="w-4 h-4" />
            Colecciones
          </Link>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-text-primary">
            {colLoading ? '...' : (collection?.name ?? 'Drop')}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] bg-surface" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-text-muted text-center py-20">
            No hay productos en esta colección.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
