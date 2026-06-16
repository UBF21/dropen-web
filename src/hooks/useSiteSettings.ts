import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Settings = Record<string, string>

let cached: Settings | null = null
let pending: Promise<Settings> | null = null

function fetchSettings(): Promise<Settings> {
  if (!pending) {
    pending = Promise.resolve(supabase.from('site_settings').select('key, value')).then(({ data }) => {
      cached = Object.fromEntries(
        (data ?? []).map(({ key, value }: { key: string; value: string }) => [key, value])
      )
      return cached!
    })
  }
  return pending!
}

export function useSiteSettings(): Settings {
  const [settings, setSettings] = useState<Settings>(() => cached ?? {})

  useEffect(() => {
    fetchSettings().then(setSettings)
  }, [])

  return settings
}

export function useLowStockThreshold(): number {
  const settings = useSiteSettings()
  return Number(settings.low_stock_threshold ?? 3)
}
