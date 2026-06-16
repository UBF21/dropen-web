import { supabase } from './supabase'
import type { Order, CreateOrderInput } from '@/types'

export interface CreateOrderResult {
  success: boolean
  order?: Order
  error?: string
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const { data, error } = await supabase
    .from('orders')
    .insert(input)
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, order: data as Order }
}

export async function getOrder(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Order
}
