import { supabase } from './supabase'
import type { CartItem } from '@/types'

export interface CreateReservationsResult {
  success: boolean
  reservationIds: string[]
  expiresAt: string
  reference: string
  error?: string
}

export async function createReservations(
  items: CartItem[]
): Promise<CreateReservationsResult> {
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
  const reservationIds: string[] = []

  if (items.length === 0) {
    return { success: false, reservationIds: [], expiresAt: '', reference: '', error: 'El carrito está vacío' }
  }

  try {
    for (const item of items) {
      const { data, error } = await supabase
        .from('reservations')
        .insert({
          variant_id: item.variantId,
          quantity: item.quantity,
          status: 'pending',
          expires_at: expiresAt,
        })
        .select('id')
        .single()

      if (error) throw error
      reservationIds.push(data.id)
    }

    const reference = `DRP-${reservationIds[0].substring(0, 8).toUpperCase()}`
    return { success: true, reservationIds, expiresAt, reference }
  } catch (err) {
    if (reservationIds.length > 0) {
      await supabase
        .from('reservations')
        .update({ status: 'expired' })
        .in('id', reservationIds)
    }
    return {
      success: false,
      reservationIds: [],
      expiresAt: '',
      reference: '',
      error:
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Error desconocido',
    }
  }
}
