import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import { useEffect, useRef, useState } from 'react'
import { MapPin, ChevronDown, CheckCircle2 } from 'lucide-react'
import { useOrderStore } from '@/store/order.store'
import { Button } from '@/components/ui/button'
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

function MapController({ deptLat, deptLng, pinLat, pinLng, firstPin }: {
  deptLat: number; deptLng: number
  pinLat: number | null; pinLng: number | null
  firstPin: boolean
}) {
  const map = useMap()
  const prevDept = useRef('')

  useEffect(() => {
    const deptKey = `${deptLat},${deptLng}`
    if (firstPin && pinLat !== null && pinLng !== null) {
      map.flyTo([pinLat, pinLng], 16, { duration: 0.8 })
    } else if (deptKey !== prevDept.current) {
      map.setView([deptLat, deptLng], 11)
      prevDept.current = deptKey
    }
  })

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

// ─── Componente principal ──────────────────────────────────────────────────────

export default function Step2Address() {
  const {
    address: savedAddress, lat: savedLat, lng: savedLng,
    department: savedDept, district: savedDistrict,
    setAddress, setStep,
  } = useOrderStore()

  const [deptCode,  setDeptCode]  = useState(() => findDeptCode(savedDept))
  const [district,  setDistrict]  = useState(savedDistrict)
  const [street,    setStreet]    = useState(savedAddress)
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(
    savedLat !== null ? { lat: savedLat!, lng: savedLng! } : null
  )
  const [firstPin, setFirstPin]   = useState(false)
  const [error, setError]         = useState('')

  const selectedDept = DEPARTMENTS.find((d) => d.code === deptCode)
  const districtList = deptCode ? [...(DISTRICTS_BY_DEPT[deptCode] ?? [])].sort() : []

  // ── Reseteos en cascada ────────────────────────────────────────────────────

  function handleDeptChange(code: string) {
    setDeptCode(code)
    setDistrict('')
    setPin(null)
    setError('')
  }

  function handleDistrictChange(value: string) {
    setDistrict(value)
    setPin(null)
    setError('')
  }

  // ── Pin ───────────────────────────────────────────────────────────────────

  function handleMapPlace(lat: number, lng: number) {
    setFirstPin(pin === null) // primera vez → vuela al punto
    setPin({ lat, lng })
    setError('')
  }

  function handlePinDrag(lat: number, lng: number) {
    setPin({ lat, lng })
  }

  // ── Continuar ─────────────────────────────────────────────────────────────

  function handleContinue() {
    if (!deptCode)         { setError('Seleccioná un departamento'); return }
    if (!district)         { setError('Seleccioná un distrito'); return }
    if (!street.trim())    { setError('Ingresá tu dirección'); return }
    if (!pin)              { setError('Marcá tu ubicación en el mapa'); return }

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

  // ─── Render ────────────────────────────────────────────────────────────────

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

      {/* Dirección exacta — input libre, sin API */}
      {district && (
        <Field label="Dirección" hint="calle, número, referencia">
          <input
            value={street}
            onChange={(e) => { setStreet(e.target.value); setError('') }}
            placeholder={`Jr. Río Santa Fé 320, ${district}`}
            autoComplete="street-address"
            className="w-full h-10 px-3 border border-border bg-surface text-text-primary text-sm focus:outline-none focus:border-accent"
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
                firstPin={firstPin}
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

      {/* Confirmación */}
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

// ─── UI helpers ────────────────────────────────────────────────────────────────

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

function SelectBox({ value, onChange, placeholder, children }: {
  value: string; onChange: (v: string) => void
  placeholder: string; children: React.ReactNode
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
