import { useState, useEffect, useCallback } from 'react'
import { PackagePlus, PackageMinus, RefreshCw, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import BarcodeScanner, { type ScanMode } from '@/components/admin/inventory/BarcodeScanner'
import BarcodeDisplay from '@/components/admin/inventory/BarcodeDisplay'
import { useInventory, type ScannedVariant, type MovementType } from '@/hooks/useInventory'

// ─── Constants ────────────────────────────────────────────────────────────────

const TOAST_NOT_FOUND_DURATION_MS = 3000
const TOAST_SUCCESS_DURATION_MS = 2500

const MOVEMENT_LABELS: Record<MovementType, { short: string; long: string }> = {
  in: { short: '▲ ENT', long: '▲ Entrada' },
  out: { short: '▼ SAL', long: '▼ Salida' },
}

// ─── useScanHandler — extrae lógica de scan de la página (SRP) ───────────────

interface UseScanHandlerOptions {
  movementType: MovementType
  findVariantBySku: ReturnType<typeof useInventory>['findVariantBySku']
  registerMovement: ReturnType<typeof useInventory>['registerMovement']
  onSuccess: () => void
}

interface UseScanHandlerResult {
  processing: boolean
  lastScanned: ScannedVariant | null
  handleScan: (sku: string) => Promise<void>
}

function useScanHandler({
  movementType,
  findVariantBySku,
  registerMovement,
  onSuccess,
}: UseScanHandlerOptions): UseScanHandlerResult {
  const [processing, setProcessing] = useState(false)
  const [lastScanned, setLastScanned] = useState<ScannedVariant | null>(null)

  const handleScan = useCallback(
    async (sku: string) => {
      if (processing) return
      setProcessing(true)
      try {
        const variant = await findVariantBySku(sku)
        if (!variant) {
          toast.error(`SKU no encontrado: ${sku}`, { duration: TOAST_NOT_FOUND_DURATION_MS })
          return
        }

        setLastScanned(variant)
        await registerMovement(variant.id, movementType)

        const { long: action } = MOVEMENT_LABELS[movementType]
        const label = `${variant.product?.name ?? '—'} · ${variant.size} / ${variant.color}`
        toast.success(`${action} — ${label}`, {
          description: 'Stock actualizado',
          duration: TOAST_SUCCESS_DURATION_MS,
        })

        onSuccess()
      } catch {
        toast.error('Error al registrar el movimiento. Intentá de nuevo.')
      } finally {
        setProcessing(false)
      }
    },
    [processing, movementType, findVariantBySku, registerMovement, onSuccess],
  )

  return { processing, lastScanned, handleScan }
}

// ─── MovementToggle ───────────────────────────────────────────────────────────

interface MovementToggleProps {
  value: MovementType
  onChange: (type: MovementType) => void
  disabled?: boolean
}

function MovementToggle({ value, onChange, disabled }: MovementToggleProps) {
  return (
    <fieldset disabled={disabled} className="contents">
      <legend className="text-sm font-medium text-text-primary mb-3">Tipo de movimiento</legend>
      <div className="grid grid-cols-2 gap-2" role="group" aria-label="Seleccionar tipo de movimiento">
        <button
          type="button"
          onClick={() => onChange('in')}
          aria-pressed={value === 'in'}
          className={[
            'flex items-center justify-center gap-2 min-h-[52px] rounded-lg border-2 font-semibold text-sm',
            'transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            'disabled:pointer-events-none disabled:opacity-50',
            value === 'in'
              ? 'border-green-500 bg-green-500/10 text-green-400'
              : 'border-border text-text-muted hover:text-text-primary hover:border-text-muted/40',
          ].join(' ')}
        >
          <PackagePlus className="w-5 h-5 shrink-0" aria-hidden="true" />
          ENTRADA
        </button>

        <button
          type="button"
          onClick={() => onChange('out')}
          aria-pressed={value === 'out'}
          className={[
            'flex items-center justify-center gap-2 min-h-[52px] rounded-lg border-2 font-semibold text-sm',
            'transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            'disabled:pointer-events-none disabled:opacity-50',
            value === 'out'
              ? 'border-red-500 bg-red-500/10 text-red-400'
              : 'border-border text-text-muted hover:text-text-primary hover:border-text-muted/40',
          ].join(' ')}
        >
          <PackageMinus className="w-5 h-5 shrink-0" aria-hidden="true" />
          SALIDA
        </button>
      </div>
    </fieldset>
  )
}

// ─── LastScannedCard ──────────────────────────────────────────────────────────

interface LastScannedCardProps {
  variant: ScannedVariant | null
}

function LastScannedCard({ variant }: LastScannedCardProps) {
  return (
    <section
      className="bg-surface border border-border rounded-lg p-4"
      aria-label="Último producto escaneado"
    >
      <p className="text-sm font-medium text-text-primary mb-3">Último escaneado</p>

      {variant ? (
        <div className="space-y-3">
          <div>
            <p className="text-text-primary font-medium leading-tight">
              {variant.product?.name ?? '—'}
            </p>
            <p className="text-sm text-text-muted mt-0.5">
              {variant.size} / {variant.color}
            </p>
            <p className="text-xs font-mono text-text-muted mt-1">{variant.sku}</p>
          </div>

          {/* Fondo blanco requerido por el barcode: lo provee el padre, no BarcodeDisplay */}
          <div className="bg-white rounded-md p-2">
            <BarcodeDisplay value={variant.sku} height={48} />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Stock actual</span>
            <span
              className="font-mono font-bold text-text-primary tabular-nums"
              aria-label={`Stock: ${variant.stock} unidades`}
            >
              {variant.stock}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-10">
          <p className="text-sm text-text-muted">Esperando primer scan...</p>
        </div>
      )}
    </section>
  )
}

// ─── MovementRow ──────────────────────────────────────────────────────────────

interface MovementRowProps {
  movement: ReturnType<typeof useInventory>['movements'][number]
}

function MovementRow({ movement: m }: MovementRowProps) {
  const v = m.variant
  const { short } = MOVEMENT_LABELS[m.type]

  return (
    <div className="px-4 py-3 flex items-center gap-3">
      <Badge
        variant="outline"
        className={
          m.type === 'in'
            ? 'border-green-500/40 text-green-400 bg-green-500/10 shrink-0 tabular-nums'
            : 'border-red-500/40 text-red-400 bg-red-500/10 shrink-0 tabular-nums'
        }
        aria-label={m.type === 'in' ? 'Entrada' : 'Salida'}
      >
        {short}
      </Badge>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary truncate">
          {v?.product?.name ?? '—'}
          <span className="text-text-muted ml-1">
            · {v?.size} / {v?.color}
          </span>
        </p>
        <p className="text-xs font-mono text-text-muted">{v?.sku}</p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-xs text-text-muted">
          {format(new Date(m.created_at), 'dd MMM · HH:mm', { locale: es })}
        </p>
        <p className="text-xs text-text-muted">
          Stock:{' '}
          <span className="font-mono tabular-nums">{v?.stock ?? '?'}</span>
        </p>
      </div>
    </div>
  )
}

// ─── MovementsHistory ─────────────────────────────────────────────────────────

interface MovementsHistoryProps {
  movements: ReturnType<typeof useInventory>['movements']
  loading: boolean
  error: string | null
  onRefresh: () => void
}

function MovementsHistory({ movements, loading, error, onRefresh }: MovementsHistoryProps) {
  return (
    <section
      className="bg-surface border border-border rounded-lg"
      aria-label="Historial de movimientos"
    >
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <p className="text-sm font-medium text-text-primary">Movimientos recientes</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Actualizar historial"
        >
          <RefreshCw
            className={['w-3.5 h-3.5', loading ? 'animate-spin' : ''].join(' ')}
            aria-hidden="true"
          />
        </Button>
      </div>

      {/* Lista con scroll limitado en mobile */}
      <div
        className="divide-y divide-border max-h-[60vh] overflow-y-auto overscroll-contain"
        role="list"
      >
        {loading && movements.length === 0 && (
          <p className="px-4 py-8 text-sm text-text-muted text-center" aria-live="polite">
            Cargando...
          </p>
        )}

        {!loading && error && (
          <div className="flex items-center gap-2 px-4 py-6 text-error text-sm" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && movements.length === 0 && (
          <p className="px-4 py-8 text-sm text-text-muted text-center">
            Sin movimientos registrados
          </p>
        )}

        {movements.map(m => (
          <div key={m.id} role="listitem">
            <MovementRow movement={m} />
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * Detecta si el dispositivo es mobile/tablet para elegir el modo de scan por defecto.
 * En mobile la cámara es la opción natural; en desktop suele haber lector físico.
 */
function getDefaultScanMode(): ScanMode {
  if (typeof window === 'undefined') return 'laser'
  return /Mobi|Android|iPad|iPhone/i.test(navigator.userAgent) ? 'camera' : 'laser'
}

export default function AdminInventoryPage() {
  const [movementType, setMovementType] = useState<MovementType>('in')
  const defaultMode = getDefaultScanMode()

  const { movements, loading, movementsError, findVariantBySku, registerMovement, loadRecentMovements } =
    useInventory()

  const { processing, lastScanned, handleScan } = useScanHandler({
    movementType,
    findVariantBySku,
    registerMovement,
    onSuccess: loadRecentMovements,
  })

  useEffect(() => {
    loadRecentMovements()
  }, [loadRecentMovements])

  return (
    <main className="px-4 py-6 sm:px-6 max-w-4xl mx-auto space-y-5">
      <h1 className="text-2xl font-display font-bold text-text-primary">Inventario</h1>

      {/*
        Layout:
        - Mobile: columna única — toggle → scanner → último escaneado → historial
        - Desktop (md+): dos columnas — [toggle + scanner] | [último escaneado]
                         con historial debajo a ancho completo
      */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Panel de control de escaneo */}
        <section
          className="bg-surface border border-border rounded-lg p-4 space-y-4"
          aria-label="Panel de escaneo"
        >
          <MovementToggle
            value={movementType}
            onChange={setMovementType}
            disabled={processing}
          />

          <BarcodeScanner
            onScan={handleScan}
            disabled={processing}
            defaultMode={defaultMode}
          />

          {processing && (
            <p
              className="text-xs text-text-muted animate-pulse text-center"
              role="status"
              aria-live="polite"
            >
              Registrando movimiento...
            </p>
          )}
        </section>

        {/* Último escaneado — en mobile aparece debajo del scanner, en desktop al lado */}
        <LastScannedCard variant={lastScanned} />
      </div>

      <MovementsHistory
        movements={movements}
        loading={loading}
        error={movementsError}
        onRefresh={loadRecentMovements}
      />
    </main>
  )
}
