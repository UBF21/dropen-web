import { AnimatePresence, motion } from 'framer-motion'
import { SlidersHorizontal, X } from 'lucide-react'
import type { CatalogFilters } from '@/hooks/useProductsCatalog'

interface Props {
  filters: CatalogFilters
  totalCount: number
  onFiltersChange: (partial: Partial<CatalogFilters>) => void
  onClear: () => void
  onOpenFilters: () => void
}

const COLOR_HEX: Record<string, string> = {
  Black:  '#1a1a1a',
  Stone:  '#c8b89a',
  Indigo: '#4a4e8c',
  White:  '#f0ede8',
}

const SORT_OPTIONS = [
  { value: 'recent',     label: 'Más recientes' },
  { value: 'price_asc',  label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'name_asc',   label: 'Nombre A-Z' },
  { value: 'popular',    label: 'Más populares' },
] as const

export default function ProductsFilterBar({
  filters,
  totalCount,
  onFiltersChange,
  onClear,
  onOpenFilters,
}: Props) {
  const hasActiveFilters =
    filters.tallas.length > 0 ||
    filters.colores.length > 0 ||
    filters.soloStock

  return (
    <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-2">
        {/* Fila principal */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onOpenFilters}
            aria-label="Filtros"
            className="flex items-center gap-2 px-3 py-1.5 border border-border text-text-muted hover:border-accent hover:text-text-primary text-xs uppercase tracking-widest transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtros
          </button>

          <select
            value={filters.orden}
            aria-label="Ordenar por"
            onChange={(e) =>
              onFiltersChange({ orden: e.target.value as CatalogFilters['orden'] })
            }
            className="bg-transparent border border-border text-text-muted text-xs px-2 py-1.5 focus:outline-none focus:border-accent hover:border-text-muted transition-colors uppercase tracking-widest cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-surface text-text-primary normal-case tracking-normal">
                {o.label}
              </option>
            ))}
          </select>

          <span className="ml-auto text-xs text-text-muted">
            {totalCount} {totalCount === 1 ? 'producto' : 'productos'}
          </span>

          {hasActiveFilters && (
            <button
              onClick={onClear}
              aria-label="Limpiar filtros"
              className="text-xs text-text-muted hover:text-error transition-colors uppercase tracking-widest"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Chips de filtros activos */}
        <AnimatePresence>
          {(filters.tallas.length > 0 || filters.colores.length > 0 || filters.soloStock) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 overflow-hidden"
            >
              {filters.tallas.map((size) => (
                <motion.span
                  key={`talla-${size}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1 px-2 py-0.5 bg-surface border border-border text-xs text-text-primary"
                >
                  {size}
                  <button
                    onClick={() =>
                      onFiltersChange({ tallas: filters.tallas.filter((s) => s !== size) })
                    }
                    aria-label={`Quitar talla ${size}`}
                    className="text-text-muted hover:text-text-primary"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              ))}

              {filters.colores.map((color) => (
                <motion.span
                  key={`color-${color}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1.5 px-2 py-0.5 bg-surface border border-border text-xs text-text-primary"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block border border-border/50"
                    style={{ backgroundColor: COLOR_HEX[color] ?? '#888' }}
                  />
                  {color}
                  <button
                    onClick={() =>
                      onFiltersChange({ colores: filters.colores.filter((c) => c !== color) })
                    }
                    aria-label={`Quitar color ${color}`}
                    className="text-text-muted hover:text-text-primary"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              ))}

              {filters.soloStock && (
                <motion.span
                  key="solo-stock"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1 px-2 py-0.5 bg-surface border border-border text-xs text-text-primary"
                >
                  Con stock
                  <button
                    onClick={() => onFiltersChange({ soloStock: false })}
                    aria-label="Quitar filtro con stock"
                    className="text-text-muted hover:text-text-primary"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
