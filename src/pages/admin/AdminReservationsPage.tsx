import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { RESERVATION_FIELDS } from '@/lib/query-fields'
import type { Reservation } from '@/types'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('reservations')
      .select(RESERVATION_FIELDS)
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setReservations(data ?? [])
        setLoading(false)
      })
  }, [])

  const statusColors: Record<string, string> = {
    pending:   'text-yellow-400',
    confirmed: 'text-green-400',
    expired:   'text-text-muted',
  }

  return (
    <div className="p-8">
      <h1 className="font-display font-bold text-2xl text-text-primary mb-8 tracking-wide">Reservas</h1>
      {loading ? (
        <p className="text-text-muted text-sm">Cargando...</p>
      ) : (
        <div className="border border-border divide-y divide-border">
          {reservations.length === 0 && (
            <p className="text-center text-text-muted py-12 text-sm">Sin reservas.</p>
          )}
          {reservations.map((r) => (
            <div key={r.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-4 py-3 text-sm items-center">
              <span className="text-text-primary font-mono text-xs truncate">{r.id}</span>
              <span className="text-text-muted">{r.quantity} un.</span>
              <span className={statusColors[r.status] ?? 'text-text-muted'}>{r.status}</span>
              <span className="text-text-muted text-xs">{formatDate(r.expires_at)}</span>
              <span className="text-text-muted text-xs">{r.customer_wa ?? '—'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
