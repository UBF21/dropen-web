import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import '@/test/mocks/framer-motion'
import ProductCard from '../ProductCard'
import type { Product } from '@/types'

const PRODUCT: Product = {
  id: 'p1',
  collection_id: 'c1',
  name: 'Jean Baggy Cargo',
  slug: 'jean-baggy-cargo',
  description: null,
  price: 189,
  moneda_code: 'PEN',
  active: true,
  created_at: '2026-01-01',
  collection: {
    id: 'c1', name: 'Drop 01', slug: 'drop-01',
    description: null, cover_url: null, active: true, created_at: '2026-01-01',
  },
  images: [{
    id: 'i1', product_id: 'p1',
    url: 'https://cdn.example.com/img.webp',
    storage_path: 'p1/img.webp', alt_text: null, order: 0,
    is_primary: true, created_at: '2026-01-01',
  }],
  variants: [{ id: 'v1', product_id: 'p1', size: '32', color: 'Black', stock: 5, sku: 'DRP-001' }],
}

describe('ProductCard', () => {
  it('muestra nombre y precio', () => {
    render(<MemoryRouter><ProductCard product={PRODUCT} /></MemoryRouter>)
    expect(screen.getByText('Jean Baggy Cargo')).toBeInTheDocument()
    expect(screen.getByText('S/ 189.00')).toBeInTheDocument()
  })

  it('linkea a la ruta del producto', () => {
    render(<MemoryRouter><ProductCard product={PRODUCT} /></MemoryRouter>)
    const link = screen.getByRole('link', { name: /jean baggy cargo/i })
    expect(link).toHaveAttribute('href', '/productos/jean-baggy-cargo')
  })

  it('muestra badge Agotado cuando no hay stock', () => {
    const oos = {
      ...PRODUCT,
      variants: [{ ...PRODUCT.variants![0], stock: 0 }],
    }
    render(<MemoryRouter><ProductCard product={oos} /></MemoryRouter>)
    expect(screen.getByText('Agotado')).toBeInTheDocument()
  })
})
