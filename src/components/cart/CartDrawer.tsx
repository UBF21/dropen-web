import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useCartStore, useCartTotal, useCartItemCount } from '@/store/cart.store'
import { useUIStore } from '@/store/ui.store'
import { useReservationStore } from '@/store/reservation.store'
import CartItem from './CartItem'
import CartSummary from './CartSummary'
import WhatsAppCheckout from '@/components/checkout/WhatsAppCheckout'
import ReservationTimer from '@/components/checkout/ReservationTimer'

export default function CartDrawer() {
  const isOpen = useUIStore((s) => s.isCartOpen)
  const closeCart = useUIStore((s) => s.closeCart)
  const items = useCartStore((s) => s.items)
  const { removeItem, updateQty } = useCartStore()
  const total = useCartTotal()
  const itemCount = useCartItemCount()
  const { expiresAt, reference, clearReservation, isExpired } = useReservationStore()
  const hasActiveReservation = expiresAt !== null && !isExpired()

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-md bg-surface border-l border-border flex flex-col p-0"
      >
        <SheetHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display font-bold tracking-widest text-text-primary">
              CARRITO ({itemCount})
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeCart}
              className="text-text-muted hover:text-text-primary"
              aria-label="Cerrar carrito"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="py-16 text-center text-text-muted text-sm">El carrito está vacío.</div>
          ) : (
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.variantId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <CartItem item={item} onRemove={removeItem} onQtyChange={updateQty} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-6 py-4 border-t border-border space-y-4">
            {hasActiveReservation && expiresAt && (
              <div className="space-y-1">
                <ReservationTimer expiresAt={expiresAt} onExpire={clearReservation} />
                <p className="text-xs text-text-muted">Ref: {reference}</p>
              </div>
            )}
            <CartSummary total={total} itemCount={itemCount} />
            <WhatsAppCheckout onSuccess={closeCart} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
