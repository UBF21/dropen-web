import '@/test/mocks/framer-motion'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import ProductGallery from '../ProductGallery'
import type { ProductImage } from '@/types'

const IMAGES: ProductImage[] = [
  {
    id: 'i1',
    product_id: 'p1',
    url: 'https://cdn/img1',
    storage_path: 'p1/img1.webp',
    alt_text: 'Frente',
    order: 0,
    is_primary: true,
    created_at: '2026-01-01',
  },
  {
    id: 'i2',
    product_id: 'p1',
    url: 'https://cdn/img2',
    storage_path: 'p1/img2.webp',
    alt_text: 'Espalda',
    order: 1,
    is_primary: false,
    created_at: '2026-01-01',
  },
]

describe('ProductGallery', () => {
  it('renderiza la imagen activa', () => {
    render(<ProductGallery images={IMAGES} productName="Jean" />)
    expect(screen.getByAltText('Frente')).toBeInTheDocument()
  })

  it('abre el lightbox al hacer click en la imagen principal', async () => {
    render(<ProductGallery images={IMAGES} productName="Jean" />)
    await userEvent.click(screen.getByRole('button', { name: /ampliar imagen/i }))
    expect(screen.getByRole('button', { name: /cerrar/i })).toBeInTheDocument()
  })

  it('muestra "Sin imagen" cuando no hay imágenes', () => {
    render(<ProductGallery images={[]} productName="Jean" />)
    expect(screen.getByText(/sin imagen/i)).toBeInTheDocument()
  })
})
