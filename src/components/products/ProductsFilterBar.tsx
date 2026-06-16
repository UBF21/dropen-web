import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SlidersHorizontal, X, ChevronDown, Check } from 'lucide-react'
import type { CatalogFilters } from '@/hooks/useProductsCatalog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

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
  const [sortOpen, setSortOpen] = useState(false)
  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === filters.orden)?.label ?? 'Ordenar'

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

          <Popover open={sortOpen} onOpenChange={setSortOpen}>
            <PopoverTrigger asChild>
              <button
                aria-label="Ordenar por"
                aria-expanded={sortOpen}
                className="flex items-center gap-1.5 h-[30px] px-2 border border-border bg-transparent text-[11px] font-semibold uppercase tracking-[0.15em] text-text-muted hover:border-text-muted hover:text-text-primary focus-visible:outline-none focus-visible:border-accent transition-colors"
              >
                {currentSortLabel}
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-150 ${sortOpen ? 'rotate-180' : ''}`}
                />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={6}
              className="w-[190px] p-0 rounded-none border border-border bg-surface shadow-xl gap-0"
            >
              {SORT_OPTIONS.map((o) => {
                const isSelected = filters.orden === o.value
                return (
                  <button
                    key={o.value}
                    onClick={() => {
                      onFiltersChange({ orden: o.value as CatalogFilters['orden'] })
                      setSortOpen(false)
                    }}
                    className={`w-full text-left flex items-center justify-between px-3 py-2.5 text-[11px] uppercase tracking-[0.1em] transition-colors hover:bg-background ${
                      isSelected ? 'text-accent font-semibold' : 'text-text-muted'
                    }`}
                  >
                    {o.label}
                    {isSelected && <Check className="w-3 h-3 shrink-0" />}
                  </button>
                )
              })}
            </PopoverContent>
          </Popover>

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
