import { useState } from 'react'
import { toast } from 'sonner'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createReservations } from '@/lib/reservations'
import { buildWhatsAppMessage, buildWhatsAppUrl } from '@/lib/whatsapp'
import { useCartStore, useCartTotal } from '@/store/cart.store'
import { useReservationStore } from '@/store/reservation.store'
import type { CartItem, WhatsAppLine } from '@/types'

const WA_NUMBER: string = import.meta.env.VITE_WHATSAPP_NUMBER ?? ''

function cartItemToWhatsAppLine(item: CartItem): WhatsAppLine {
  return {
    productName: item.productName,
    size: item.size,
    color: item.color,
    quantity: item.quantity,
    price: item.price,
  }
}

interface Props {
  onSuccess?: () => void
}

export default function WhatsAppCheckout({ onSuccess }: Props) {
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const total = useCartTotal()
  const setReservation = useReservationStore((s) => s.setReservation)
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    if (items.length === 0) return
    setLoading(true)

    const result = await createReservations(items)
    if (!result.success) {
      toast.error(`Error al reservar: ${result.error}`)
      setLoading(false)
      return
    }

    setReservation(result.reservationIds, result.expiresAt, result.reference)

    const message = buildWhatsAppMessage(items.map(cartItemToWhatsAppLine), result.reference)
    window.open(buildWhatsAppUrl(WA_NUMBER, message), '_blank', 'noopener,noreferrer')

    clearCart()
    onSuccess?.()
    setLoading(false)
    toast.success(`Pedido reservado — ${result.reference}`, {
      description: 'Tenés 2 horas para confirmar el pedido por WhatsApp.',
    })
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={items.length === 0 || loading}
      className="w-full bg-[#25D366] hover:bg-[#20b857] text-white py-4 text-sm tracking-wide rounded-none gap-2"
    >
      <MessageCircle className="w-4 h-4" />
      {loading ? 'Procesando...' : `Confirmar por WhatsApp — S/ ${total.toFixed(2)}`}
    </Button>
  )
}
