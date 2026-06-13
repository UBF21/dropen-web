import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ChevronLeft } from 'lucide-react'
import { useProduct } from '@/hooks/useProducts'
import { useCart } from '@/hooks/useCart'
import { useUIStore } from '@/store/ui.store'
import ProductGallery from '@/components/product/ProductGallery'
import VariantSelector from '@/components/product/VariantSelector'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import PageMeta from '@/components/seo/PageMeta'

export default function ProductPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { product, loading } = useProduct(slug)
  const { addProductVariant } = useCart()
  const openCart = useUIStore((s) => s.openCart)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)

  const selectedVariant = product?.variants?.find((v) => v.id === selectedVariantId)
  const outOfStock = selectedVariant ? selectedVariant.stock === 0 : false

  function handleAddToCart() {
    if (!product || !selectedVariant) {
      toast.error('Seleccioná una talla y color antes de agregar al carrito.')
      return
    }
    addProductVariant(product, selectedVariant)
    toast.success(`${product.name} agregado al carrito`)
    openCart()
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 grid grid-cols-1 md:grid-cols-2 gap-12">
        <Skeleton className="aspect-[3/4] bg-surface" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-48 bg-surface" />
          <Skeleton className="h-6 w-32 bg-surface" />
          <Skeleton className="h-40 w-full bg-surface" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <p className="text-text-muted">Producto no encontrado.</p>
        <Link to="/colecciones" className="text-accent hover:underline mt-4 inline-block">
          Ver colecciones
        </Link>
      </div>
    )
  }

  const collectionSlug = product.collection?.slug ?? null

  return (
    <div className="max-w-6xl mx-auto px-4 py-24">
      {product && (
        <PageMeta
          title={product.name}
          description={product.description ?? undefined}
        />
      )}
      <Link
        to={collectionSlug ? `/colecciones/${collectionSlug}` : '/colecciones'}
        className="flex items-center gap-1 text-text-muted text-sm mb-8 hover:text-text-primary transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        {product.collection?.name ?? 'Colecciones'}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <ProductGallery images={product.images ?? []} productName={product.name} />

        <div className="space-y-8">
          <div>
            <p className="text-text-muted text-xs uppercase tracking-[0.2em] mb-2">
              {product.collection?.name}
            </p>
            <h1 className="font-display font-bold text-4xl text-text-primary tracking-wide">
              {product.name}
            </h1>
            <p className="mt-3 text-2xl text-accent font-medium">
              S/ {product.price.toFixed(2)}
            </p>
          </div>

          {product.description && (
            <p className="text-text-muted text-sm leading-relaxed">{product.description}</p>
          )}

          {product.variants && product.variants.length > 0 && (
            <VariantSelector
              variants={product.variants}
              selectedVariantId={selectedVariantId}
              onSelect={setSelectedVariantId}
            />
          )}

          <Button
            onClick={handleAddToCart}
            disabled={!selectedVariantId || outOfStock}
            className="w-full bg-accent hover:bg-accent-hover text-background py-4 text-xs tracking-[0.2em] uppercase rounded-none disabled:opacity-50"
          >
            {outOfStock
              ? 'Agotado'
              : !selectedVariantId
              ? 'Seleccioná talla y color'
              : 'Agregar al carrito'}
          </Button>
        </div>
      </div>
    </div>
  )
}
