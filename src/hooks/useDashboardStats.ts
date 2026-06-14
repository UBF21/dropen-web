import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { DateRange } from 'react-day-picker'
import { startOfDay, endOfDay, subDays } from 'date-fns'

export interface DailyRevenue {
  date: string
  revenue: number
  units: number
}

export interface DailyMovements {
  date: string
  in: number
  out: number
}

export interface DashboardStats {
  totalRevenue: number
  totalUnitsSold: number
  totalStock: number
  activeProducts: number
  revenueByDay: DailyRevenue[]
  movementsByDay: DailyMovements[]
}

interface UseDashboardStatsResult {
  stats: DashboardStats | null
  loading: boolean
  error: string | null
  loadStats: (range?: DateRange) => Promise<void>
}

const DEFAULT_DAYS = 30

export function useDashboardStats(): UseDashboardStatsResult {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(async (range?: DateRange) => {
    setLoading(true)
    setError(null)

    const from = range?.from
      ? startOfDay(range.from).toISOString()
      : startOfDay(subDays(new Date(), DEFAULT_DAYS)).toISOString()
    const to = range?.to
      ? endOfDay(range.to).toISOString()
      : endOfDay(new Date()).toISOString()

    try {
      const [movementsRes, stockRes, productsRes] = await Promise.all([
        supabase
          .from('inventory_movements')
          .select('type, quantity, created_at, variant:product_variants(stock, product:products(price))')
          .is('deleted_at', null)
          .gte('created_at', from)
          .lte('created_at', to),
        supabase
          .from('product_variants')
          .select('stock')
          .is('deleted_at', null),
        supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('active', true)
          .is('deleted_at', null),
      ])

      if (movementsRes.error) throw movementsRes.error
      if (stockRes.error) throw stockRes.error

      const movements = movementsRes.data ?? []

      let totalRevenue = 0
      let totalUnitsSold = 0
      const revenueMap = new Map<string, { revenue: number; units: number }>()
      const movementMap = new Map<string, { in: number; out: number }>()

      for (const m of movements) {
        const day = (m.created_at as string).slice(0, 10)
        const type = m.type as 'in' | 'out'

        if (!movementMap.has(day)) movementMap.set(day, { in: 0, out: 0 })
        movementMap.get(day)![type] += m.quantity as number

        if (type === 'out') {
          const variant = Array.isArray(m.variant) ? m.variant[0] : m.variant
          const product = variant
            ? Array.isArray((variant as { product: unknown }).product)
              ? ((variant as { product: unknown[] }).product)[0]
              : (variant as { product: unknown }).product
            : null
          const price = (product as { price?: number } | null)?.price ?? 0
          const revenue = price * (m.quantity as number)

          totalRevenue += revenue
          totalUnitsSold += m.quantity as number

          if (!revenueMap.has(day)) revenueMap.set(day, { revenue: 0, units: 0 })
          const rd = revenueMap.get(day)!
          rd.revenue += revenue
          rd.units += m.quantity as number
        }
      }

      const totalStock = (stockRes.data ?? []).reduce(
        (sum, v) => sum + ((v as { stock: number }).stock ?? 0),
        0,
      )
      const activeProducts = productsRes.count ?? 0

      const revenueByDay: DailyRevenue[] = Array.from(revenueMap.entries())
        .map(([date, d]) => ({ date, ...d }))
        .sort((a, b) => a.date.localeCompare(b.date))

      const movementsByDay: DailyMovements[] = Array.from(movementMap.entries())
        .map(([date, d]) => ({ date, ...d }))
        .sort((a, b) => a.date.localeCompare(b.date))

      setStats({ totalRevenue, totalUnitsSold, totalStock, activeProducts, revenueByDay, movementsByDay })
    } catch {
      setError('No se pudieron cargar las estadísticas.')
    } finally {
      setLoading(false)
    }
  }, [])

  return { stats, loading, error, loadStats }
}
