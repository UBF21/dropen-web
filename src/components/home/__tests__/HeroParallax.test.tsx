import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import '@/test/mocks/framer-motion'
import HeroParallax from '../HeroParallax'

describe('HeroParallax', () => {
  it('muestra heading DROPEN', () => {
    render(<MemoryRouter><HeroParallax /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /dropen/i })).toBeInTheDocument()
  })

  it('tiene link a colecciones', () => {
    render(<MemoryRouter><HeroParallax /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /ver colecciones/i }))
      .toHaveAttribute('href', '/colecciones')
  })

  it('renderiza imagen de fondo con jeans-stack', () => {
    render(<MemoryRouter><HeroParallax /></MemoryRouter>)
    const imgs = document.querySelectorAll('img')
    const srcs = Array.from(imgs).map(img => img.getAttribute('src') ?? '')
    expect(srcs.some(s => s.includes('jeans-stack.jpg'))).toBe(true)
  })

  it('renderiza panel flotante con jeans-detail', () => {
    render(<MemoryRouter><HeroParallax /></MemoryRouter>)
    const imgs = document.querySelectorAll('img')
    const srcs = Array.from(imgs).map(img => img.getAttribute('src') ?? '')
    expect(srcs.some(s => s.includes('jeans-detail.jpg'))).toBe(true)
  })

  it('incluye grain overlay SVG', () => {
    render(<MemoryRouter><HeroParallax /></MemoryRouter>)
    expect(document.querySelector('filter[id]')).toBeInTheDocument()
  })
})
