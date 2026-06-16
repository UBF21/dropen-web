import { motion } from 'framer-motion'
import type { ProductVariant } from '@/types'
import { useLowStockThreshold } from '@/hooks/useSiteSettings'

interface Props {
  variants: ProductVariant[]
  selectedVariantId: string | null
  onSelect: (variantId: string) => void
  fullyAgotado?: boolean
}

const COLOR_HEX: Record<string, string> = {
  Black:  '#1a1a1a',
  Stone:  '#c8b89a',
  Indigo: '#4a4e8c',
  White:  '#f0ede8',
}

function uniqueSorted(arr: string[]): string[] {
  return [...new Set(arr)].sort((a, b) => parseInt(a) - parseInt(b) || a.localeCompare(b))
}

export default function VariantSelector({ variants, selectedVariantId, onSelect, fullyAgotado = false }: Props) {
  const lowStockThreshold = useLowStockThreshold()
  const selected = variants.find((v) => v.id === selectedVariantId)
  const sizes  = uniqueSorted(variants.map((v) => v.size))
  const colors = [...new Set(variants.map((v) => v.color))]

  function findVariant(size: string, color: string): ProductVariant | undefined {
    return variants.find((v) => v.size === size && v.color === color)
  }

  function pickVariant(size: string, color: string): void {
    const exact = findVariant(size, color)
    if (exact) { onSelect(exact.id); return }
    // Si no hay combinación exacta, buscar primera variante con esa talla con stock
    const fallback = variants.find((v) => v.size === size && v.stock > 0)
    if (fallback) onSelect(fallback.id)
  }

  if (fullyAgotado) {
    return (
      <div className="py-6 border border-border flex items-center justify-center gap-3" aria-label="Producto agotado">
        <span className="block h-4 w-px bg-border" aria-hidden="true" />
        <span className="font-display font-bold text-sm tracking-[0.35em] uppercase text-text-muted">
          Agotado
        </span>
        <span className="block h-4 w-px bg-border" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-text-muted uppercase tracking-widest mb-3">
          Talla{selected ? ` — ${selected.size}` : ''}
        </p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const v = findVariant(size, selected?.color ?? colors[0])
            const isSelected = selected?.size === size
            const noStock = (v?.stock ?? 0) === 0
            return (
              <motion.button
                key={size}
                whileTap={{ scale: 0.92 }}
                transition={{ duration: 0.1 }}
                onClick={() => pickVariant(size, selected?.color ?? colors[0])}
                disabled={noStock}
                aria-pressed={isSelected}
                className={`w-12 h-12 text-sm border transition-all ${
                  isSelected    ? 'border-accent text-accent' :
                  noStock       ? 'border-border text-text-muted opacity-40 cursor-not-allowed line-through' :
                                  'border-border text-text-primary hover:border-accent'
                }`}
              >
                {size}
              </motion.button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="text-xs text-text-muted uppercase tracking-widest mb-3">
          Color{selected ? ` — ${selected.color}` : ''}
        </p>
        <div className="flex gap-3">
          {colors.map((color) => {
            const v = findVariant(selected?.size ?? sizes[0], color)
            const isSelected = selected?.color === color
            const noStock = (v?.stock ?? 0) === 0
            const hex = COLOR_HEX[color] ?? '#888'
            return (
              <motion.button
                key={color}
                whileTap={{ scale: 0.92 }}
                transition={{ duration: 0.1 }}
                onClick={() => pickVariant(selected?.size ?? sizes[0], color)}
                disabled={noStock}
                aria-pressed={isSelected}
                aria-label={color}
                style={{ backgroundColor: hex }}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  isSelected ? 'border-accent scale-110' : 'border-border hover:border-text-muted'
                } ${noStock ? 'opacity-40 cursor-not-allowed' : ''}`}
              />
            )
          })}
        </div>
      </div>

      {selected && selected.stock > 0 && selected.stock <= lowStockThreshold && (
        <div className="h-8 bg-surface border border-border flex items-center gap-2.5 px-3">
          <span className="block h-3.5 w-px bg-accent shrink-0" aria-hidden="true" />
          <span className="text-accent text-[11px] font-semibold tracking-[0.2em] uppercase">
            Últimas {selected.stock} unidades
          </span>
        </div>
      )}
    </div>
  )
}
