import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/types'

interface Props {
  product: Product
  index?: number
}

function getPrimaryImageUrl(product: Product): string | null {
  if (!product.images?.length) return null
  return (
    product.images.find((i) => i.is_primary)?.url ??
    [...product.images].sort((a, b) => a.order - b.order)[0].url
  )
}

function getTotalStock(product: Product): number {
  return product.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0
}

export default function ProductCard({ product, index = 0 }: Props) {
  const prefersReduced = useReducedMotion()
  const imageUrl = getPrimaryImageUrl(product)
  const outOfStock = getTotalStock(product) === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: prefersReduced ? 0 : 0.5,
        delay: prefersReduced ? 0 : index * 0.1,
      }}
    >
      <Link
        to={`/productos/${product.slug}`}
        className="group block"
        aria-label={product.name}
      >
        <div className="relative overflow-hidden aspect-[3/4] bg-surface mb-4">
          {imageUrl ? (
            <img
              src={`${imageUrl}?width=600&quality=80`}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-text-muted text-sm">
              Sin imagen
            </div>
          )}
          {outOfStock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <Badge variant="secondary">Agotado</Badge>
            </div>
          )}
        </div>
        <div className="space-y-1">
          {product.collection && (
            <p className="font-body text-xs text-text-muted uppercase tracking-wider">
              {product.collection.name}
            </p>
          )}
          <h3 className="font-body font-medium text-text-primary group-hover:text-accent transition-colors">
            {product.name}
          </h3>
          <p className="font-body text-accent font-medium">S/ {product.price.toFixed(2)}</p>
        </div>
      </Link>
    </motion.div>
  )
}
