interface Props {
  total: number
  itemCount: number
}

export default function CartSummary({ total, itemCount }: Props) {
  const label = itemCount === 1 ? 'item' : 'items'
  return (
    <div className="border-t border-border pt-4 space-y-2">
      <div className="flex justify-between text-sm text-text-muted">
        <span>Subtotal ({itemCount} {label})</span>
        <span>S/ {total.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-medium text-text-primary">
        <span>Total</span>
        <span className="text-accent">S/ {total.toFixed(2)}</span>
      </div>
      <p className="text-xs text-text-muted pt-1">
        Envío coordinado por WhatsApp tras confirmar el pedido.
      </p>
    </div>
  )
}
