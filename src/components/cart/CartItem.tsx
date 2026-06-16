import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CartItem as CartItemType } from '@/types'
import { useSiteCurrency } from '@/hooks/useSiteCurrency'

interface Props {
  item: CartItemType
  onRemove: (variantId: string) => void
  onQtyChange: (variantId: string, qty: number) => void
}

export default function CartItem({ item, onRemove, onQtyChange }: Props) {
  const currency = useSiteCurrency()
  return (
    <div className="flex gap-4 py-4 border-b border-border">
      <div className="w-16 h-20 flex-shrink-0 bg-surface overflow-hidden">
        {item.imageUrl ? (
          <img
            src={`${item.imageUrl}?width=200&quality=70`}
            alt={item.productName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-surface" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-body font-medium text-text-primary text-sm truncate">{item.productName}</p>
        <p className="text-text-muted text-xs mt-0.5">{item.size} / {item.color}</p>
        <p className="text-accent text-sm font-medium mt-1">{currency.formatShort(item.price)}</p>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onQtyChange(item.variantId, item.quantity - 1)}
            className="w-6 h-6 border border-border text-text-muted hover:text-text-primary flex items-center justify-center text-sm transition-colors"
            aria-label="Reducir cantidad"
          >
            −
          </button>
          <span className="text-sm text-text-primary w-4 text-center">{item.quantity}</span>
          <button
            onClick={() => onQtyChange(item.variantId, item.quantity + 1)}
            className="w-6 h-6 border border-border text-text-muted hover:text-text-primary flex items-center justify-center text-sm transition-colors"
            aria-label="Aumentar cantidad"
          >
            +
          </button>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(item.variantId)}
        className="text-text-muted hover:text-error self-start flex-shrink-0"
        aria-label={`Eliminar ${item.productName}`}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}
