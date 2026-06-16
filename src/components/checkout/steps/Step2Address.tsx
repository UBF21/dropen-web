import { useEffect, useRef, useState } from 'react'
import { MapPin, Loader2 } from 'lucide-react'
import { useOrderStore } from '@/store/order.store'
import { Button } from '@/components/ui/button'

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY ?? ''

interface GeoFeature {
  properties: {
    formatted: string
    lat: number
    lon: number
    state?: string
    county?: string
    city?: string
    suburb?: string
  }
}

interface Selected {
  address: string
  lat: number | null
  lng: number | null
  department: string
  province: string
  district: string
}

export default function Step2Address() {
  const { address: savedAddress, setAddress, setStep } = useOrderStore()
  const [query, setQuery] = useState(savedAddress)
  const [suggestions, setSuggestions] = useState<GeoFeature[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Selected>({
    address: savedAddress,
    lat: savedAddress ? 0 : null,
    lng: savedAddress ? 0 : null,
    department: '',
    province: '',
    district: '',
  })
  const [error, setError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!query || query.length < 3) {
      setSuggestions([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          text: query,
          'filter[countrycode]': 'pe',
          apiKey: GEOAPIFY_KEY,
          limit: '5',
          lang: 'es',
        })
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?${params}`
        )
        const data = await res.json()
        setSuggestions(data.features ?? [])
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [query])

  function handleSelect(feature: GeoFeature) {
    const p = feature.properties
    setSelected({
      address: p.formatted,
      lat: p.lat,
      lng: p.lon,
      department: p.state ?? '',
      province: p.county ?? '',
      district: p.city ?? p.suburb ?? '',
    })
    setQuery(p.formatted)
    setSuggestions([])
    setError('')
  }

  function handleContinue() {
    if (!selected.address) { setError('Seleccioná una dirección del listado'); return }
    if (selected.lat === null) { setError('Seleccioná una dirección de las sugerencias'); return }
    setAddress({
      address: selected.address,
      lat: selected.lat,
      lng: selected.lng,
      department: selected.department,
      province: selected.province,
      district: selected.district,
      country: 'PE',
    })
    setStep(3)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-[10px] uppercase tracking-[3px] text-text-muted">
          Dirección de entrega
        </label>

        <div className="relative">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelected((s) => ({ ...s, lat: null }))
            }}
            placeholder="Buscar dirección en Perú..."
            className="w-full h-10 px-3 border border-border bg-surface text-text-primary text-sm focus:outline-none focus:border-accent"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-text-muted" />
          )}

          {suggestions.length > 0 && (
            <ul className="absolute z-50 top-full left-0 right-0 border border-border bg-surface shadow-md">
              {suggestions.map((f, i) => (
                <li
                  key={i}
                  onClick={() => handleSelect(f)}
                  className="px-3 py-2 text-[12px] text-text-primary hover:bg-accent/10 cursor-pointer border-b border-border last:border-b-0"
                >
                  {f.properties.formatted}
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="text-[10px] text-destructive">{error}</p>}
      </div>

      {selected.lat !== null && (
        <div className="border border-border bg-surface p-3 flex flex-col gap-1.5">
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
            <span className="text-[11px] text-text-primary">{selected.address}</span>
          </div>
          {selected.district && (
            <p className="text-[10px] text-text-muted pl-5">
              {selected.district}{selected.province ? ` · ${selected.province}` : ''}{selected.department ? ` · ${selected.department}` : ''}
            </p>
          )}
          <p className="text-[9px] text-text-muted font-mono pl-5">
            {selected.lat?.toFixed(6)}, {selected.lng?.toFixed(6)}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => setStep(1)}
          className="flex-1 rounded-none border-border text-text-muted text-[11px] tracking-[2px] uppercase">
          Atrás
        </Button>
        <Button type="button" onClick={handleContinue}
          className="flex-1 rounded-none bg-accent text-background hover:bg-accent/90 py-3 text-[11px] tracking-[3px] uppercase font-semibold">
          Continuar
        </Button>
      </div>
    </div>
  )
}
