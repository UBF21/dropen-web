import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ColumnDef } from '@tanstack/react-table'
import { supabase } from '@/lib/supabase'
import { RESERVATION_FIELDS } from '@/lib/query-fields'
import type { Reservation, ReservationStatus } from '@/types'
import { DataTable } from '@/components/ui/data-table'
import type { FilterField } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const statusColors: Record<ReservationStatus, string> = {
  pending:   'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
  confirmed: 'text-green-400 border-green-500/40 bg-green-500/10',
  expired:   'text-red-400 border-red-500/40 bg-red-500/10',
}

const statusLabels: Record<ReservationStatus, string> = {
  pending:   'Pendiente',
  confirmed: 'Confirmada',
  expired:   'Expirada',
}

const columns: ColumnDef<Reservation>[] = [
  {
    accessorKey: 'customer_wa',
    header: 'Cliente (WA)',
    cell: ({ row }) => (
      <span className="text-text-primary text-sm">
        {row.original.customer_wa ?? '—'}
      </span>
    ),
    filterFn: (row, _id, value: string) =>
      !value || (row.original.customer_wa ?? '').toLowerCase().includes(value.toLowerCase()),
  },
  {
    accessorKey: 'variant_id',
    header: 'Variante',
    cell: ({ row }) => (
      <span className="text-text-muted font-mono text-xs truncate max-w-[160px] block">
        {row.original.variant_id}
      </span>
    ),
  },
  {
    accessorKey: 'quantity',
    header: 'Cantidad',
    cell: ({ row }) => (
      <span className="text-text-muted text-sm">{row.original.quantity} un.</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => {
      const s = row.original.status
      return (
        <Badge className={cn('border', statusColors[s] ?? 'text-text-muted')}>
          {statusLabels[s] ?? s}
        </Badge>
      )
    },
    filterFn: (row, _id, value) => !value || row.original.status === value,
  },
  {
    accessorKey: 'expires_at',
    header: 'Expira',
    cell: ({ row }) => (
      <span className="text-text-muted text-xs">
        {format(new Date(row.original.expires_at), 'dd MMM yyyy HH:mm', { locale: es })}
      </span>
    ),
  },
  {
    accessorKey: 'created_at',
    header: 'Creada',
    cell: ({ row }) => (
      <span className="text-text-muted text-xs">
        {format(new Date(row.original.created_at), 'dd MMM yyyy HH:mm', { locale: es })}
      </span>
    ),
  },
]

const filterFields: FilterField[] = [
  {
    id: 'status',
    label: 'Estado',
    type: 'select',
    options: [
      { label: 'Pendiente',  value: 'pending' },
      { label: 'Confirmada', value: 'confirmed' },
      { label: 'Expirada',   value: 'expired' },
    ],
  },
]

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('reservations')
      .select(RESERVATION_FIELDS)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setReservations(data ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="p-8">
      <h1 className="font-display font-bold text-2xl text-text-primary mb-8 tracking-wide">Reservas</h1>
      {loading ? (
        <p className="text-text-muted text-sm">Cargando...</p>
      ) : (
        <DataTable
          columns={columns}
          data={reservations}
          searchColumn="customer_wa"
          searchPlaceholder="Buscar por cliente..."
          filterFields={filterFields}
        />
      )}
    </div>
  )
}
