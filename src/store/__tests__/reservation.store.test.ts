import { describe, it, expect, beforeEach } from 'vitest'
import { useReservationStore } from '../reservation.store'

beforeEach(() => {
  useReservationStore.setState({
    reservationIds: [],
    expiresAt: null,
    reference: null,
  })
})

describe('setReservation', () => {
  it('almacena ids, expiresAt y reference', () => {
    useReservationStore.getState().setReservation(
      ['id-1', 'id-2'],
      '2026-06-13T12:00:00Z',
      'DRP-ABC12345'
    )
    const state = useReservationStore.getState()
    expect(state.reservationIds).toEqual(['id-1', 'id-2'])
    expect(state.expiresAt).toBe('2026-06-13T12:00:00Z')
    expect(state.reference).toBe('DRP-ABC12345')
  })
})

describe('clearReservation', () => {
  it('limpia todos los campos', () => {
    useReservationStore.setState({
      reservationIds: ['id-1'],
      expiresAt: '2026-06-13T12:00:00Z',
      reference: 'DRP-ABC12345',
    })
    useReservationStore.getState().clearReservation()
    const state = useReservationStore.getState()
    expect(state.reservationIds).toHaveLength(0)
    expect(state.expiresAt).toBeNull()
    expect(state.reference).toBeNull()
  })
})

describe('isExpired', () => {
  it('retorna true si no hay reserva', () => {
    expect(useReservationStore.getState().isExpired()).toBe(true)
  })

  it('retorna false si expiresAt es en el futuro', () => {
    const future = new Date(Date.now() + 3600000).toISOString()
    useReservationStore.setState({ expiresAt: future, reservationIds: ['x'], reference: 'DRP-X' })
    expect(useReservationStore.getState().isExpired()).toBe(false)
  })

  it('retorna true si expiresAt ya pasó', () => {
    const past = new Date(Date.now() - 1000).toISOString()
    useReservationStore.setState({ expiresAt: past, reservationIds: ['x'], reference: 'DRP-X' })
    expect(useReservationStore.getState().isExpired()).toBe(true)
  })
})
