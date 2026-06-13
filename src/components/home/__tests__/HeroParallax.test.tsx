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
})
