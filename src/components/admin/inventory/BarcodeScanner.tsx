import { useEffect, useRef, useState, useCallback } from 'react'
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library'
import { Camera, Keyboard, ScanLine } from 'lucide-react'
import { Input } from '@/components/ui/input'

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Tiempo mínimo entre dos scans del lector láser (ms).
 * Los lectores físicos pueden disparar el Enter varias veces seguidas.
 */
const LASER_DEBOUNCE_MS = 300

/**
 * Tiempo mínimo entre dos detecciones de la cámara (ms).
 * ZXing puede detectar el mismo frame varias veces por segundo.
 */
const CAMERA_DEBOUNCE_MS = 1000

/** Patrón para identificar cámara trasera en mobile por etiqueta del dispositivo */
const BACK_CAMERA_PATTERN = /back|rear|trasera|environment/i

// ─── Types ────────────────────────────────────────────────────────────────────

export type ScanMode = 'laser' | 'camera'

interface BarcodeScannerProps {
  onScan: (sku: string) => void
  disabled?: boolean
  /** Modo inicial. En mobile conviene 'camera'; en desktop con lector físico, 'laser'. */
  defaultMode?: ScanMode
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface LaserInputProps {
  value: string
  onChange: (v: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  disabled?: boolean
  inputRef: React.RefObject<HTMLInputElement | null>
}

function LaserInput({ value, onChange, onKeyDown, disabled, inputRef }: LaserInputProps) {
  return (
    <div className="relative">
      <ScanLine
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
        aria-hidden="true"
      />
      <Input
        ref={inputRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Apuntá el lector al código y presioná Enter..."
        disabled={disabled}
        className="pl-9 font-mono h-12 bg-background"
        autoComplete="off"
        autoFocus
        aria-label="Campo de entrada para lector láser"
      />
    </div>
  )
}

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  scanning: boolean
  error: string | null
}

function CameraView({ videoRef, scanning, error }: CameraViewProps) {
  return (
    <div
      className="relative rounded-lg overflow-hidden bg-black aspect-[4/3] sm:aspect-video"
      aria-label="Vista previa de cámara para escaneo"
      role="region"
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
        aria-hidden="true"
      />

      {/* Visor de escaneo — visible cuando la cámara está activa */}
      {scanning && !error && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          aria-hidden="true"
        >
          {/* Overlay oscuro en los bordes para enfocar la atención al centro */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Marco guía */}
          <div className="relative w-64 h-32 sm:w-72 sm:h-36">
            {/* Línea de escaneo animada */}
            <div className="absolute inset-x-2 top-1/2 h-0.5 bg-accent/70 animate-pulse" />

            {/* Esquinas del marco */}
            <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-accent rounded-tl" />
            <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-accent rounded-tr" />
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-accent rounded-bl" />
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-accent rounded-br" />
          </div>

          {/* Instrucción visible */}
          <p className="absolute bottom-4 inset-x-0 text-center text-xs text-white/80">
            Apuntá el código al marco dorado
          </p>
        </div>
      )}

      {/* Estado de error de cámara */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/85 p-6">
          <Camera className="w-8 h-8 text-text-muted" aria-hidden="true" />
          <p className="text-error text-sm text-center leading-relaxed">{error}</p>
        </div>
      )}

      {/* Estado: esperando iniciar cámara */}
      {!scanning && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <p className="text-text-muted text-sm">Iniciando cámara...</p>
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * Escáner de códigos de barras con dos modos:
 * - `laser`: input de texto para lectores físicos USB/Bluetooth
 * - `camera`: acceso a cámara del dispositivo vía ZXing
 *
 * SRP: gestiona el ciclo de vida del escáner y delega el render a sub-componentes.
 * El caller es responsable de procesar el SKU recibido en `onScan`.
 */
export default function BarcodeScanner({
  onScan,
  disabled,
  defaultMode = 'camera',
}: BarcodeScannerProps) {
  const [mode, setMode] = useState<ScanMode>(defaultMode)
  const [laserValue, setLaserValue] = useState('')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const lastScanRef = useRef<number>(0)

  // Laser: mantener foco en el input para capturar el stream del lector
  useEffect(() => {
    if (mode === 'laser' && !disabled) {
      inputRef.current?.focus()
    }
  }, [mode, disabled])

  function handleLaserKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    const sku = laserValue.trim()
    if (!sku || disabled) return

    const now = Date.now()
    if (now - lastScanRef.current < LASER_DEBOUNCE_MS) return
    lastScanRef.current = now

    setLaserValue('')
    onScan(sku)
  }

  const stopCamera = useCallback(() => {
    readerRef.current?.reset()
    readerRef.current = null
    setScanning(false)
  }, [])

  const startCamera = useCallback(async () => {
    setCameraError(null)
    setScanning(false)

    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = allDevices.filter(d => d.kind === 'videoinput')

      if (!videoDevices.length) {
        setCameraError('No se encontró cámara disponible en este dispositivo.')
        return
      }

      // Preferir cámara trasera (environment): mejor para escanear en mobile
      const backCamera =
        videoDevices.find(d => BACK_CAMERA_PATTERN.test(d.label)) ??
        videoDevices[videoDevices.length - 1]

      const reader = new BrowserMultiFormatReader()
      readerRef.current = reader
      setScanning(true)

      await reader.decodeFromVideoDevice(
        backCamera.deviceId || null,
        videoRef.current!,
        (result, err) => {
          if (result) {
            const now = Date.now()
            if (now - lastScanRef.current < CAMERA_DEBOUNCE_MS) return
            lastScanRef.current = now

            // Vibración táctil: feedback físico en mobile al detectar un código
            if ('vibrate' in navigator) {
              navigator.vibrate(60)
            }

            onScan(result.getText())
          }
          if (err && !(err instanceof NotFoundException)) {
            console.warn('[BarcodeScanner]', err)
          }
        },
      )
    } catch {
      setCameraError('No se pudo acceder a la cámara. Verificá los permisos del navegador.')
      setScanning(false)
    }
  }, [onScan])

  // Ciclo de vida de la cámara ligado al modo activo
  useEffect(() => {
    if (mode === 'camera') {
      startCamera()
    } else {
      stopCamera()
    }
    return stopCamera
    // startCamera y stopCamera son estables (useCallback sin deps que cambien).
    // Incluir `mode` como única dep para re-iniciar cuando cambia.
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  function switchMode(next: ScanMode) {
    if (next === mode) return
    setLaserValue('')
    setCameraError(null)
    setMode(next)
  }

  return (
    <div className="space-y-3" role="group" aria-label="Escáner de código de barras">
      {/* Selector de modo — botones grandes para touch */}
      <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Modo de escaneo">
        <button
          role="tab"
          aria-selected={mode === 'laser'}
          onClick={() => switchMode('laser')}
          className={[
            'flex items-center justify-center gap-2 rounded-lg border-2 font-medium text-sm',
            'min-h-[48px] px-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            mode === 'laser'
              ? 'border-accent bg-accent/10 text-accent'
              : 'border-border text-text-muted hover:text-text-primary hover:border-border/80',
          ].join(' ')}
        >
          <Keyboard className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Lector láser</span>
        </button>

        <button
          role="tab"
          aria-selected={mode === 'camera'}
          onClick={() => switchMode('camera')}
          className={[
            'flex items-center justify-center gap-2 rounded-lg border-2 font-medium text-sm',
            'min-h-[48px] px-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            mode === 'camera'
              ? 'border-accent bg-accent/10 text-accent'
              : 'border-border text-text-muted hover:text-text-primary hover:border-border/80',
          ].join(' ')}
        >
          <Camera className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Cámara</span>
        </button>
      </div>

      {mode === 'laser' && (
        <LaserInput
          value={laserValue}
          onChange={setLaserValue}
          onKeyDown={handleLaserKeyDown}
          disabled={disabled}
          inputRef={inputRef}
        />
      )}

      {mode === 'camera' && (
        <CameraView
          videoRef={videoRef}
          scanning={scanning}
          error={cameraError}
        />
      )}
    </div>
  )
}
