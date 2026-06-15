import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/types'
import { formatCurrency } from '@/lib/currency'

interface Props {
  product: Product
  index?: number
}

const DEFAULT_PRODUCT_IMAGE =
  'https://icfqhtiujsboyrggxpqu.supabase.co/storage/v1/object/public/product-images/marzuk-nike-5578104_1920.jpg'

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
          <img
            src={imageUrl ? `${imageUrl}?width=600&quality=80` : DEFAULT_PRODUCT_IMAGE}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-background/50 backdrop-blur-[2px] flex items-center justify-center pointer-events-none"
          >
            <span className="text-text-primary text-xs tracking-[0.2em] uppercase font-medium">
              Ver producto
            </span>
          </motion.div>
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
          <p className="font-body text-accent font-medium">{formatCurrency(product.price, product.moneda_code)}</p>
        </div>
      </Link>
    </motion.div>
  )
}
