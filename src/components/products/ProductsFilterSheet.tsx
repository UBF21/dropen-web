import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import ProductsPriceSlider from './ProductsPriceSlider'
import type { CatalogFilters, CatalogMeta } from '@/hooks/useProductsCatalog'
import { formatCurrency } from '@/lib/currency'

const COLOR_HEX: Record<string, string> = {
  Black:  '#1a1a1a',
  Stone:  '#c8b89a',
  Indigo: '#4a4e8c',
  White:  '#f0ede8',
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: CatalogFilters
  meta: CatalogMeta
  onFiltersChange: (partial: Partial<CatalogFilters>) => void
  onClear: () => void
}

export default function ProductsFilterSheet({
  open,
  onOpenChange,
  filters,
  meta,
  onFiltersChange,
  onClear,
}: Props) {
  function toggleTalla(size: string) {
    const next = filters.tallas.includes(size)
      ? filters.tallas.filter((s) => s !== size)
      : [...filters.tallas, size]
    onFiltersChange({ tallas: next })
  }

  function toggleColor(color: string) {
    const next = filters.colores.includes(color)
      ? filters.colores.filter((c) => c !== color)
      : [...filters.colores, color]
    onFiltersChange({ colores: next })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="bg-surface border-r border-border flex flex-col w-80">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="text-text-primary text-sm tracking-widest uppercase">
            Filtros
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
          {/* Precio */}
          <div>
            <p className="text-xs text-text-muted uppercase tracking-widest mb-4">Precio</p>
            <ProductsPriceSlider
              min={meta.price_min}
              max={meta.price_max}
              value={[filters.precioMin, filters.precioMax]}
              onValueChange={([min, max]) => onFiltersChange({ precioMin: min, precioMax: max })}
              formatValue={(v) => formatCurrency(v, 'PEN')}
            />
          </div>

          {/* Tallas */}
          {meta.available_sizes.length > 0 && (
            <div>
              <p className="text-xs text-text-muted uppercase tracking-widest mb-3">Talla</p>
              <div className="flex flex-wrap gap-2">
                {meta.available_sizes.map((size) => {
                  const selected = filters.tallas.includes(size)
                  return (
                    <button
                      key={size}
                      onClick={() => toggleTalla(size)}
                      aria-pressed={selected}
                      className={`w-10 h-10 text-xs border transition-colors ${
                        selected
                          ? 'border-accent text-accent'
                          : 'border-border text-text-muted hover:border-text-muted'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Colores */}
          {meta.available_colors.length > 0 && (
            <div>
              <p className="text-xs text-text-muted uppercase tracking-widest mb-3">Color</p>
              <div className="flex flex-wrap gap-3">
                {meta.available_colors.map((color) => {
                  const selected = filters.colores.includes(color)
                  const hex = COLOR_HEX[color] ?? '#888888'
                  return (
                    <button
                      key={color}
                      onClick={() => toggleColor(color)}
                      aria-pressed={selected}
                      aria-label={color}
                      style={{ backgroundColor: hex }}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        selected ? 'border-accent scale-110' : 'border-border hover:border-text-muted'
                      }`}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Solo con stock */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted uppercase tracking-widest">Solo con stock</p>
            <button
              role="switch"
              aria-checked={filters.soloStock}
              onClick={() => onFiltersChange({ soloStock: !filters.soloStock })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                filters.soloStock ? 'bg-accent' : 'bg-border'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background transition-transform ${
                  filters.soloStock ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-4 flex gap-3">
          <button
            onClick={onClear}
            className="flex-1 py-2 text-xs text-text-muted border border-border hover:border-text-muted transition-colors uppercase tracking-widest"
          >
            Limpiar
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 py-2 text-xs bg-accent text-background hover:bg-accent/90 transition-colors uppercase tracking-widest"
          >
            Aplicar
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
