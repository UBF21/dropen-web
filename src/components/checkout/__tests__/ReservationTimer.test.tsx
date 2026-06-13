import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ReservationTimer from '../ReservationTimer'

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

describe('ReservationTimer', () => {
  it('muestra 02:00:00 para reserva de 2 horas', () => {
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
    render(<ReservationTimer expiresAt={expiresAt} />)
    expect(screen.getByText('02:00:00')).toBeInTheDocument()
  })

  it('muestra 00:00:00 cuando ya expiró', () => {
    const expired = new Date(Date.now() - 1000).toISOString()
    render(<ReservationTimer expiresAt={expired} />)
    expect(screen.getByText('00:00:00')).toBeInTheDocument()
  })

  it('llama onExpire cuando llega a cero', () => {
    const onExpire = vi.fn()
    const expiresAt = new Date(Date.now() + 1500).toISOString()
    render(<ReservationTimer expiresAt={expiresAt} onExpire={onExpire} />)
    act(() => { vi.advanceTimersByTime(2000) })
    expect(onExpire).toHaveBeenCalled()
  })
})
