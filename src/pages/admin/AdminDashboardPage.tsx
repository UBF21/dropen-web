import { useEffect, useRef, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { subDays } from 'date-fns'
import { TrendingUp, Package, BarChart3, ShoppingBag, AlertCircle } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  motion, AnimatePresence,
  useMotionValue, useReducedMotion,
  animate,
} from 'framer-motion'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useSiteCurrency } from '@/hooks/useSiteCurrency'

// ─── KpiCard ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  rawValue: number | null
  formatter: (v: number) => string
  icon: React.ElementType
  trend?: string
  delay?: number
}

function KpiCard({ label, rawValue, formatter, icon: Icon, trend, delay = 0 }: KpiCardProps) {
  const prefersReduced = useReducedMotion()
  const motionValue = useMotionValue(0)
  const hasAnimated = useRef(false)
  const [display, setDisplay] = useState('—')

  useEffect(() => {
    return motionValue.on('change', (v) => setDisplay(formatter(Math.round(v))))
  }, [motionValue, formatter])

  useEffect(() => {
    if (rawValue === null) { setDisplay('—'); return }
    if (hasAnimated.current || prefersReduced) {
      setDisplay(formatter(rawValue))
      return
    }
    hasAnimated.current = true
    animate(motionValue, rawValue, { duration: 1.2, ease: 'easeOut' })
  }, [rawValue, prefersReduced, motionValue, formatter])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-surface border border-border rounded-lg p-5 space-y-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">{label}</p>
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: delay + 0.1 }}
          className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"
        >
          <Icon className="w-4 h-4 text-accent" aria-hidden="true" />
        </motion.div>
      </div>
      <p className="text-2xl font-display font-bold text-text-primary tabular-nums">{display}</p>
      {trend && <p className="text-xs text-text-muted">{trend}</p>}
    </motion.div>
  )
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatShortDate(date: unknown): string {
  const [, m, d] = String(date).split('-')
  return `${d}/${m}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const DEFAULT_DAYS = 30

export default function AdminDashboardPage() {
  const [range, setRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), DEFAULT_DAYS),
    to: new Date(),
  })
  const { stats, loading, error, loadStats } = useDashboardStats()
  const currency = useSiteCurrency()

  useEffect(() => { loadStats(range) }, [loadStats, range])

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
          rawValue={stats?.totalRevenue ?? null}
          formatter={(v) => currency.format(v)}
          icon={TrendingUp}
          trend="Ventas en el período"
          delay={0}
        />
        <KpiCard
          label="Unidades vendidas"
          rawValue={stats?.totalUnitsSold ?? null}
          formatter={(v) => String(v)}
          icon={ShoppingBag}
          trend="Salidas registradas"
          delay={0.1}
        />
        <KpiCard
          label="Stock total"
          rawValue={stats?.totalStock ?? null}
          formatter={(v) => String(v)}
          icon={Package}
          trend="Unidades disponibles"
          delay={0.2}
        />
        <KpiCard
          label="Productos activos"
          rawValue={stats?.activeProducts ?? null}
          formatter={(v) => String(v)}
          icon={BarChart3}
          trend="En catálogo"
          delay={0.3}
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-surface border border-border rounded-lg p-5">
        <p className="text-sm font-medium text-text-primary mb-4">Revenue por día</p>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading-revenue"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-48 flex items-center justify-center"
            >
              <p className="text-sm text-text-muted animate-pulse">Cargando...</p>
            </motion.div>
          ) : (
            <motion.div
              key="chart-revenue"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stats?.revenueByDay ?? []} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" tickFormatter={formatShortDate}
                    tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={(v: unknown) => `${currency.symbol}${((v as number) / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} width={48} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#888888', fontSize: 11 }}
                    formatter={(v: unknown) => [currency.format(v as number), 'Revenue'] as [string, string]}
                    labelFormatter={formatShortDate}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#C9A96E"
                    strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Movements Chart */}
      <div className="bg-surface border border-border rounded-lg p-5">
        <p className="text-sm font-medium text-text-primary mb-4">Movimientos por día</p>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading-movements"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-48 flex items-center justify-center"
            >
              <p className="text-sm text-text-muted animate-pulse">Cargando...</p>
            </motion.div>
          ) : (
            <motion.div
              key="chart-movements"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats?.movementsByDay ?? []} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" tickFormatter={formatShortDate}
                    tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#888888', fontSize: 11 }}
                    labelFormatter={formatShortDate}
                  />
                  <Bar dataKey="in" name="Entradas" fill="#22c55e" opacity={0.8} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="out" name="Salidas" fill="#ef4444" opacity={0.8} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
