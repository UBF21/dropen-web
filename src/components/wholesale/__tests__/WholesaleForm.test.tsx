import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import WholesaleForm from '../WholesaleForm'

vi.mock('@/hooks/useProducts', () => ({
  useAllProducts: () => ({ products: [], loading: false }),
}))

describe('WholesaleForm', () => {
  it('muestra el paso 1 con campos de datos', () => {
    render(<WholesaleForm minUnits={6} maxUnits={60} />)
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument()
  })

  it('avanza al paso 2 con datos válidos', async () => {
    render(<WholesaleForm minUnits={6} maxUnits={60} />)
    await userEvent.type(screen.getByLabelText(/nombre completo/i), 'Juan Pérez')
    await userEvent.type(screen.getByLabelText(/email/i), 'juan@test.com')
    await userEvent.type(screen.getByLabelText(/teléfono/i), '+51987654321')
    await userEvent.click(screen.getByRole('button', { name: /siguiente/i }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /atrás/i })).toBeInTheDocument()
    })
  })

  it('muestra error con email inválido', async () => {
    render(<WholesaleForm minUnits={6} maxUnits={60} />)
    // Usar fireEvent.change para escribir directamente en el DOM sin validación nativa de jsdom
    fireEvent.change(screen.getByLabelText(/nombre completo/i), { target: { value: 'Juan Pérez' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'no-es-email' } })
    fireEvent.change(screen.getByLabelText(/teléfono/i), { target: { value: '+51987654321' } })
    // Disparar submit del form directamente para bypass de validación nativa HTML
    const form = screen.getByLabelText(/nombre completo/i).closest('form')!
    fireEvent.submit(form)
    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument()
    })
  })
})
