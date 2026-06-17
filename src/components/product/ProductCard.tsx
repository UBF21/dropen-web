import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import type { Product } from '@/types'
import { formatCurrency } from '@/lib/currency'
import { productImgSrc } from '@/lib/utils'
import { useLowStockThreshold } from '@/hooks/useSiteSettings'

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
  const lowStockThreshold = useLowStockThreshold()
  const imageUrl = getPrimaryImageUrl(product)
  const totalStock = getTotalStock(product)
  const outOfStock = totalStock === 0
  const lowStock = !outOfStock && totalStock <= lowStockThreshold

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
            src={productImgSrc(imageUrl)}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${outOfStock ? 'grayscale' : 'group-hover:scale-[1.03]'}`}
          />
          {!outOfStock && (
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
          )}
          {lowStock && (
            <div className="absolute bottom-0 inset-x-0 z-10 h-8 bg-background/85 backdrop-blur-sm flex items-center gap-2.5 px-3">
              <span className="block h-3.5 w-px bg-accent shrink-0" aria-hidden="true" />
              <span className="text-accent text-[11px] font-semibold tracking-[0.2em] uppercase">
                Últimas {totalStock} unidades
              </span>
            </div>
          )}
          {outOfStock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <span className="font-display font-bold text-lg tracking-[0.3em] uppercase text-text-primary">
                Agotado
              </span>
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
