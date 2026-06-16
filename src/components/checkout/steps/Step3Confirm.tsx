import { useState } from 'react'
import { Loader2, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { useOrderStore } from '@/store/order.store'
import { useCartStore, useCartTotal } from '@/store/cart.store'
import { useSiteCurrency } from '@/hooks/useSiteCurrency'
import { createReservations } from '@/lib/reservations'
import { createOrder } from '@/lib/orders'
import { Button } from '@/components/ui/button'

interface Props {
  onSuccess: (orderId: string) => void
}

export default function Step3Confirm({ onSuccess }: Props) {
  const store = useOrderStore()
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const total = useCartTotal()
  const currency = useSiteCurrency()
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    if (items.length === 0) return
    setLoading(true)

    const reservationResult = await createReservations(items)
    if (!reservationResult.success) {
      toast.error(`Error al reservar: ${reservationResult.error}`)
      setLoading(false)
      return
    }

    const orderResult = await createOrder({
      reference:       reservationResult.reference,
      first_name:      store.firstName,
      last_name:       store.lastName,
      doc_type:        store.docType,
      doc_number:      store.docNumber,
      address:         store.address,
      lat:             store.lat,
      lng:             store.lng,
      department:      store.department || null,
      province:        store.province || null,
      district:        store.district || null,
      country:         store.country,
      items,
      total,
      currency:        currency.code,
      reservation_ids: reservationResult.reservationIds,
    })

    if (!orderResult.success) {
      toast.error(`Error al crear el pedido: ${orderResult.error}`)
      setLoading(false)
      return
    }

    clearCart()
    store.setOrderId(orderResult.order!.id)
    onSuccess(orderResult.order!.id)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Productos */}
      <div>
        <p className="text-[9px] uppercase tracking-[3px] text-text-muted mb-3">Productos</p>
        <div className="flex flex-col">
          {items.map((item) => (
            <div key={item.variantId}
              className="flex items-center gap-3 py-3 border-b border-border last:border-b-0">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.productName}
                  className="w-10 h-12 object-cover object-top border border-border flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-text-primary truncate">
                  {item.productName}
                </p>
                <p className="text-[10px] text-text-muted">
                  Talla {item.size} · {item.color} · ×{item.quantity}
                </p>
              </div>
              <span className="text-[12px] font-semibold text-text-primary flex-shrink-0">
                {currency.formatShort(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-3 font-bold text-[13px] text-text-primary">
          <span>Total</span>
          <span>{currency.formatShort(total)}</span>
        </div>
      </div>

      {/* Datos del cliente */}
      <div className="border border-border bg-surface p-4 flex flex-col gap-3">
        <p className="text-[9px] uppercase tracking-[3px] text-text-muted">Datos del cliente</p>
        <div className="grid grid-cols-2 gap-3 text-[11px]">
          <div>
            <p className="text-[9px] uppercase tracking-[2px] text-text-muted mb-0.5">Nombre</p>
            <p className="text-text-primary">{store.firstName} {store.lastName}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[2px] text-text-muted mb-0.5">{store.docType}</p>
            <p className="text-text-primary font-mono">{store.docNumber}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 text-[11px]">
          <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-text-primary">{store.address}</p>
            {store.district && (
              <p className="text-[10px] text-text-muted mt-0.5">
                {store.district}{store.province ? ` · ${store.province}` : ''}{store.department ? ` · ${store.department}` : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => store.setStep(2)}
          className="flex-1 rounded-none border-border text-text-muted text-[11px] tracking-[2px] uppercase">
          Atrás
        </Button>
        <Button type="button" onClick={handleConfirm}
          disabled={loading || items.length === 0}
          className="flex-1 rounded-none bg-accent text-background hover:bg-accent/90 py-3 text-[11px] tracking-[3px] uppercase font-semibold gap-2">
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" />Procesando...</>
            : 'Confirmar reserva'}
        </Button>
      </div>
    </div>
  )
}
