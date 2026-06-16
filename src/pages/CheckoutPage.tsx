import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cart.store'
import { useOrderStore } from '@/store/order.store'
import CheckoutProgress from '@/components/checkout/CheckoutProgress'
import Step1Personal from '@/components/checkout/steps/Step1Personal'
import Step2Address from '@/components/checkout/steps/Step2Address'
import Step3Confirm from '@/components/checkout/steps/Step3Confirm'
import CheckoutSuccess from '@/components/checkout/CheckoutSuccess'

type Phase = 'form' | 'success'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const { step, orderId, reset } = useOrderStore()
  const [phase, setPhase] = useState<Phase>('form')
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (items.length === 0 && phase === 'form' && !orderId) {
      navigate('/', { replace: true })
    }
  }, [items, phase, orderId, navigate])

  function handleSuccess(id: string) {
    setCreatedOrderId(id)
    setPhase('success')
  }

  function handleAnimationEnd() {
    reset()
    navigate(`/pedido/${createdOrderId}`, { replace: true })
  }

  if (phase === 'success' && createdOrderId) {
    return <CheckoutSuccess orderId={createdOrderId} onEnd={handleAnimationEnd} />
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <p className="text-[9px] uppercase tracking-[4px] text-text-muted mb-1">Dropen</p>
          <h1 className="text-xl font-black uppercase tracking-[4px] text-text-primary">Checkout</h1>
        </div>
        <CheckoutProgress step={step} />
        {step === 1 && <Step1Personal />}
        {step === 2 && <Step2Address />}
        {step === 3 && <Step3Confirm onSuccess={handleSuccess} />}
      </div>
    </div>
  )
}
