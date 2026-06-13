import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { RESERVATION_FIELDS } from '@/lib/query-fields'

interface Stats {
  activeReservations: number
  totalProducts: number
  totalCollections: number
  pendingWholesale: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    activeReservations: 0,
    totalProducts: 0,
    totalCollections: 0,
    pendingWholesale: 0,
  })

  useEffect(() => {
    Promise.all([
      supabase.from('reservations').select(RESERVATION_FIELDS, { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('collections').select('id', { count: 'exact', head: true }),
      supabase.from('wholesale_orders').select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
    ]).then(([res, prod, col, ws]) => {
      setStats({
        activeReservations: res.count ?? 0,
        totalProducts: prod.count ?? 0,
        totalCollections: col.count ?? 0,
        pendingWholesale: ws.count ?? 0,
      })
    })
  }, [])

  const cards = [
    { label: 'Reservas activas',    value: stats.activeReservations },
    { label: 'Productos',           value: stats.totalProducts },
    { label: 'Drops',               value: stats.totalCollections },
    { label: 'Wholesale pendiente', value: stats.pendingWholesale },
  ]

  return (
    <div className="p-8">
      <h1 className="font-display font-bold text-2xl text-text-primary mb-8 tracking-wide">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value }) => (
          <div key={label} className="bg-surface border border-border p-6">
            <p className="text-xs text-text-muted uppercase tracking-widest">{label}</p>
            <p className="text-3xl font-bold text-accent mt-2">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
