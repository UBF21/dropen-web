import '@/test/mocks/framer-motion'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import ProductsFilterBar from '../ProductsFilterBar'
import type { CatalogFilters } from '@/hooks/useProductsCatalog'

const BASE_FILTERS: CatalogFilters = {
  precioMin: 0,
  precioMax: 9999,
  tallas: [],
  colores: [],
  soloStock: false,
  orden: 'recent',
  pagina: 1,
  porPagina: 12,
}

describe('ProductsFilterBar', () => {
  it('muestra el conteo de resultados', () => {
    render(
      <ProductsFilterBar
        filters={BASE_FILTERS}
        totalCount={24}
        onFiltersChange={vi.fn()}
        onClear={vi.fn()}
        onOpenFilters={vi.fn()}
      />
    )
    expect(screen.getByText(/24 producto/i)).toBeInTheDocument()
  })

  it('muestra chips para filtros de talla activos', () => {
    render(
      <ProductsFilterBar
        filters={{ ...BASE_FILTERS, tallas: ['32', '34'] }}
        totalCount={10}
        onFiltersChange={vi.fn()}
        onClear={vi.fn()}
        onOpenFilters={vi.fn()}
      />
    )
    expect(screen.getByText('32')).toBeInTheDocument()
    expect(screen.getByText('34')).toBeInTheDocument()
  })

  it('llama onFiltersChange al quitar chip de talla', async () => {
    const onFiltersChange = vi.fn()
    render(
      <ProductsFilterBar
        filters={{ ...BASE_FILTERS, tallas: ['32'] }}
        totalCount={5}
        onFiltersChange={onFiltersChange}
        onClear={vi.fn()}
        onOpenFilters={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /quitar talla 32/i }))
    expect(onFiltersChange).toHaveBeenCalledWith({ tallas: [] })
  })

  it('llama onClear al hacer click en Limpiar', async () => {
    const onClear = vi.fn()
    render(
      <ProductsFilterBar
        filters={{ ...BASE_FILTERS, tallas: ['32'] }}
        totalCount={5}
        onFiltersChange={vi.fn()}
        onClear={onClear}
        onOpenFilters={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /limpiar/i }))
    expect(onClear).toHaveBeenCalled()
  })

  it('llama onOpenFilters al hacer click en el botón Filtros', async () => {
    const onOpenFilters = vi.fn()
    render(
      <ProductsFilterBar
        filters={BASE_FILTERS}
        totalCount={0}
        onFiltersChange={vi.fn()}
        onClear={vi.fn()}
        onOpenFilters={onOpenFilters}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /filtros/i }))
    expect(onOpenFilters).toHaveBeenCalled()
  })

  it('llama onFiltersChange con el nuevo orden al cambiar el select', async () => {
    const onFiltersChange = vi.fn()
    render(
      <ProductsFilterBar
        filters={BASE_FILTERS}
        totalCount={0}
        onFiltersChange={onFiltersChange}
        onClear={vi.fn()}
        onOpenFilters={vi.fn()}
      />
    )
    await userEvent.selectOptions(screen.getByRole('combobox'), 'price_asc')
    expect(onFiltersChange).toHaveBeenCalledWith({ orden: 'price_asc' })
  })
})
