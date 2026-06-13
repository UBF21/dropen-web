import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import WhatsAppCheckout from '../WhatsAppCheckout'
import { useCartStore } from '@/store/cart.store'
import type { CartItem } from '@/types'

vi.mock('@/lib/reservations', () => ({
  createReservations: vi.fn().mockResolvedValue({
    success: true,
    reservationIds: ['res-1'],
    expiresAt: '2026-06-12T12:00:00Z',
    reference: 'DRP-RES1',
  }),
}))

const ITEM: CartItem = {
  variantId: 'v1', productId: 'p1', productName: 'Jean Baggy Cargo',
  size: '32', color: 'Black', price: 189, quantity: 1, imageUrl: '',
}

beforeEach(() => {
  useCartStore.setState({ items: [ITEM] })
  window.open = vi.fn()
})

describe('WhatsAppCheckout', () => {
  it('muestra el total en el botón', () => {
    render(<WhatsAppCheckout />)
    expect(screen.getByRole('button', { name: /s\/ 189\.00/i })).toBeInTheDocument()
  })

  it('abre WhatsApp al confirmar', async () => {
    render(<WhatsAppCheckout />)
    await userEvent.click(screen.getByRole('button', { name: /confirmar por whatsapp/i }))
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('wa.me'), '_blank', 'noopener,noreferrer'
    )
  })

  it('deshabilita el botón con carrito vacío', () => {
    useCartStore.setState({ items: [] })
    render(<WhatsAppCheckout />)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
