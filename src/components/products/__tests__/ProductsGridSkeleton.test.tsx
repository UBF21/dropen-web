import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProductsGridSkeleton from '../ProductsGridSkeleton'

describe('ProductsGridSkeleton', () => {
  it('renderiza exactamente 12 skeletons de card', () => {
    render(<ProductsGridSkeleton />)
    const cards = screen.getAllByTestId('skeleton-card')
    expect(cards).toHaveLength(12)
  })
})
