import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import '@/test/mocks/framer-motion'
import DropsGrid from '../DropsGrid'
import type { Collection } from '@/types'

const cols: Collection[] = [
  { id: '1', name: 'Drop 01', slug: 'drop-01', description: null, cover_url: null, active: true, created_at: '2026-01-01' },
  { id: '2', name: 'Drop 02', slug: 'drop-02', description: null, cover_url: null, active: true, created_at: '2026-01-02' },
]

describe('DropsGrid', () => {
  it('muestra todas las colecciones', () => {
    render(<MemoryRouter><DropsGrid collections={cols} /></MemoryRouter>)
    expect(screen.getByText('Drop 01')).toBeInTheDocument()
    expect(screen.getByText('Drop 02')).toBeInTheDocument()
  })

  it('respeta el limite', () => {
    render(<MemoryRouter><DropsGrid collections={cols} limit={1} /></MemoryRouter>)
    expect(screen.queryByText('Drop 02')).not.toBeInTheDocument()
  })
})
