import { Link, NavLink } from 'react-router-dom'
import { ShoppingBag, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { motion, useAnimate } from 'framer-motion'
import { useCartItemCount } from '@/store/cart.store'
import { useUIStore } from '@/store/ui.store'

const NAV_LINKS = [
  { to: '/colecciones', label: 'Colecciones' },
  { to: '/wholesale', label: 'Wholesale' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const itemCount = useCartItemCount()
  const openCart = useUIStore((s) => s.openCart)

  const [scope, animate] = useAnimate()
  const prevCount = useRef<number | undefined>(undefined)

  useEffect(() => {
    const prev = prevCount.current
    prevCount.current = itemCount
    if (prev === undefined) return            // primer render: no animar
    if (itemCount <= prev) return             // quitar item: no animar

    // Shake del ícono (siempre presente)
    animate(
      'svg',
      { rotate: [0, -15, 15, -10, 10, 0] },
      { duration: 0.4 },
    )
    // Pop del badge (solo si está montado)
    if (scope.current?.querySelector('[data-cart-badge]')) {
      animate(
        '[data-cart-badge]',
        { scale: [1, 1.5, 1] },
        { duration: 0.3 },
      )
    }
  }, [itemCount, animate, scope])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="font-display font-bold text-xl tracking-[0.3em] text-text-primary hover:text-accent transition-colors"
        >
          DROPEN
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `text-sm tracking-widest uppercase transition-colors ${
                  isActive ? 'text-accent' : 'text-text-muted hover:text-text-primary'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div ref={scope} className="flex items-center gap-4">
          <button
            onClick={openCart}
            aria-label="Abrir carrito"
            className="relative text-text-muted hover:text-text-primary transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <motion.span
                data-cart-badge
                className="absolute -top-1.5 -right-1.5 bg-accent text-background text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
              >
                {itemCount > 9 ? '9+' : itemCount}
              </motion.span>
            )}
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="md:hidden text-text-muted hover:text-text-primary transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="md:hidden border-t border-border bg-background px-4 py-4 flex flex-col gap-4">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `text-sm tracking-widest uppercase transition-colors ${
                  isActive ? 'text-accent' : 'text-text-muted hover:text-text-primary'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
