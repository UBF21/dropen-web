import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { CatalogProduct } from '@/hooks/useProductsCatalog'
import { formatCurrency } from '@/lib/currency'
import { productImgSrc } from '@/lib/utils'
import { useLowStockThreshold } from '@/hooks/useSiteSettings'

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
  const lowStockThreshold = useLowStockThreshold()
  const outOfStock = product.total_stock === 0
  const lowStock = !outOfStock && product.total_stock <= lowStockThreshold

  return (
    <motion.div variants={item}>
      <Link
        to={`/productos/${product.slug}`}
        className="group block"
      >
        <div className="relative overflow-hidden aspect-[3/4] bg-surface mb-3">
          <img
            src={productImgSrc(product.primary_image_url)}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${outOfStock ? 'grayscale' : ''}`}
          />
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <span className="text-text-primary text-xs tracking-[0.2em] uppercase font-medium">
              Ver producto
            </span>
          </div>
          {lowStock && (
            <div className="absolute bottom-0 inset-x-0 z-10 h-8 bg-background/85 backdrop-blur-sm flex items-center gap-2.5 px-3">
              <span className="block h-3.5 w-px bg-accent shrink-0" aria-hidden="true" />
              <span className="text-accent text-[11px] font-semibold tracking-[0.2em] uppercase">
                Últimas {product.total_stock} unidades
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
