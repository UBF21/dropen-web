import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, getCurrencySymbol } from '@/lib/currency'

interface SiteCurrency {
  code: string
  symbol: string
  format: (value: number) => string
  formatShort: (value: number) => string
  loading: boolean
}

export function useSiteCurrency(): SiteCurrency {
  const [code, setCode] = useState<string>('PEN')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'store_currency')
      .single()
      .then(({ data, error }) => {
        if (!error && data?.value) setCode(data.value)
        setLoading(false)
      })
  }, [])

  const symbol = getCurrencySymbol(code)

  return {
    code,
    symbol,
    format: (value) => formatCurrency(value, code),
    formatShort: (value) => `${symbol} ${value.toFixed(2)}`,
    loading,
  }
}
