import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import ProductsPagination from '../ProductsPagination'

describe('ProductsPagination', () => {
  it('deshabilita el botón Anterior en la primera página', () => {
    render(<ProductsPagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /anterior/i })).toBeDisabled()
  })

  it('deshabilita el botón Siguiente en la última página', () => {
    render(<ProductsPagination currentPage={5} totalPages={5} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeDisabled()
  })

  it('llama onPageChange con página + 1 al hacer click en Siguiente', async () => {
    const onPageChange = vi.fn()
    render(<ProductsPagination currentPage={2} totalPages={5} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: /siguiente/i }))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('llama onPageChange con página - 1 al hacer click en Anterior', async () => {
    const onPageChange = vi.fn()
    render(<ProductsPagination currentPage={3} totalPages={5} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: /anterior/i }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('no renderiza nada cuando totalPages es 1', () => {
    const { container } = render(
      <ProductsPagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('llama onPageChange al hacer click en un número de página', async () => {
    const onPageChange = vi.fn()
    render(<ProductsPagination currentPage={1} totalPages={3} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: '3' }))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })
})
