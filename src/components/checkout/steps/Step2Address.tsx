import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import { useEffect, useRef, useState } from 'react'
import { MapPin, Loader2, ChevronDown, CheckCircle2 } from 'lucide-react'
import { useOrderStore } from '@/store/order.store'
import { Button } from '@/components/ui/button'
import { DEPARTMENTS, DISTRICTS_BY_DEPT } from '@/data/peru-geo'

// ─── Constantes ───────────────────────────────────────────────────────────────

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY ?? ''
const DEBOUNCE_MS  = 400
const MIN_CHARS    = 5

// Pin dorado personalizado — sin dependencia de imágenes externas
const PIN_ICON = L.divIcon({
  className: '',
  html: `<svg viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg" style="width:28px;height:40px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))">
    <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 26 14 26S28 24.5 28 14C28 6.27 21.73 0 14 0z" fill="#C8A96E"/>
    <circle cx="14" cy="14" r="5.5" fill="white"/>
  </svg>`,
  iconSize:   [28, 40],
  iconAnchor: [14, 40],
})

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface GeoFeature {
  properties: {
    formatted: string
    lat: number
    lon: number
  }
}

interface PinState {
  lat: number
  lng: number
  address: string   // texto que se guarda como dirección
  source: 'autocomplete' | 'manual'
}

// ─── Sub-componentes del mapa ─────────────────────────────────────────────────

/** Vuela al pin cuando se confirma por autocomplete; re-centra al cambiar dpto. */
function MapController({
  deptLat, deptLng,
  pinLat, pinLng, pinSource,
}: {
  deptLat: number; deptLng: number
  pinLat: number | null; pinLng: number | null; pinSource: 'autocomplete' | 'manual' | null
}) {
  const map = useMap()
  const prevDept = useRef('')
  const prevPin  = useRef('')

  useEffect(() => {
    const deptKey = `${deptLat},${deptLng}`
    const pinKey  = `${pinLat},${pinLng}`

    if (pinLat !== null && pinLng !== null && pinSource === 'autocomplete' && pinKey !== prevPin.current) {
      map.flyTo([pinLat, pinLng], 16, { duration: 0.9 })
      prevPin.current  = pinKey
      prevDept.current = deptKey
    } else if (deptKey !== prevDept.current) {
      map.setView([deptLat, deptLng], 11)
      prevDept.current = deptKey
      prevPin.current  = ''
    }
  })

  return null
}

/** Click en el mapa → coloca o mueve el pin manualmente. */
function MapClickHandler({ onPlace }: { onPlace: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPlace(e.latlng.lat, e.latlng.lng) })
  return null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findDeptCode(name: string) {
  return DEPARTMENTS.find((d) => d.name === name)?.code ?? ''
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Step2Address() {
  const {
    address: savedAddress, lat: savedLat, lng: savedLng,
    department: savedDept, district: savedDistrict,
    setAddress, setStep,
  } = useOrderStore()

  const [deptCode,     setDeptCode]     = useState(() => findDeptCode(savedDept))
  const [district,     setDistrict]     = useState(savedDistrict)
  const [streetQuery,  setStreetQuery]  = useState(savedAddress)
  const [suggestions,  setSuggestions]  = useState<GeoFeature[]>([])
  const [loading,      setLoading]      = useState(false)
  const [noResults,    setNoResults]    = useState(false)
  const [pin, setPin] = useState<PinState | null>(
    savedAddress && savedLat !== null
      ? { lat: savedLat!, lng: savedLng!, address: savedAddress, source: 'autocomplete' }
      : null
  )
  const [error, setError] = useState('')

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef    = useRef<AbortController | null>(null)

  const selectedDept  = DEPARTMENTS.find((d) => d.code === deptCode)
  const districtList  = deptCode ? [...(DISTRICTS_BY_DEPT[deptCode] ?? [])].sort() : []
  const showMap       = !!deptCode   // el mapa aparece en cuanto hay departamento

  // ── Reseteos en cascada ──────────────────────────────────────────────────────

  function handleDeptChange(code: string) {
    setDeptCode(code)
    setDistrict('')
    setStreetQuery('')
    setSuggestions([])
    setNoResults(false)
    setPin(null)
    setError('')
  }

  function handleDistrictChange(value: string) {
    setDistrict(value)
    setStreetQuery('')
    setSuggestions([])
    setNoResults(false)
    setPin(null)
    setError('')
  }

  function handleStreetChange(value: string) {
    setStreetQuery(value)
    setSuggestions([])
    setNoResults(false)
    if (pin?.source === 'autocomplete') setPin(null) // invalida confirmación anterior
    setError('')
  }

  // ── Autocomplete con debounce ────────────────────────────────────────────────

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!district || streetQuery.length < MIN_CHARS) {
      setSuggestions([])
      setNoResults(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort()
      abortRef.current = new AbortController()
      setLoading(true)
      setNoResults(false)

      try {
        // Contextualizamos el query para máxima precisión desde el primer intento
        const contextQuery = `${streetQuery}, ${district}, ${selectedDept?.name ?? ''}, Perú`

        const params = new URLSearchParams({
          text:               contextQuery,
          'filter[countrycode]': 'pe',
          // bias[proximity] sesga resultados hacia el dpto sin rechazarlos (más flexible que filter[circle])
          'bias[proximity]':  `${selectedDept!.lng},${selectedDept!.lat}`,
          apiKey:             GEOAPIFY_KEY,
          limit:              '5',
          lang:               'es',
        })

        const res  = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?${params}`,
          { signal: abortRef.current.signal }
        )
        const data = await res.json()
        const features: GeoFeature[] = data.features ?? []
        setSuggestions(features)
        setNoResults(features.length === 0)
      } catch (e: unknown) {
        if (e instanceof Error && e.name !== 'AbortError') {
          setSuggestions([])
          setNoResults(true)
        }
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streetQuery, district, deptCode])

  // ── Selección de sugerencia ──────────────────────────────────────────────────

  function handleSelectSuggestion(f: GeoFeature) {
    const p = f.properties
    setPin({ lat: p.lat, lng: p.lon, address: p.formatted, source: 'autocomplete' })
    setStreetQuery(p.formatted)
    setSuggestions([])
    setNoResults(false)
    setError('')
  }

  // ── Pin manual en el mapa ─────────────────────────────────────────────────────

  function handleMapPlace(lat: number, lng: number) {
    const addressText = streetQuery.trim() || `${district}, ${selectedDept?.name ?? ''}, Perú`
    setPin({ lat, lng, address: addressText, source: 'manual' })
    setSuggestions([])
    setError('')
  }

  // ── Drag del pin ──────────────────────────────────────────────────────────────

  function handlePinDrag(lat: number, lng: number) {
    if (!pin) return
    setPin((prev) => prev ? { ...prev, lat, lng } : null)
  }

  // ── Continuar ────────────────────────────────────────────────────────────────

  function handleContinue() {
    if (!deptCode)  { setError('Seleccioná un departamento'); return }
    if (!district)  { setError('Seleccioná un distrito'); return }
    if (!pin)       { setError('Seleccioná una dirección del listado o marcá tu ubicación en el mapa'); return }

    setAddress({
      address:    pin.address,
      lat:        pin.lat,
      lng:        pin.lng,
      department: selectedDept?.name ?? deptCode,
      province:   '',
      district,
      country:    'PE',
    })
    setStep(3)
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">

      {/* Departamento */}
      <Field label="Departamento">
        <SelectBox value={deptCode} onChange={handleDeptChange} placeholder="Seleccionar departamento…">
          {DEPARTMENTS.map((d) => (
            <option key={d.code} value={d.code}>{d.name}</option>
          ))}
        </SelectBox>
      </Field>

      {/* Distrito */}
      {deptCode && (
        <Field label="Distrito">
          <SelectBox value={district} onChange={handleDistrictChange} placeholder="Seleccionar distrito…">
            {districtList.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </SelectBox>
        </Field>
      )}

      {/* Mapa — aparece apenas se seleccione departamento */}
      {showMap && selectedDept && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[3px] text-text-muted">
              Ubicación en el mapa
            </span>
            {pin?.source === 'manual' && (
              <span className="text-[9px] text-accent flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Pin colocado
              </span>
            )}
          </div>

          <div className="relative border border-border overflow-hidden" style={{ height: 220 }}>
            <MapContainer
              center={[selectedDept.lat, selectedDept.lng]}
              zoom={11}
              style={{ height: '100%', width: '100%' }}
              zoomControl
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
                maxZoom={19}
              />
              <MapController
                deptLat={selectedDept.lat}
                deptLng={selectedDept.lng}
                pinLat={pin?.lat ?? null}
                pinLng={pin?.lng ?? null}
                pinSource={pin?.source ?? null}
              />
              <MapClickHandler onPlace={handleMapPlace} />
              {pin && (
                <Marker
                  position={[pin.lat, pin.lng]}
                  icon={PIN_ICON}
                  draggable
                  eventHandlers={{
                    dragend: (e) => {
                      const pos = (e.target as L.Marker).getLatLng()
                      handlePinDrag(pos.lat, pos.lng)
                    },
                  }}
                />
              )}
            </MapContainer>

            {/* Instrucción flotante sobre el mapa */}
            {!pin && (
              <div className="absolute bottom-2 left-2 right-2 z-[1000] bg-background/90 border border-border px-3 py-1.5 text-[10px] text-text-muted text-center pointer-events-none">
                <MapPin className="inline w-3 h-3 mr-1 text-accent" />
                Haz clic en el mapa para marcar tu dirección
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dirección exacta con autocomplete */}
      {district && (
        <Field label="Dirección exacta" hint="calle y número">
          <div className="relative">
            <input
              value={streetQuery}
              onChange={(e) => handleStreetChange(e.target.value)}
              placeholder={`Ej: Jr. Río Santa Fé 320, ${district}`}
              autoComplete="off"
              className="w-full h-10 px-3 border border-border bg-surface text-text-primary text-sm focus:outline-none focus:border-accent"
            />
            {loading && (
              <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-text-muted" />
            )}
            {!loading && pin?.source === 'autocomplete' && (
              <CheckCircle2 className="absolute right-3 top-3 w-4 h-4 text-accent" />
            )}

            {/* Dropdown sugerencias — z-index alto para quedar sobre el mapa */}
            {suggestions.length > 0 && (
              <ul className="absolute z-[1001] top-full left-0 right-0 border border-border bg-surface shadow-lg max-h-52 overflow-y-auto">
                {suggestions.map((f, i) => (
                  <li
                    key={i}
                    onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(f) }}
                    className="px-3 py-2.5 text-[11px] text-text-primary hover:bg-accent/10 cursor-pointer border-b border-border last:border-b-0 leading-snug"
                  >
                    {f.properties.formatted}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {streetQuery.length > 0 && streetQuery.length < MIN_CHARS && (
            <p className="text-[10px] text-text-muted mt-1">
              Escribe al menos {MIN_CHARS} caracteres para buscar
            </p>
          )}
          {noResults && (
            <p className="text-[10px] text-text-muted mt-1">
              No se encontraron sugerencias — puedes escribir tu dirección y marcar el pin en el mapa.
            </p>
          )}
        </Field>
      )}

      {/* Panel de confirmación */}
      {pin && (
        <div className="border border-border bg-surface p-3 flex flex-col gap-1.5">
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
            <span className="text-[11px] text-text-primary leading-snug">{pin.address}</span>
          </div>
          <p className="text-[10px] text-text-muted pl-5">
            {district} · {selectedDept?.name} · Perú
          </p>
          <p className="text-[9px] text-text-muted font-mono pl-5">
            {pin.lat.toFixed(6)}, {pin.lng.toFixed(6)}
            {pin.source === 'manual' && ' · pin manual'}
          </p>
        </div>
      )}

      {error && <p className="text-[10px] text-destructive">{error}</p>}

      {/* Botones */}
      <div className="flex gap-3">
        <Button
          type="button" variant="outline" onClick={() => setStep(1)}
          className="flex-1 rounded-none border-border text-text-muted text-[11px] tracking-[2px] uppercase"
        >
          Atrás
        </Button>
        <Button
          type="button" onClick={handleContinue}
          className="flex-1 rounded-none bg-accent text-background hover:bg-accent/90 py-3 text-[11px] tracking-[3px] uppercase font-semibold"
        >
          Continuar
        </Button>
      </div>
    </div>
  )
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

function Field({ label, hint, children }: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] uppercase tracking-[3px] text-text-muted flex items-center gap-2">
        {label}
        {hint && <span className="normal-case tracking-normal opacity-50">({hint})</span>}
      </label>
      {children}
    </div>
  )
}

function SelectBox({ value, onChange, placeholder, children }: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 pr-8 border border-border bg-surface text-text-primary text-sm focus:outline-none focus:border-accent appearance-none cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-text-muted pointer-events-none" />
    </div>
  )
}
