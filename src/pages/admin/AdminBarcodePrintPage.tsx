import { useEffect, useState } from 'react'
import { Printer, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import BarcodeDisplay from '@/components/admin/inventory/BarcodeDisplay'
import { useVariants } from '@/hooks/useVariants'

const BARCODES_PER_ROW = 3

export default function AdminBarcodePrintPage() {
  const { variants, loading, error, loadVariants } = useVariants()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')

  useEffect(() => { loadVariants() }, [loadVariants])

  const filtered = variants.filter(v =>
    v.sku.toLowerCase().includes(search.toLowerCase()) ||
    v.product.name.toLowerCase().includes(search.toLowerCase())
  )

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map(v => v.id)))
    }
  }

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toPrint = variants.filter(v => selected.has(v.id))

  return (
    <main className="px-4 py-6 sm:px-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-text-primary">Etiquetas de código</h1>
        <Button
          onClick={() => window.print()}
          disabled={toPrint.length === 0}
          className="gap-2"
        >
          <Printer className="w-4 h-4" />
          Imprimir ({toPrint.length})
        </Button>
      </div>

      {/* Controles — ocultos al imprimir */}
      <div className="print:hidden space-y-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar SKU o producto..."
            className="pl-9 bg-background"
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="select-all"
            checked={filtered.length > 0 && selected.size === filtered.length}
            onCheckedChange={toggleAll}
          />
          <label htmlFor="select-all" className="text-sm text-text-muted cursor-pointer">
            Seleccionar todos ({filtered.length})
          </label>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-text-muted text-center py-12">Cargando variantes...</p>
      )}
      {error && (
        <p className="text-sm text-error text-center py-12">{error}</p>
      )}

      {/* Grid de variantes (pantalla) */}
      <div className="print:hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(v => (
          <label
            key={v.id}
            className={[
              'bg-surface border-2 rounded-lg p-3 cursor-pointer transition-all',
              selected.has(v.id) ? 'border-accent' : 'border-border hover:border-border/60',
            ].join(' ')}
          >
            <div className="flex items-start gap-2 mb-2">
              <Checkbox
                checked={selected.has(v.id)}
                onCheckedChange={() => toggle(v.id)}
                className="mt-0.5"
              />
              <div className="min-w-0">
                <p className="text-xs text-text-primary font-medium truncate">{v.product.name}</p>
                <p className="text-xs text-text-muted">{v.size} / {v.color}</p>
              </div>
            </div>
            <div className="bg-white rounded p-2">
              <BarcodeDisplay value={v.sku} height={40} />
            </div>
          </label>
        ))}
      </div>

      {/* Grid de impresión — visible solo al imprimir */}
      <div className="hidden print:block">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${BARCODES_PER_ROW}, 1fr)`,
            gap: '8px',
          }}
        >
          {toPrint.map(v => (
            <div
              key={v.id}
              style={{
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px',
                backgroundColor: '#fff',
                pageBreakInside: 'avoid',
              }}
            >
              <p style={{ fontSize: '10px', fontWeight: 600, marginBottom: '2px' }}>
                {v.product.name}
              </p>
              <p style={{ fontSize: '9px', color: '#666', marginBottom: '4px' }}>
                {v.size} / {v.color}
              </p>
              <BarcodeDisplay value={v.sku} height={36} />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
