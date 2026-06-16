import { useEffect, useRef, useState } from 'react'
import { MapPin, Loader2, ChevronDown, CheckCircle2 } from 'lucide-react'
import { useOrderStore } from '@/store/order.store'
import { Button } from '@/components/ui/button'
import { DEPARTMENTS, DISTRICTS_BY_DEPT } from '@/data/peru-geo'

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY ?? ''
const DEBOUNCE_MS  = 400  // ms tras última tecla
const MIN_CHARS    = 5    // mínimo para disparar API

interface GeoFeature {
  properties: {
    formatted: string
    lat: number
    lon: number
    state?: string
    county?: string
    city?: string
  }
}

interface Confirmed {
  formatted: string
  lat: number
  lng: number
}

// Restaura el departamento desde el nombre guardado en el store
function findDeptCode(name: string) {
  return DEPARTMENTS.find((d) => d.name === name)?.code ?? ''
}

export default function Step2Address() {
  const {
    address: savedAddress, lat: savedLat, lng: savedLng,
    department: savedDept, district: savedDistrict,
    setAddress, setStep,
  } = useOrderStore()

  const [deptCode, setDeptCode]     = useState(() => findDeptCode(savedDept))
  const [district, setDistrict]     = useState(savedDistrict)
  const [streetQuery, setStreetQuery] = useState(savedAddress)
  const [suggestions, setSuggestions] = useState<GeoFeature[]>([])
  const [loading, setLoading]       = useState(false)
  const [confirmed, setConfirmed]   = useState<Confirmed | null>(
    savedAddress && savedLat !== null
      ? { formatted: savedAddress, lat: savedLat!, lng: savedLng! }
      : null
  )
  const [error, setError] = useState('')

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef    = useRef<AbortController | null>(null)

  const selectedDept = DEPARTMENTS.find((d) => d.code === deptCode)
  const districtList = deptCode
    ? [...(DISTRICTS_BY_DEPT[deptCode] ?? [])].sort()
    : []

  // Al cambiar departamento, resetear hijos
  function handleDeptChange(code: string) {
    setDeptCode(code)
    setDistrict('')
    setStreetQuery('')
    setConfirmed(null)
    setSuggestions([])
    setError('')
  }

  // Al cambiar distrito, resetear dirección
  function handleDistrictChange(value: string) {
    setDistrict(value)
    setStreetQuery('')
    setConfirmed(null)
    setSuggestions([])
    setError('')
  }

  // Al cambiar texto de calle, invalidar confirmación previa
  function handleStreetChange(value: string) {
    setStreetQuery(value)
    setConfirmed(null)
    setSuggestions([])
    setError('')
  }

  // Autocomplete con debounce 400ms + mínimo 5 chars + filtro geográfico
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!district || streetQuery.length < MIN_CHARS) {
      setSuggestions([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort()
      abortRef.current = new AbortController()
      setLoading(true)

      try {
        // Contextualizamos el query con distrito + departamento ya seleccionados:
        // reduce ambigüedad → más precisión → menos re-búsquedas → menos créditos gastados
        const contextQuery = `${streetQuery}, ${district}, ${selectedDept?.name ?? ''}, Perú`

        const params = new URLSearchParams({
          text:              contextQuery,
          'filter[countrycode]': 'pe',
          // Restringe resultados al radio del departamento seleccionado (lng,lat,metros)
          'filter[circle]':  `${selectedDept!.lng},${selectedDept!.lat},${selectedDept!.radiusKm * 1000}`,
          apiKey:            GEOAPIFY_KEY,
          limit:             '5',
          lang:              'es',
        })

        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?${params}`,
          { signal: abortRef.current.signal }
        )
        const data = await res.json()
        setSuggestions(data.features ?? [])
      } catch (e: unknown) {
        if (e instanceof Error && e.name !== 'AbortError') setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streetQuery, district, deptCode])

  function handleSelect(feature: GeoFeature) {
    const p = feature.properties
    setConfirmed({ formatted: p.formatted, lat: p.lat, lng: p.lon })
    setStreetQuery(p.formatted)
    setSuggestions([])
    setError('')
  }

  function handleContinue() {
    if (!deptCode)   { setError('Seleccioná un departamento'); return }
    if (!district)   { setError('Seleccioná un distrito'); return }
    if (!confirmed)  { setError('Seleccioná una dirección del listado de sugerencias'); return }

    setAddress({
      address:    confirmed.formatted,
      lat:        confirmed.lat,
      lng:        confirmed.lng,
      department: selectedDept?.name ?? deptCode,
      province:   '',
      district,
      country:    'PE',
    })
    setStep(3)
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Departamento ─────────────────────────────────── */}
      <Field label="Departamento">
        <SelectWrapper>
          <select
            value={deptCode}
            onChange={(e) => handleDeptChange(e.target.value)}
            className={selectClass}
          >
            <option value="">Seleccionar departamento…</option>
            {DEPARTMENTS.map((d) => (
              <option key={d.code} value={d.code}>{d.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-text-muted pointer-events-none" />
        </SelectWrapper>
      </Field>

      {/* ── Distrito ─────────────────────────────────────── */}
      {deptCode && (
        <Field label="Distrito">
          <SelectWrapper>
            <select
              value={district}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className={selectClass}
            >
              <option value="">Seleccionar distrito…</option>
              {districtList.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-text-muted pointer-events-none" />
          </SelectWrapper>
        </Field>
      )}

      {/* ── Dirección exacta con autocomplete ────────────── */}
      {district && (
        <Field
          label="Dirección exacta"
          hint="calle, número, referencia"
        >
          <div className="relative">
            <input
              value={streetQuery}
              onChange={(e) => handleStreetChange(e.target.value)}
              placeholder={`Ej: Av. Los Próceres 1520, ${district}`}
              autoComplete="off"
              className="w-full h-10 px-3 border border-border bg-surface text-text-primary text-sm focus:outline-none focus:border-accent"
            />

            {loading && (
              <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-text-muted" />
            )}
            {!loading && confirmed && (
              <CheckCircle2 className="absolute right-3 top-3 w-4 h-4 text-accent" />
            )}

            {/* Dropdown de sugerencias */}
            {suggestions.length > 0 && (
              <ul className="absolute z-50 top-full left-0 right-0 border border-border bg-surface shadow-lg max-h-52 overflow-y-auto">
                {suggestions.map((f, i) => (
                  <li
                    key={i}
                    onMouseDown={(e) => { e.preventDefault(); handleSelect(f) }}
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
        </Field>
      )}

      {/* ── Panel de confirmación ─────────────────────────── */}
      {confirmed && (
        <div className="border border-border bg-surface p-3 flex flex-col gap-1.5">
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
            <span className="text-[11px] text-text-primary leading-snug">{confirmed.formatted}</span>
          </div>
          <p className="text-[10px] text-text-muted pl-5">
            {district} · {selectedDept?.name} · Perú
          </p>
          <p className="text-[9px] text-text-muted font-mono pl-5">
            {confirmed.lat.toFixed(6)}, {confirmed.lng.toFixed(6)}
          </p>
        </div>
      )}

      {error && <p className="text-[10px] text-destructive">{error}</p>}

      {/* ── Botones de navegación ─────────────────────────── */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep(1)}
          className="flex-1 rounded-none border-border text-text-muted text-[11px] tracking-[2px] uppercase"
        >
          Atrás
        </Button>
        <Button
          type="button"
          onClick={handleContinue}
          className="flex-1 rounded-none bg-accent text-background hover:bg-accent/90 py-3 text-[11px] tracking-[3px] uppercase font-semibold"
        >
          Continuar
        </Button>
      </div>
    </div>
  )
}

// ── Helpers de UI ──────────────────────────────────────────

const selectClass =
  'w-full h-10 px-3 pr-8 border border-border bg-surface text-text-primary text-sm ' +
  'focus:outline-none focus:border-accent appearance-none cursor-pointer'

function Field({
  label, hint, children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] uppercase tracking-[3px] text-text-muted flex items-center gap-2">
        {label}
        {hint && (
          <span className="normal-case tracking-normal opacity-50">({hint})</span>
        )}
      </label>
      {children}
    </div>
  )
}

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return <div className="relative">{children}</div>
}
