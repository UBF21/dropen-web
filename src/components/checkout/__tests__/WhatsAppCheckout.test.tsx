import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import WhatsAppCheckout from '../WhatsAppCheckout'
import { useCartStore } from '@/store/cart.store'
import type { CartItem } from '@/types'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const ITEM: CartItem = {
  variantId: 'v1', productId: 'p1', productName: 'Jean Baggy Cargo',
  size: '32', color: 'Black', price: 189, quantity: 1, imageUrl: '',
}

function renderComp() {
  return render(
    <MemoryRouter>
      <WhatsAppCheckout />
    </MemoryRouter>
  )
}

beforeEach(() => {
  useCartStore.setState({ items: [ITEM] })
  mockNavigate.mockReset()
})

describe('WhatsAppCheckout', () => {
  it('muestra el total en el botón', () => {
    renderComp()
    expect(screen.getByRole('button', { name: /s\/ 189\.00/i })).toBeInTheDocument()
  })

  it('navega a /checkout al hacer click', async () => {
    renderComp()
    await userEvent.click(screen.getByRole('button', { name: /reservar/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/checkout')
  })

  it('deshabilita el botón con carrito vacío', () => {
    useCartStore.setState({ items: [] })
    renderComp()
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
