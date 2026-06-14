import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import ProductsTable from '../ProductsTable'
import type { Product } from '@/types'

const PRODUCT: Product = {
  id: 'p1', collection_id: 'c1', name: 'Jean Baggy', slug: 'jean-baggy',
  description: null, price: 189, moneda_code: 'PEN', active: true, created_at: '2026-01-01',
  images: [], variants: [{ id: 'v1', product_id: 'p1', size: '32', color: 'Black', stock: 5, sku: 'DRP-001' }],
}

describe('ProductsTable', () => {
  it('muestra los productos', () => {
    render(<ProductsTable products={[PRODUCT]} onEdit={vi.fn()} onDelete={vi.fn()} onToggleActive={vi.fn()} />)
    expect(screen.getByText('Jean Baggy')).toBeInTheDocument()
  })

  it('llama onEdit al hacer click en editar', async () => {
    const onEdit = vi.fn()
    render(<ProductsTable products={[PRODUCT]} onEdit={onEdit} onDelete={vi.fn()} onToggleActive={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Editar' }))
    expect(onEdit).toHaveBeenCalledWith(PRODUCT)
  })

  it('muestra mensaje cuando no hay productos', () => {
    render(<ProductsTable products={[]} onEdit={vi.fn()} onDelete={vi.fn()} onToggleActive={vi.fn()} />)
    expect(screen.getByText(/sin resultados/i)).toBeInTheDocument()
  })

  it('pide confirmación antes de eliminar', async () => {
    const onDelete = vi.fn()
    render(<ProductsTable products={[PRODUCT]} onEdit={vi.fn()} onDelete={onDelete} onToggleActive={vi.fn()} />)

    // Click en papelera NO llama onDelete directamente
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    expect(onDelete).not.toHaveBeenCalled()

    // El Sheet muestra el texto de advertencia
    expect(screen.getByText(/esta acción no se puede deshacer/i)).toBeInTheDocument()

    // Confirmar elimina
    await userEvent.click(screen.getByRole('button', { name: /sí, eliminar/i }))
    expect(onDelete).toHaveBeenCalledWith('p1')
  })
})
