import '@/test/mocks/framer-motion'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import VariantSelector from '../VariantSelector'
import type { ProductVariant } from '@/types'

const VARIANTS: ProductVariant[] = [
  { id: 'v1', product_id: 'p1', size: '30', color: 'Black', stock: 5, sku: 'DRP-001' },
  { id: 'v2', product_id: 'p1', size: '32', color: 'Black', stock: 3, sku: 'DRP-002' },
  { id: 'v3', product_id: 'p1', size: '30', color: 'Stone', stock: 0, sku: 'DRP-003' },
]

describe('VariantSelector', () => {
  it('muestra todos los tamaños', () => {
    render(<VariantSelector variants={VARIANTS} selectedVariantId={null} onSelect={vi.fn()} />)
    expect(screen.getByRole('button', { name: '30' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '32' })).toBeInTheDocument()
  })

  it('llama onSelect al hacer click en una talla', async () => {
    const onSelect = vi.fn()
    render(<VariantSelector variants={VARIANTS} selectedVariantId={null} onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('button', { name: '32' }))
    expect(onSelect).toHaveBeenCalledWith('v2')
  })

  it('deshabilita tallas sin stock', () => {
    const noStock = [{ ...VARIANTS[0], stock: 0 }]
    render(<VariantSelector variants={noStock} selectedVariantId={null} onSelect={vi.fn()} />)
    expect(screen.getByRole('button', { name: '30' })).toBeDisabled()
  })
})
