import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const REFRESH_MS = 5 * 60 * 1000
const LOW_STOCK_THRESHOLD = 3

interface LowStockCount {
  count: number
}

export function useAdminLowStockCount(): LowStockCount {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let active = true

    async function fetchCount() {
      const { count: c, error } = await supabase
        .from('product_variants')
        .select('*', { count: 'exact', head: true })
        .lte('stock', LOW_STOCK_THRESHOLD)
        .gt('stock', 0)

      if (!active) return
      if (error) return
      setCount(c ?? 0)
    }

    fetchCount()
    const id = setInterval(fetchCount, REFRESH_MS)

    return () => {
      active = false
      clearInterval(id)
    }
  }, [])

  return { count }
}
