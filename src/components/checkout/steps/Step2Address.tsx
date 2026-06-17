import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import { useEffect, useState } from 'react'
import { MapPin, CheckCircle2, ChevronDown, Check } from 'lucide-react'
import { useOrderStore } from '@/store/order.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DEPARTMENTS, DISTRICTS_BY_DEPT } from '@/data/peru-geo'

// ─── Pin dorado ────────────────────────────────────────────────────────────────

const PIN_ICON = L.divIcon({
  className: '',
  html: `<svg viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg" style="width:28px;height:40px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.4))">
    <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 26 14 26S28 24.5 28 14C28 6.27 21.73 0 14 0z" fill="#C8A96E"/>
    <circle cx="14" cy="14" r="5.5" fill="white"/>
  </svg>`,
  iconSize:   [28, 40],
  iconAnchor: [14, 40],
})

// ─── Sub-componentes del mapa ──────────────────────────────────────────────────

function MapController({ deptLat, deptLng, pinLat, pinLng, flyToPin }: {
  deptLat: number; deptLng: number
  pinLat: number | null; pinLng: number | null
  flyToPin: boolean
}) {
  const map = useMap()

  // Re-centra cuando cambia el departamento
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { map.setView([deptLat, deptLng], 11) }, [deptLat, deptLng])

  // Vuela al pin solo cuando el usuario lo coloca con click (no en drag)
  useEffect(() => {
    if (flyToPin && pinLat !== null && pinLng !== null) {
      map.flyTo([pinLat, pinLng], 16, { duration: 0.8 })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyToPin, pinLat, pinLng])

  return null
}

function MapClickHandler({ onPlace }: { onPlace: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPlace(e.latlng.lat, e.latlng.lng) })
  return null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findDeptCode(name: string) {
  return DEPARTMENTS.find((d) => d.name === name)?.code ?? ''
}

// Clases compartidas para que Select e Input sean visualmente idénticos
const FIELD_CLS =
  'h-10 w-full rounded-none border-border bg-surface text-sm ' +
  'text-text-primary placeholder:text-text-muted ' +
  'focus-visible:ring-0 focus-visible:border-accent focus:outline-none'

// ─── Componente principal ──────────────────────────────────────────────────────

export default function Step2Address() {
  const {
    address: savedAddress, lat: savedLat, lng: savedLng,
    department: savedDept, district: savedDistrict,
    setAddress, setStep,
  } = useOrderStore()

  const [deptCode, setDeptCode] = useState(() => findDeptCode(savedDept))
  const [district, setDistrict] = useState(savedDistrict)
  const [street,   setStreet]   = useState(savedAddress)
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(
    savedLat !== null ? { lat: savedLat!, lng: savedLng! } : null
  )
  const [flyToPin,    setFlyToPin]    = useState(false)
  const [error,       setError]       = useState('')
  const [deptOpen,    setDeptOpen]    = useState(false)
  const [distOpen,    setDistOpen]    = useState(false)

  const selectedDept = DEPARTMENTS.find((d) => d.code === deptCode)
  const districtList = deptCode ? [...(DISTRICTS_BY_DEPT[deptCode] ?? [])].sort() : []

  // ── Reseteos en cascada ────────────────────────────────────────────────────

  function handleDeptChange(code: string) {
    setDeptCode(code)
    setDistrict('')
    setPin(null)
    setFlyToPin(false)
    setError('')
  }

  function handleDistrictChange(value: string) {
    setDistrict(value)
    setPin(null)
    setFlyToPin(false)
    setError('')
  }

  // ── Pin ───────────────────────────────────────────────────────────────────

  function handleMapPlace(lat: number, lng: number) {
    setPin({ lat, lng })
    setFlyToPin(true)   // click → vuela al pin
    setError('')
  }

  function handlePinDrag(lat: number, lng: number) {
    setPin({ lat, lng })
    setFlyToPin(false)  // drag → ya está viendo el punto, no volar
  }

  // ── Continuar ─────────────────────────────────────────────────────────────

  function handleContinue() {
    if (!deptCode)      { setError('Seleccioná un departamento'); return }
    if (!district)      { setError('Seleccioná un distrito'); return }
    if (!street.trim()) { setError('Ingresá tu dirección'); return }
    if (!pin)           { setError('Marcá tu ubicación en el mapa'); return }

    setAddress({
      address:    street.trim(),
      lat:        pin.lat,
      lng:        pin.lng,
      department: selectedDept?.name ?? deptCode,
      province:   '',
      district,
      country:    'PE',
    })
    setStep(3)
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">

      {/* Departamento */}
      <Field label="Departamento">
        <Popover open={deptOpen} onOpenChange={setDeptOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={`${FIELD_CLS} flex items-center gap-1 px-3`}
            >
              <span className="flex-1 text-left truncate text-sm">
                {deptCode ? DEPARTMENTS.find((d) => d.code === deptCode)?.name : <span className="text-text-muted">Seleccionar departamento…</span>}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-text-muted flex-shrink-0 transition-transform ${deptOpen ? 'rotate-180' : ''}`} />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={0} className="w-[var(--radix-popover-trigger-width)] p-0 rounded-none border border-border bg-surface shadow-xl z-[1001]">
            <div className="max-h-60 overflow-y-auto">
            {DEPARTMENTS.map((d) => {
              const isSelected = deptCode === d.code
              return (
                <button
                  key={d.code}
                  type="button"
                  onClick={() => { handleDeptChange(d.code); setDeptOpen(false) }}
                  className={`w-full text-left flex items-center justify-between px-3 py-2.5 text-[11px] uppercase tracking-wide transition-colors hover:bg-background ${
                    isSelected ? 'text-accent font-semibold' : 'text-text-muted'
                  }`}
                >
                  {d.name}
                  {isSelected && <Check className="w-3 h-3 shrink-0" />}
                </button>
              )
            })}
            </div>
          </PopoverContent>
        </Popover>
      </Field>

      {/* Distrito */}
      {deptCode && (
        <Field label="Distrito">
          <Popover open={distOpen} onOpenChange={setDistOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={`${FIELD_CLS} flex items-center gap-1 px-3`}
              >
                <span className="flex-1 text-left truncate text-sm">
                  {district || <span className="text-text-muted">Seleccionar distrito…</span>}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-text-muted flex-shrink-0 transition-transform ${distOpen ? 'rotate-180' : ''}`} />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={0} className="w-[var(--radix-popover-trigger-width)] p-0 rounded-none border border-border bg-surface shadow-xl z-[1001]">
              <div className="max-h-60 overflow-y-auto">
              {districtList.map((d) => {
                const isSelected = district === d
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => { handleDistrictChange(d); setDistOpen(false) }}
                    className={`w-full text-left flex items-center justify-between px-3 py-2.5 text-[11px] uppercase tracking-wide transition-colors hover:bg-background ${
                      isSelected ? 'text-accent font-semibold' : 'text-text-muted'
                    }`}
                  >
                    {d}
                    {isSelected && <Check className="w-3 h-3 shrink-0" />}
                  </button>
                )
              })}
              </div>
            </PopoverContent>
          </Popover>
        </Field>
      )}

      {/* Dirección exacta */}
      {district && (
        <Field label="Dirección" hint="calle, número, referencia">
          <Input
            value={street}
            onChange={(e) => { setStreet(e.target.value); setError('') }}
            placeholder={`Jr. Río Santa Fé 320, ${district}`}
            autoComplete="street-address"
            className={FIELD_CLS}
          />
        </Field>
      )}

      {/* Mapa */}
      {deptCode && selectedDept && (
        <Field label="Ubicación en el mapa">
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
                flyToPin={flyToPin}
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

            {!pin && (
              <div className="absolute bottom-2 left-2 right-2 z-[1000] bg-background/90 border border-border px-3 py-1.5 text-[10px] text-text-muted text-center pointer-events-none">
                <MapPin className="inline w-3 h-3 mr-1 text-accent" />
                Haz clic en el mapa para marcar tu dirección
              </div>
            )}
          </div>
        </Field>
      )}

      {/* Panel de confirmación */}
      {pin && street.trim() && (
        <div className="border border-border bg-surface p-3 flex flex-col gap-1.5">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
            <span className="text-[11px] text-text-primary leading-snug">{street.trim()}</span>
          </div>
          <p className="text-[10px] text-text-muted pl-5">
            {district} · {selectedDept?.name} · Perú
          </p>
          <p className="text-[9px] text-text-muted font-mono pl-5">
            {pin.lat.toFixed(6)}, {pin.lng.toFixed(6)}
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

// ─── UI helper ─────────────────────────────────────────────────────────────────

function Field({ label, hint, children }: {
  label: string; hint?: string; children: React.ReactNode
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
