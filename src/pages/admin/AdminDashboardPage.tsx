import { useEffect, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { subDays } from 'date-fns'
import { TrendingUp, Package, BarChart3, ShoppingBag, AlertCircle } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { useDashboardStats } from '@/hooks/useDashboardStats'

// ─── KpiCard ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: string
  icon: React.ElementType
  trend?: string
}

function KpiCard({ label, value, icon: Icon, trend }: KpiCardProps) {
  return (
    <div className="bg-surface border border-border rounded-lg p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">{label}</p>
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-accent" aria-hidden="true" />
        </div>
      </div>
      <p className="text-2xl font-display font-bold text-text-primary tabular-nums">{value}</p>
      {trend && <p className="text-xs text-text-muted">{trend}</p>}
    </div>
  )
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatShortDate(date: unknown): string {
  const [, m, d] = String(date).split('-')
  return `${d}/${m}`
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_DAYS = 30

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [range, setRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), DEFAULT_DAYS),
    to: new Date(),
  })
  const { stats, loading, error, loadStats } = useDashboardStats()

  useEffect(() => {
    loadStats(range)
  }, [loadStats, range])

  return (
    <main className="px-4 py-6 sm:px-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-display font-bold text-text-primary">Dashboard</h1>
        <DateRangePicker value={range} onChange={setRange} />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-error text-sm" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Revenue"
          value={stats ? formatCurrency(stats.totalRevenue) : '—'}
          icon={TrendingUp}
          trend="Ventas en el período"
        />
        <KpiCard
          label="Unidades vendidas"
          value={stats ? String(stats.totalUnitsSold) : '—'}
          icon={ShoppingBag}
          trend="Salidas registradas"
        />
        <KpiCard
          label="Stock total"
          value={stats ? String(stats.totalStock) : '—'}
          icon={Package}
          trend="Unidades disponibles"
        />
        <KpiCard
          label="Productos activos"
          value={stats ? String(stats.activeProducts) : '—'}
          icon={BarChart3}
          trend="En catálogo"
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-surface border border-border rounded-lg p-5">
        <p className="text-sm font-medium text-text-primary mb-4">Revenue por día</p>
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <p className="text-sm text-text-muted animate-pulse">Cargando...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={stats?.revenueByDay ?? []}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: unknown) => `$${((v as number) / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'var(--color-text-muted)', fontSize: 11 }}
                formatter={(v: unknown) => [formatCurrency(v as number), 'Revenue'] as [string, string]}
                labelFormatter={formatShortDate}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-accent)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Movements Chart */}
      <div className="bg-surface border border-border rounded-lg p-5">
        <p className="text-sm font-medium text-text-primary mb-4">Movimientos por día</p>
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <p className="text-sm text-text-muted animate-pulse">Cargando...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={stats?.movementsByDay ?? []}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'var(--color-text-muted)', fontSize: 11 }}
                labelFormatter={formatShortDate}
              />
              <Bar dataKey="in" name="Entradas" fill="#22c55e" opacity={0.8} radius={[2, 2, 0, 0]} />
              <Bar dataKey="out" name="Salidas" fill="#ef4444" opacity={0.8} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </main>
  )
}
