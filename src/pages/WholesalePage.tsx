import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import WholesaleForm from '@/components/wholesale/WholesaleForm'

export default function WholesalePage() {
  const [minUnits, setMinUnits] = useState(6)
  const [maxUnits, setMaxUnits] = useState(60)

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['wholesale_min_units', 'wholesale_max_units'])
      .then(({ data }) => {
        data?.forEach(({ key, value }) => {
          if (key === 'wholesale_min_units') {
            const n = parseInt(value)
            if (!isNaN(n)) setMinUnits(n)
          }
          if (key === 'wholesale_max_units') {
            const n = parseInt(value)
            if (!isNaN(n)) setMaxUnits(n)
          }
        })
      })
  }, [])

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-2xl mx-auto mb-16 text-center">
        <p className="text-text-muted text-xs uppercase tracking-[0.3em] mb-4">Wholesale</p>
        <h1 className="font-display font-bold text-5xl text-text-primary tracking-wide mb-6">
          Pedidos por lote
        </h1>
        <p className="text-text-muted leading-relaxed">
          Mínimo {minUnits} unidades — máximo {maxUnits} por pedido.
          Completá el formulario y te contactamos en 24–48 hs hábiles.
        </p>
      </div>
      <WholesaleForm minUnits={minUnits} maxUnits={maxUnits} />
    </div>
  )
}
