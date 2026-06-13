import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface Props {
  expiresAt: string
  onExpire?: () => void
}

function msToHHMMSS(ms: number): string {
  if (ms <= 0) return '00:00:00'
  const totalSecs = Math.floor(ms / 1000)
  const h = Math.floor(totalSecs / 3600)
  const m = Math.floor((totalSecs % 3600) / 60)
  const s = totalSecs % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

export default function ReservationTimer({ expiresAt, onExpire }: Props) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, new Date(expiresAt).getTime() - Date.now())
  )

  useEffect(() => {
    const ms0 = Math.max(0, new Date(expiresAt).getTime() - Date.now())
    if (ms0 === 0) { onExpire?.(); return }
    const id = setInterval(() => {
      const ms = Math.max(0, new Date(expiresAt).getTime() - Date.now())
      setRemaining(ms)
      if (ms === 0) { clearInterval(id); onExpire?.() }
    }, 1000)
    return () => clearInterval(id)
  }, [expiresAt, onExpire])

  return (
    <div className="flex items-center gap-2 bg-surface border border-border px-3 py-2 text-sm">
      <Clock className="w-4 h-4 text-accent" />
      <span className="text-text-muted">Reserva expira en:</span>
      <span className="font-mono font-medium text-accent">{msToHHMMSS(remaining)}</span>
    </div>
  )
}
