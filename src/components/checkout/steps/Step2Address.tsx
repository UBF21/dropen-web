import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { MapPin, Loader2 } from 'lucide-react'
import { useOrderStore } from '@/store/order.store'
import { Button } from '@/components/ui/button'

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ''

function extractComponent(
  components: google.maps.GeocoderAddressComponent[],
  type: string
): string {
  return components.find((c) => c.types.includes(type))?.long_name ?? ''
}

export default function Step2Address() {
  const { address: savedAddress, setAddress, setStep } = useOrderStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [mapsReady, setMapsReady] = useState(false)
  const [mapsError, setMapsError] = useState(false)
  const [selected, setSelected] = useState({
    address: savedAddress,
    lat: null as number | null,
    lng: null as number | null,
    department: '',
    province: '',
    district: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!MAPS_KEY) { setMapsError(true); return }
    const loader = new Loader({ apiKey: MAPS_KEY, version: 'weekly', libraries: ['places'] })
    loader.load().then(() => setMapsReady(true)).catch(() => setMapsError(true))
  }, [])

  useEffect(() => {
    if (!mapsReady || !inputRef.current) return

    const ac = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'pe' },
      fields: ['formatted_address', 'geometry', 'address_components'],
      types: ['address'],
    })

    ac.addListener('place_changed', () => {
      const place = ac.getPlace()
      if (!place.geometry?.location || !place.address_components) return
      const comps = place.address_components
      setSelected({
        address: place.formatted_address ?? '',
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        department: extractComponent(comps, 'administrative_area_level_1'),
        province:   extractComponent(comps, 'administrative_area_level_2'),
        district:   extractComponent(comps, 'locality') || extractComponent(comps, 'administrative_area_level_3'),
      })
      setError('')
    })
  }, [mapsReady])

  function handleContinue() {
    if (!selected.address) { setError('Seleccioná una dirección del listado'); return }
    if (selected.lat === null) { setError('Seleccioná una dirección de las sugerencias de Google Maps'); return }
    setAddress({ ...selected, country: 'PE' })
    setStep(3)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-[10px] uppercase tracking-[3px] text-text-muted">
          Dirección de entrega
        </label>

        {mapsError ? (
          <input
            defaultValue={savedAddress}
            onChange={(e) => setSelected((s) => ({ ...s, address: e.target.value }))}
            placeholder="Av. Javier Prado 1520, Miraflores, Lima"
            className="w-full h-10 px-3 border border-border bg-surface text-text-primary text-sm focus:outline-none focus:border-accent"
          />
        ) : (
          <div className="relative">
            <input
              ref={inputRef}
              defaultValue={savedAddress}
              placeholder={mapsReady ? 'Buscar dirección en Perú...' : 'Cargando Maps...'}
              disabled={!mapsReady}
              className="w-full h-10 px-3 border border-border bg-surface text-text-primary text-sm focus:outline-none focus:border-accent disabled:opacity-50"
            />
            {!mapsReady && !mapsError && (
              <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-text-muted" />
            )}
          </div>
        )}

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
