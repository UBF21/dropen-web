import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import type { CatalogProduct } from '@/hooks/useProductsCatalog'
import { formatCurrency } from '@/lib/currency'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

interface CatalogCardProps {
  product: CatalogProduct
}

function CatalogProductCard({ product }: CatalogCardProps) {
  const outOfStock = product.total_stock === 0

  return (
    <motion.div variants={item}>
      <Link
        to={`/productos/${product.slug}`}
        className="group block"
      >
        <div className="relative overflow-hidden aspect-[3/4] bg-surface mb-3">
          {product.primary_image_url ? (
            <img
              src={`${product.primary_image_url}?width=600&quality=80`}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-text-muted text-sm">
              Sin imagen
            </div>
          )}
          {product.primary_image_url && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <span className="text-text-primary text-xs tracking-[0.2em] uppercase font-medium">
                Ver producto
              </span>
            </div>
          )}
          {outOfStock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <Badge variant="secondary">Agotado</Badge>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="font-body font-medium text-text-primary group-hover:text-accent transition-colors text-sm">
            {product.name}
          </h3>
          <p className="font-body text-accent font-medium text-sm">
            {formatCurrency(product.price, product.moneda_code)}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}

interface Props {
  products: CatalogProduct[]
  animationKey: string
}

export default function ProductsGrid({ products, animationKey }: Props) {
  return (
    <motion.div
      key={animationKey}
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
    >
      {products.map((p) => (
        <CatalogProductCard key={p.id} product={p} />
      ))}
    </motion.div>
  )
}
