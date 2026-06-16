import { useEffect, useRef, useState } from 'react'
import { useCartStore } from '@/store/cart.store'

interface Props {
  orderId: string
  onEnd: () => void
}

const CSS = `
@keyframes t-drop  {0%{opacity:0;transform:translateY(-28px) scaleY(.94)}55%{transform:translateY(5px) scaleY(1.01)}100%{opacity:1;transform:translateY(0) scaleY(1)}}
@keyframes t-head  {0%{top:0;opacity:0}3%{opacity:1}96%{opacity:1}100%{top:100%;opacity:0}}
@keyframes t-in    {from{opacity:0}to{opacity:1}}
@keyframes t-dash  {from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes t-type  {from{width:0}to{width:100%}}
@keyframes t-bars  {from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0% 0 0)}}
@keyframes t-glow  {from{left:-6%;opacity:1}to{left:108%;opacity:0}}
@keyframes t-stamp {
  0%  {opacity:0;transform:translateX(-42%) rotate(-14deg) scale(2.1) translateY(-16px)}
  38% {opacity:1;transform:translateX(-42%) rotate(-14deg) scale(.88) translateY(0)}
  58% {transform:translateX(-42%) rotate(-14deg) scale(1.06)}
  73% {transform:translateX(-42%) rotate(-14deg) scale(.96)}
  100%{opacity:1;transform:translateX(-42%) rotate(-14deg) scale(1) translateY(0)}
}
@keyframes t-flash {0%{opacity:0}20%{opacity:.1}100%{opacity:0}}
`

const BARS = [
  2,1,2,2,2,2, 1,2,2,3,1,1, 3,1,2,1,2,2, 2,2,1,1,3,1,
  2,3,1,2,1,1, 1,2,3,2,2,1, 1,1,2,3,2,1, 2,1,1,2,3,1,
  1,3,2,1,2,1, 2,1,3,1,1,2, 3,2,1,1,1,2, 2,3,1,1,2,1,
]

export default function CheckoutSuccess({ orderId, onEnd }: Props) {
  const items = useCartStore((s) => s.items)
  const item = items[0]
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const [date] = useState(() =>
    new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' })
  )
  const reference = `DRP-${orderId.substring(0, 8).toUpperCase()}`

  useEffect(() => {
    if (!document.getElementById('__t_css')) {
      const s = document.createElement('style')
      s.id = '__t_css'
      s.textContent = CSS
      document.head.appendChild(s)
    }
    timerRef.current = setTimeout(onEnd, 3800)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [onEnd])

  const a = (name: string, dur: string, delay: string, extra = ''): React.CSSProperties => ({
    animation: `${name} ${dur} ease forwards`,
    animationDelay: delay,
    opacity: 0,
    ...Object.fromEntries(extra.split(';').filter(Boolean).map((e) => {
      const [k, v] = e.split(':')
      return [k.trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()), v.trim()]
    })),
  })

  const dash: React.CSSProperties = {
    height: 1,
    background: 'repeating-linear-gradient(90deg,#ccc 0,#ccc 4px,transparent 4px,transparent 8px)',
    margin: '11px 0',
    transformOrigin: 'left',
    transform: 'scaleX(0)',
  }

  const total = (item?.price ?? 0) * (item?.quantity ?? 1)

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{
        width: 264, background: '#f4efe6', padding: '20px 20px 34px', position: 'relative',
        animation: 't-drop .5s cubic-bezier(.22,1,.36,1) forwards',
        clipPath: 'polygon(0 0,100% 0,100% calc(100% - 10px),96% 100%,91% calc(100% - 7px),86% 100%,81% calc(100% - 8px),76% 100%,71% calc(100% - 6px),66% 100%,61% calc(100% - 8px),56% 100%,51% calc(100% - 7px),46% 100%,41% calc(100% - 8px),36% 100%,31% calc(100% - 6px),26% 100%,21% calc(100% - 8px),16% 100%,11% calc(100% - 7px),6% 100%,2% calc(100% - 8px),0 100%)',
        boxShadow: '0 28px 80px rgba(0,0,0,.8)',
      }}>
        {/* Printer head */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 2, zIndex: 10,
          background: 'linear-gradient(90deg,transparent,#c8a96e 30%,#ffe4a0 50%,#c8a96e 70%,transparent)',
          boxShadow: '0 0 10px 3px #c8a96e88',
          animation: 't-head 3100ms linear forwards', animationDelay: '0.38s', opacity: 0 }} />

        {/* Flash on stamp impact */}
        <div style={{ position: 'absolute', inset: 0, background: '#b91c1c', opacity: 0, zIndex: 15, pointerEvents: 'none',
          animation: 't-flash .35s ease forwards', animationDelay: '2.05s' }} />

        {/* Stamp RESERVADO */}
        <div style={{ position: 'absolute', top: 90, left: '50%', zIndex: 20, pointerEvents: 'none',
          opacity: 0, animation: 't-stamp .5s cubic-bezier(.22,1,.36,1) forwards', animationDelay: '1.9s' }}>
          <div style={{ border: '3px solid #b91c1c', background: 'rgba(185,28,28,.07)', padding: '7px 18px',
            boxShadow: 'inset 0 0 0 1.5px rgba(185,28,28,.18)' }}>
            <span style={{ fontSize: 15, fontWeight: 900, letterSpacing: 6, textTransform: 'uppercase', color: '#b91c1c' }}>
              Reservado
            </span>
          </div>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16, ...a('t-in', '.18s', '.44s') }}>
          <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: 5, color: '#111', textTransform: 'uppercase' }}>DROPEN</span>
          <span style={{ fontSize: 8, color: '#aaa', fontFamily: 'monospace' }}>{date}</span>
        </div>

        <div style={{ ...dash, animation: 't-dash .28s ease forwards', animationDelay: '.64s' }} />

        {/* Product */}
        <p style={{ fontSize: 7, color: '#bbb', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 9, ...a('t-in', '.14s', '.78s') }}>
          Detalle del pedido
        </p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', ...a('t-in', '.14s', '.8s') }}>
          {item?.imageUrl
            ? <img src={item.imageUrl} alt="" style={{ width: 48, height: 60, objectFit: 'cover', objectPosition: 'top', border: '1px solid #ddd8ce', flexShrink: 0 }} />
            : <div style={{ width: 48, height: 60, background: '#e5dfd4', border: '1px solid #ddd8ce', flexShrink: 0 }} />}
          <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#111', letterSpacing: 1.5, textTransform: 'uppercase',
              overflow: 'hidden', whiteSpace: 'nowrap', width: 0, marginBottom: 5,
              animation: 't-type .42s steps(21,end) forwards', animationDelay: '.92s' }}>
              {item?.productName ?? 'Producto'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, ...a('t-in', '.16s', '1.38s') }}>
              <span style={{ fontSize: 8, color: '#999' }}>Talla {item?.size} · {item?.color} · ×{item?.quantity}</span>
              <span style={{ fontSize: 12, fontWeight: 900, color: '#111', fontFamily: 'Courier New', whiteSpace: 'nowrap' }}>
                S/ {total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div style={{ ...dash, animation: 't-dash .25s ease forwards', animationDelay: '1.56s' }} />

        {/* Totals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8.5, color: '#888', letterSpacing: .5, ...a('t-in', '.12s', '1.7s') }}>
            <span>Subtotal</span><span>S/ {total.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8.5, color: '#888', letterSpacing: .5, ...a('t-in', '.12s', '1.83s') }}>
            <span>Envío</span><span>Por coordinar</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 900, color: '#111',
            letterSpacing: 1, marginTop: 3, paddingTop: 5, borderTop: '1px solid #d0ccc4', ...a('t-in', '.15s', '1.98s') }}>
            <span>TOTAL</span>
            <span style={{ fontFamily: 'Courier New' }}>S/ {total.toFixed(2)}</span>
          </div>
        </div>

        <div style={{ ...dash, animation: 't-dash .25s ease forwards', animationDelay: '2.3s' }} />

        {/* Barcode */}
        <p style={{ fontSize: 7, color: '#bbb', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 9, ...a('t-in', '.12s', '2.44s') }}>
          Código de reserva
        </p>
        <div style={{ background: '#fff', padding: '8px 8px 5px', position: 'relative', overflow: 'hidden', ...a('t-in', '.12s', '2.5s') }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: 48,
            clipPath: 'inset(0 100% 0 0)', animation: 't-bars .85s ease forwards', animationDelay: '2.6s' }}>
            {BARS.map((w, i) => (
              <div key={i} style={{ width: w * 2.2, height: i % 2 === 0 ? 28 + w * 5 + (i % 7) * 1.5 : 0,
                background: i % 2 === 0 ? '#111' : 'transparent', flexShrink: 0, alignSelf: 'flex-end' }} />
            ))}
          </div>
          <div style={{ position: 'absolute', top: 0, bottom: 0, width: 4,
            background: 'linear-gradient(180deg,transparent,#c8a96e 40%,#ffe4a0 50%,#c8a96e 60%,transparent)',
            boxShadow: '0 0 8px 4px #c8a96e66',
            animation: 't-glow .55s ease forwards', animationDelay: '3.0s', opacity: 0, left: '-6%' }} />
        </div>
        <div style={{ fontSize: 8, color: '#555', textAlign: 'center', marginTop: 4, letterSpacing: 2.5, fontFamily: 'Courier New', ...a('t-in', '.18s', '3.2s') }}>
          {reference}
        </div>
      </div>
    </div>
  )
}
