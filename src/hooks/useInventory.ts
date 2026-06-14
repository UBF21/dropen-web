import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// ─── Domain types ─────────────────────────────────────────────────────────────

export type MovementType = 'in' | 'out'

export interface InventoryMovement {
  id: string
  variant_id: string
  type: MovementType
  quantity: number
  notes: string | null
  created_at: string
  updated_at?: string
  deleted_at?: string | null
  variant?: {
    sku: string
    size: string
    color: string
    stock: number
    product?: { name: string }
  }
}

export interface ScannedVariant {
  id: string
  sku: string
  size: string
  color: string
  stock: number
  product?: { id: string; name: string; price: number }
}

// ─── Internal Supabase join shapes (typed para evitar `as unknown as`) ────────

interface VariantRow {
  id: string
  sku: string
  size: string
  color: string
  stock: number
  product:
    | { id: string; name: string; price: number }
    | { id: string; name: string; price: number }[]
    | null
}

interface MovementRow {
  id: string
  variant_id: string
  type: MovementType
  quantity: number
  notes: string | null
  created_at: string
  updated_at?: string
  deleted_at?: string | null
  variant: {
    sku: string
    size: string
    color: string
    stock: number
    product: { name: string } | { name: string }[] | null
  } | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Número de movimientos cargados por defecto en el historial */
const DEFAULT_MOVEMENTS_LIMIT = 30

/**
 * Cantidad fija por movimiento.
 * Por diseño de dominio: un escaneo = una unidad. No configurable por el cliente
 * para evitar manipulación de inventario desde el frontend.
 */
const MOVEMENT_QUANTITY = 1 as const

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Supabase devuelve joins como array incluso cuando la relación es many-to-one.
 * Esta función normaliza ambos casos sin recurrir a `as unknown as`.
 */
function normalizeJoin<T>(raw: T | T[] | null | undefined): T | undefined {
  if (raw === null || raw === undefined) return undefined
  return Array.isArray(raw) ? raw[0] : raw
}

function toScannedVariant(row: VariantRow): ScannedVariant {
  return {
    id: row.id,
    sku: row.sku,
    size: row.size,
    color: row.color,
    stock: row.stock,
    product: normalizeJoin(row.product),
  }
}

function toInventoryMovement(row: MovementRow): InventoryMovement {
  return {
    id: row.id,
    variant_id: row.variant_id,
    type: row.type,
    quantity: row.quantity,
    notes: row.notes,
    created_at: row.created_at,
    ...(row.updated_at && { updated_at: row.updated_at }),
    ...(row.deleted_at !== undefined && { deleted_at: row.deleted_at }),
    variant: row.variant
      ? {
          sku: row.variant.sku,
          size: row.variant.size,
          color: row.variant.color,
          stock: row.variant.stock,
          product: normalizeJoin(row.variant.product),
        }
      : undefined,
  }
}

// ─── Public interface ─────────────────────────────────────────────────────────

export interface UseInventoryResult {
  movements: InventoryMovement[]
  loading: boolean
  /** Mensaje de error al cargar historial; null cuando está OK */
  movementsError: string | null
  findVariantBySku: (sku: string) => Promise<ScannedVariant | null>
  registerMovement: (variantId: string, type: MovementType) => Promise<{ id: string }>
  loadRecentMovements: (limit?: number) => Promise<void>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useInventory(): UseInventoryResult {
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [loading, setLoading] = useState(false)
  const [movementsError, setMovementsError] = useState<string | null>(null)

  /**
   * Busca una variante por SKU exacto.
   * Devuelve null si no existe — el caller decide cómo mostrar el error.
   * El trim() tolera el carácter extra que algunos lectores láser añaden al final.
   *
   * Seguridad: RLS en product_variants permite SELECT a anon/admin.
   * No se filtran columnas sensibles porque price/stock no son confidenciales en admin.
   */
  const findVariantBySku = useCallback(async (sku: string): Promise<ScannedVariant | null> => {
    const { data, error } = await supabase
      .from('product_variants')
      .select('id, sku, size, color, stock, product:products(id, name, price)')
      .eq('sku', sku.trim())
      .is('deleted_at', null)
      .single()

    if (error || !data) return null

    return toScannedVariant(data as unknown as VariantRow)
  }, [])

  /**
   * Registra un movimiento de inventario con cantidad fija.
   * Lanza el error para que el caller (useScanHandler) lo capture y muestre toast.
   *
   * Seguridad:
   * - quantity viene hardcodeado en el servidor: aunque el cliente manipule la red,
   *   un trigger o RLS policy debería rechazar quantity != 1. Si esa validación no
   *   existe en la DB, es la única superficie de riesgo.
   * - RLS en inventory_movements: INSERT solo para admin autenticados.
   */
  const registerMovement = useCallback(
    async (variantId: string, type: MovementType): Promise<{ id: string }> => {
      const { data, error } = await supabase
        .from('inventory_movements')
        .insert({ variant_id: variantId, type, quantity: MOVEMENT_QUANTITY })
        .select('id')
        .single()

      if (error) throw error
      return data as { id: string }
    },
    [],
  )

  /**
   * Carga el historial reciente. Expone movementsError para feedback visible al usuario.
   * Un fallo silencioso en carga de historial puede hacer creer que no hay movimientos.
   */
  const loadRecentMovements = useCallback(async (limit = DEFAULT_MOVEMENTS_LIMIT) => {
    setLoading(true)
    setMovementsError(null)
    try {
      const { data, error } = await supabase
        .from('inventory_movements')
        .select(`
          id, variant_id, type, quantity, notes, created_at, updated_at, deleted_at,
          variant:product_variants(
            sku, size, color, stock,
            product:products(name)
          )
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      setMovements(((data ?? []) as unknown as MovementRow[]).map(toInventoryMovement))
    } catch {
      setMovementsError('No se pudo cargar el historial. Intentá de nuevo.')
      setMovements([])
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    movements,
    loading,
    movementsError,
    findVariantBySku,
    registerMovement,
    loadRecentMovements,
  }
}
