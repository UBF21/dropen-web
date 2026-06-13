import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { useAllProducts } from '@/hooks/useProducts'
import LotConfigurator from './LotConfigurator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import type { WholesaleOrderItem } from '@/types'

const WA_NUMBER: string = import.meta.env.VITE_WHATSAPP_NUMBER ?? ''

const step1Schema = z.object({
  customer_name: z.string().min(2, 'Nombre requerido'),
  customer_email: z.string().email('Email inválido'),
  customer_phone: z.string().min(7, 'Teléfono requerido'),
  notes: z.string().optional(),
})
type Step1Data = z.infer<typeof step1Schema>

interface Props {
  minUnits: number
  maxUnits: number
}

async function saveOrder(data: Step1Data, items: WholesaleOrderItem[], totalUnits: number): Promise<boolean> {
  const { error } = await supabase.from('wholesale_orders').insert({
    customer_name: data.customer_name,
    customer_email: data.customer_email,
    customer_phone: data.customer_phone,
    notes: data.notes ?? null,
    items,
    total_units: totalUnits,
  })
  if (error) console.error('saveOrder failed:', error.message)
  return !error
}

function buildWholesaleWaMessage(data: Step1Data, items: WholesaleOrderItem[], totalUnits: number): string {
  const itemLines = items.map((i) => `${i.name} | ${i.size} / ${i.color} x${i.quantity}`).join('\n')
  return [
    'Pedido Wholesale DROPEN',
    '─────────────────────',
    `Cliente: ${data.customer_name}`,
    `Tel: ${data.customer_phone}`,
    '',
    itemLines,
    '',
    `Total: ${totalUnits} unidades`,
  ].join('\n')
}

export default function WholesaleForm({ minUnits, maxUnits }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [lotItems, setLotItems] = useState<WholesaleOrderItem[]>([])
  const [submitting, setSubmitting] = useState(false)
  const { products } = useAllProducts()

  const form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { customer_name: '', customer_email: '', customer_phone: '', notes: '' },
  })

  const totalUnits = lotItems.reduce((s, i) => s + i.quantity, 0)

  function handleStep1(data: Step1Data) {
    setStep1Data(data)
    setStep(2)
  }

  async function handleSubmit() {
    if (!step1Data) return
    setSubmitting(true)
    const ok = await saveOrder(step1Data, lotItems, totalUnits)
    if (!ok) { toast.error('Error al enviar. Intentá de nuevo.'); setSubmitting(false); return }
    const msg = buildWholesaleWaMessage(step1Data, lotItems, totalUnits)
    if (!WA_NUMBER) {
      console.error('VITE_WHATSAPP_NUMBER no está configurado')
      toast.error('Error de configuración. Contactanos directamente.')
      setSubmitting(false)
      return
    }
    window.open(buildWhatsAppUrl(WA_NUMBER, msg), '_blank', 'noopener,noreferrer')
    setStep(3)
    setSubmitting(false)
  }

  if (step === 3) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-4xl">✅</p>
        <h3 className="font-display font-bold text-2xl text-text-primary">Pedido enviado</h3>
        <p className="text-text-muted">
          Te contactaremos a <strong>{step1Data?.customer_email}</strong> para confirmar los detalles.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-10">
        {[1, 2].map((n) => (
          <div key={n} className={`flex items-center gap-2 ${n > step ? 'opacity-40' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
              step >= n ? 'bg-accent border-accent text-background' : 'border-border text-text-muted'
            }`}>{n}</div>
            <span className="text-sm text-text-muted">{n === 1 ? 'Datos' : 'Lote'}</span>
            {n < 2 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleStep1)} className="space-y-5">
            <FormField control={form.control} name="customer_name" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-text-muted text-xs uppercase tracking-wider">Nombre completo</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-surface border-border text-text-primary focus:border-accent rounded-none" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="customer_email" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-text-muted text-xs uppercase tracking-wider">Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" className="bg-surface border-border text-text-primary focus:border-accent rounded-none" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="customer_phone" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-text-muted text-xs uppercase tracking-wider">Teléfono / WhatsApp</FormLabel>
                <FormControl>
                  <Input {...field} type="tel" className="bg-surface border-border text-text-primary focus:border-accent rounded-none" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-text-muted text-xs uppercase tracking-wider">Notas (opcional)</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} className="bg-surface border-border text-text-primary focus:border-accent rounded-none resize-none" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full bg-accent hover:bg-accent-hover text-background text-xs tracking-wider rounded-none py-4">
              Siguiente — Configurar lote
            </Button>
          </form>
        </Form>
      )}

      {step === 2 && (
        <div className="space-y-8">
          <LotConfigurator
            products={products}
            items={lotItems}
            onChange={setLotItems}
            minUnits={minUnits}
            maxUnits={maxUnits}
          />
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setStep(1)}
              className="flex-1 border-border text-text-muted rounded-none">
              Atrás
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={totalUnits < minUnits || totalUnits > maxUnits || submitting}
              className="flex-1 bg-accent hover:bg-accent-hover text-background text-xs tracking-wider rounded-none py-4"
            >
              {submitting ? 'Enviando...' : `Enviar pedido (${totalUnits} un.)`}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
