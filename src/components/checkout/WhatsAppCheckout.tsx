import { useNavigate } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore, useCartTotal } from '@/store/cart.store'
import { useOrderStore } from '@/store/order.store'
import { useSiteCurrency } from '@/hooks/useSiteCurrency'

interface Props {
  onSuccess?: () => void
}

export default function WhatsAppCheckout({ onSuccess }: Props) {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const total = useCartTotal()
  const currency = useSiteCurrency()
  const reset = useOrderStore((s) => s.reset)

  function handleCheckout() {
    if (items.length === 0) return
    reset()
    onSuccess?.()
    navigate('/checkout')
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={items.length === 0}
      className="w-full bg-[#25D366] hover:bg-[#20b857] text-white py-4 text-sm tracking-wide rounded-none gap-2"
    >
      <MessageCircle className="w-4 h-4" />
      {`Reservar — ${currency.formatShort(total)}`}
    </Button>
  )
}
