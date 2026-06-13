import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Header from '../Header'

vi.mock('@/store/cart.store', () => ({
  useCartItemCount: vi.fn().mockReturnValue(0),
}))

vi.mock('@/store/ui.store', () => ({
  useUIStore: vi.fn().mockImplementation((selector: (s: { openCart: () => void }) => unknown) =>
    selector({ openCart: vi.fn() })
  ),
}))

describe('Header', () => {
  it('muestra el logo DROPEN', () => {
    render(<MemoryRouter><Header /></MemoryRouter>)
    expect(screen.getByText('DROPEN')).toBeInTheDocument()
  })

  it('muestra links de navegación en desktop', () => {
    render(<MemoryRouter><Header /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /colecciones/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /wholesale/i })).toBeInTheDocument()
  })

  it('muestra botón de carrito', () => {
    render(<MemoryRouter><Header /></MemoryRouter>)
    expect(screen.getByRole('button', { name: /abrir carrito/i })).toBeInTheDocument()
  })
})
