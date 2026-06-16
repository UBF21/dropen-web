import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import JsBarcode from 'jsbarcode'
import { getOrder } from '@/lib/orders'
import { buildOrderWhatsAppMessage, buildWhatsAppUrl } from '@/lib/whatsapp'
import { useSiteCurrency } from '@/hooks/useSiteCurrency'
import type { Order } from '@/types'

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? ''

const SCAN_CSS = `@keyframes scan-order{0%{top:10%;opacity:0}10%{opacity:1}90%{opacity:1}100%{top:90%;opacity:0}}`

function OrderBarcode({ reference }: { reference: string }) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return
    try {
      JsBarcode(svgRef.current, reference, {
        format: 'CODE128', width: 1.6, height: 44,
        displayValue: false, background: '#ffffff', lineColor: '#000000', margin: 4,
      })
    } catch { /* invalid chars — noop */ }
  }, [reference])

  return (
    <div style={{ border: '1px solid #3a2e1a', background: '#0a0a0a', padding: '12px 12px 8px', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 2, pointerEvents: 'none', zIndex: 10,
        background: 'linear-gradient(90deg,transparent,#c8a96e55 20%,#c8a96e 50%,#c8a96e55 80%,transparent)',
        boxShadow: '0 0 6px 2px #c8a96e44',
        animation: 'scan-order 2.5s ease-in-out infinite',
      }} />
      <div style={{ background: '#ffffff', padding: '8px 4px 4px' }}>
        <svg ref={svgRef} style={{ width: '100%', display: 'block' }} aria-label={`Código de reserva: ${reference}`} />
      </div>
      <p style={{ fontFamily: 'Courier New', fontSize: 9, color: '#c8a96e88', textAlign: 'center', marginTop: 6, letterSpacing: 3 }}>
        {reference}
      </p>
    </div>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const currency = useSiteCurrency()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!document.getElementById('__scan_css')) {
      const s = document.createElement('style')
      s.id = '__scan_css'
      s.textContent = SCAN_CSS
      document.head.appendChild(s)
    }
  }, [])

  useEffect(() => {
    if (!id) return
    getOrder(id).then((data) => {
      if (!data) setNotFound(true)
      else setOrder(data)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    )
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-[11px] uppercase tracking-[3px] text-text-muted">Pedido no encontrado</p>
        <button onClick={() => navigate('/')}
          className="text-accent text-[11px] uppercase tracking-[2px]">
          Volver al inicio
        </button>
      </div>
    )
  }

  const firstItem = order.items[0]
  const waMessage = buildOrderWhatsAppMessage({
    docType: order.doc_type, docNumber: order.doc_number,
    firstName: order.first_name, lastName: order.last_name,
    orderId: order.id, reference: order.reference,
  })
  const waUrl = buildWhatsAppUrl(WA_NUMBER, waMessage)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl border border-[#1a1a1a] flex flex-col md:flex-row">

        {/* LEFT — imagen del producto */}
        <div className="md:w-[260px] md:flex-shrink-0 bg-[#0a0a0a] relative overflow-hidden min-h-[200px] md:min-h-0">
          {firstItem?.imageUrl ? (
            <img src={firstItem.imageUrl} alt={firstItem.productName}
              className="w-full h-full object-cover object-top opacity-85 md:absolute md:inset-0" />
          ) : (
            <div className="w-full h-full bg-[#111] flex items-center justify-center min-h-[200px]">
              <span className="text-4xl opacity-20">👟</span>
            </div>
          )}
          <div className="hidden md:block absolute inset-0"
            style={{ background: 'linear-gradient(to right,transparent 60%,#0e0e0e 100%)' }} />
          <p className="absolute top-5 left-5 text-[8px] text-accent tracking-[4px] uppercase hidden md:block"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
            Dropen · Reserva
          </p>
        </div>

        {/* RIGHT — datos */}
        <div className="flex-1 p-6 md:p-8 flex flex-col gap-0 bg-[#0e0e0e]">
          <p className="text-[11px] font-black tracking-[4px] text-accent uppercase font-mono mb-1">
            {order.reference}
          </p>
          <h1 className="text-base font-black tracking-[2px] text-[#f0ece4] uppercase leading-tight mb-2">
            {firstItem?.productName ?? 'Pedido'}
          </h1>

          {/* Status */}
          <div className="flex items-center gap-2 text-[9px] text-[#888] tracking-[2px] uppercase mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0"
              style={{ boxShadow: '0 0 5px #c8a96e' }} />
            Reserva pendiente de confirmación
          </div>

          <p className="text-[26px] font-black text-accent font-mono mb-5">
            {currency.formatShort(order.total)}
          </p>

          <div className="h-px bg-[#1a1a1a] mb-4" />

          {/* Grid datos cliente */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-3 mb-4">
            <div>
              <p className="text-[7px] text-[#444] tracking-[3px] uppercase mb-1">Cliente</p>
              <p className="text-[11px] text-[#999]">{order.first_name} {order.last_name}</p>
            </div>
            <div>
              <p className="text-[7px] text-[#444] tracking-[3px] uppercase mb-1">{order.doc_type}</p>
              <p className="text-[11px] text-[#999] font-mono">{order.doc_number}</p>
            </div>
            <div>
              <p className="text-[7px] text-[#444] tracking-[3px] uppercase mb-1">Talla / Color</p>
              <p className="text-[11px] text-[#999]">{firstItem?.size} · {firstItem?.color}</p>
            </div>
            <div>
              <p className="text-[7px] text-[#444] tracking-[3px] uppercase mb-1">Cantidad</p>
              <p className="text-[11px] text-[#999]">×{firstItem?.quantity}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[7px] text-[#444] tracking-[3px] uppercase mb-1">Dirección</p>
              <p className="text-[11px] text-[#999]">{order.address}</p>
              {order.district && (
                <p className="text-[10px] text-[#555] mt-0.5">
                  {order.district}{order.province ? ` · ${order.province}` : ''}{order.department ? ` · ${order.department}` : ''}
                </p>
              )}
            </div>
          </div>

          <div className="h-px bg-[#1a1a1a] mb-4" />

          <OrderBarcode reference={order.reference} />

          <a href={waUrl} target="_blank" rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 py-3 bg-[#0a1a0f] border border-[#1e3a2a] text-[#3eb863] text-[10px] tracking-[2px] uppercase hover:bg-[#0f2418] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#3eb863" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Confirmar vía WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
