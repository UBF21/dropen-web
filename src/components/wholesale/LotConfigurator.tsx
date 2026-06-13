import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Product, WholesaleOrderItem } from '@/types'

interface Props {
  products: Product[]
  items: WholesaleOrderItem[]
  onChange: (items: WholesaleOrderItem[]) => void
  minUnits: number
  maxUnits: number
}

export default function LotConfigurator({ products, items, onChange, minUnits, maxUnits }: Props) {
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [qty, setQty] = useState(1)

  const totalUnits = items.reduce((s, i) => s + i.quantity, 0)
  const selectedProduct = products.find((p) => p.id === selectedProductId)
  const availableSizes = [...new Set(selectedProduct?.variants?.map((v) => v.size) ?? [])].sort()
  const availableColors = [...new Set(selectedProduct?.variants?.map((v) => v.color) ?? [])]

  function addItem() {
    if (!selectedProduct || !selectedSize || !selectedColor) return
    const existingIdx = items.findIndex(
      (i) => i.product_id === selectedProductId && i.size === selectedSize && i.color === selectedColor
    )
    if (existingIdx >= 0) {
      const updated = [...items]
      updated[existingIdx] = { ...updated[existingIdx], quantity: updated[existingIdx].quantity + qty }
      onChange(updated)
    } else {
      onChange([...items, {
        product_id: selectedProductId,
        name: selectedProduct.name,
        size: selectedSize,
        color: selectedColor,
        quantity: qty,
      }])
    }
    setQty(1)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
          <SelectTrigger className="bg-surface border-border text-text-primary">
            <SelectValue placeholder="Producto" />
          </SelectTrigger>
          <SelectContent className="bg-surface border-border">
            {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={selectedSize} onValueChange={setSelectedSize} disabled={!selectedProductId}>
          <SelectTrigger className="bg-surface border-border text-text-primary">
            <SelectValue placeholder="Talla" />
          </SelectTrigger>
          <SelectContent className="bg-surface border-border">
            {availableSizes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={selectedColor} onValueChange={setSelectedColor} disabled={!selectedProductId}>
          <SelectTrigger className="bg-surface border-border text-text-primary">
            <SelectValue placeholder="Color" />
          </SelectTrigger>
          <SelectContent className="bg-surface border-border">
            {availableColors.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <input
            type="number" min={1} max={maxUnits - totalUnits} value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 bg-surface border border-border text-text-primary px-3 py-2 text-sm focus:outline-none focus:border-accent"
            aria-label="Cantidad"
          />
          <Button
            type="button" onClick={addItem}
            disabled={!selectedProductId || !selectedSize || !selectedColor}
            className="flex-1 bg-accent hover:bg-accent-hover text-background text-xs tracking-wider rounded-none"
          >
            Agregar
          </Button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="border border-border divide-y divide-border">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 text-sm gap-4">
              <span className="text-text-primary flex-1">{item.name}</span>
              <span className="text-text-muted">{item.size} / {item.color}</span>
              <span className="text-accent font-medium">{item.quantity} un.</span>
              <button
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                className="text-text-muted hover:text-error transition-colors"
                aria-label="Eliminar item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="px-4 py-3 flex justify-between text-sm font-medium">
            <span className="text-text-muted">Total unidades</span>
            <span className={totalUnits < minUnits ? 'text-error' : 'text-accent'}>
              {totalUnits} / {maxUnits}
              {totalUnits < minUnits && ` (mín. ${minUnits})`}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
