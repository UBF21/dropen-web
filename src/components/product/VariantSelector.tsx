import type { ProductVariant } from '@/types'

interface Props {
  variants: ProductVariant[]
  selectedVariantId: string | null
  onSelect: (variantId: string) => void
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

export default function VariantSelector({ variants, selectedVariantId, onSelect }: Props) {
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
              <button
                key={size}
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
              </button>
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
              <button
                key={color}
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

      {selected && selected.stock > 0 && selected.stock <= 3 && (
        <p className="text-xs text-accent">Solo quedan {selected.stock} unidades</p>
      )}
    </div>
  )
}
