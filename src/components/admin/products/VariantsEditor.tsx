import { Trash2, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export interface VariantDraft {
  size: string
  color: string
  stock: number
  sku: string
}

interface Props {
  variants: VariantDraft[]
  onChange: (variants: VariantDraft[]) => void
}

const EMPTY_VARIANT: VariantDraft = { size: '', color: '', stock: 0, sku: '' }

export default function VariantsEditor({ variants, onChange }: Props) {
  function addRow() { onChange([...variants, { ...EMPTY_VARIANT }]) }

  function updateRow(idx: number, patch: Partial<VariantDraft>) {
    const updated = variants.map((v, i) => i === idx ? { ...v, ...patch } : v)
    onChange(updated)
  }

  function removeRow(idx: number) { onChange(variants.filter((_, i) => i !== idx)) }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[2fr_2fr_1fr_2fr_auto] gap-2 text-xs text-text-muted uppercase tracking-wider px-1">
        <span>Talla</span><span>Color</span><span>Stock</span><span>SKU</span><span></span>
      </div>
      {variants.map((v, i) => (
        <div key={i} className="grid grid-cols-[2fr_2fr_1fr_2fr_auto] gap-2 items-center">
          <Input value={v.size} onChange={(e) => updateRow(i, { size: e.target.value })}
            placeholder="32" className="bg-surface border-border text-text-primary rounded-none text-sm h-8" />
          <Input value={v.color} onChange={(e) => updateRow(i, { color: e.target.value })}
            placeholder="Black" className="bg-surface border-border text-text-primary rounded-none text-sm h-8" />
          <Input type="number" min={0} value={v.stock}
            onChange={(e) => updateRow(i, { stock: parseInt(e.target.value) || 0 })}
            className="bg-surface border-border text-text-primary rounded-none text-sm h-8" />
          <Input value={v.sku} onChange={(e) => updateRow(i, { sku: e.target.value })}
            placeholder="DRP-001" className="bg-surface border-border text-text-primary rounded-none text-sm h-8" />
          <Button variant="ghost" size="icon" onClick={() => removeRow(i)}
            className="text-text-muted hover:text-error h-8 w-8" aria-label="Eliminar variante">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addRow}
        className="border-border text-text-muted hover:text-text-primary rounded-none gap-1.5">
        <Plus className="w-3.5 h-3.5" />
        Agregar variante
      </Button>
    </div>
  )
}
