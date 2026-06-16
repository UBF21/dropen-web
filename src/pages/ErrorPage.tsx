import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'
import { Home, RefreshCw, AlertTriangle } from 'lucide-react'

// ─── Detección del tipo de error ──────────────────────────────────────────────

type Variant = '404' | '500' | 'chunk' | 'generic'

function detectVariant(error: unknown): Variant {
  if (isRouteErrorResponse(error)) {
    return error.status === 404 ? '404' : '500'
  }
  if (
    error instanceof Error &&
    (error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Importing a module script failed') ||
      error.name === 'ChunkLoadError')
  ) {
    return 'chunk'
  }
  return 'generic'
}

// ─── Config por variante ──────────────────────────────────────────────────────

const VARIANTS = {
  '404': {
    badge:    '404',
    title:    'Página no encontrada',
    body:     'La URL que ingresaste no existe o fue movida a otra dirección.',
    accent:   true,
    actions:  [{ label: 'Ir al inicio', to: '/', reload: false }],
  },
  '500': {
    badge:    '500',
    title:    'Error del servidor',
    body:     'Algo falló de nuestro lado. Intentá nuevamente en unos minutos.',
    accent:   false,
    actions:  [
      { label: 'Ir al inicio',   to: '/',   reload: false },
      { label: 'Recargar',       to: null,  reload: true  },
    ],
  },
  'chunk': {
    badge:    'Actualización',
    title:    'Módulo no disponible',
    body:     'La aplicación se actualizó mientras tenías la página abierta. Recargá para obtener la versión más reciente.',
    accent:   true,
    actions:  [
      { label: 'Recargar página', to: null, reload: true  },
      { label: 'Ir al inicio',    to: '/',  reload: false },
    ],
  },
  'generic': {
    badge:    'Error',
    title:    'Algo salió mal',
    body:     'Ocurrió un error inesperado. Si el problema persiste, contactanos por WhatsApp.',
    accent:   false,
    actions:  [
      { label: 'Ir al inicio', to: '/',  reload: false },
      { label: 'Recargar',     to: null, reload: true  },
    ],
  },
} satisfies Record<Variant, {
  badge: string; title: string; body: string; accent: boolean
  actions: { label: string; to: string | null; reload: boolean }[]
}>

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ErrorPage() {
  const error   = useRouteError()
  const variant = detectVariant(error)
  const cfg     = VARIANTS[variant]

  return (
    <div className="relative min-h-screen bg-background flex flex-col overflow-hidden">

      {/* ── Número decorativo de fondo ─────────────────────────────────────── */}
      <span
        aria-hidden
        className="pointer-events-none select-none absolute right-[-0.1em] top-[50%] translate-y-[-55%] font-display font-bold leading-none text-text-primary opacity-[0.03]"
        style={{ fontSize: 'clamp(220px, 30vw, 400px)' }}
      >
        {cfg.badge}
      </span>

      {/* ── Header mínimo ──────────────────────────────────────────────────── */}
      <header className="relative z-10 px-8 pt-8 pb-4 border-b border-border">
        <Link
          to="/"
          className="text-[10px] uppercase tracking-[6px] text-accent hover:text-accent-hover transition-colors"
        >
          DROPEN
        </Link>
      </header>

      {/* ── Contenido central ──────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex items-center px-8 sm:px-16">
        <div className="max-w-lg">

          {/* Badge / código */}
          <div className="flex items-center gap-3 mb-6">
            {!cfg.accent && (
              <AlertTriangle className="w-4 h-4 text-error flex-shrink-0" />
            )}
            <span
              className={`text-[10px] uppercase tracking-[4px] ${
                cfg.accent ? 'text-accent' : 'text-error'
              }`}
            >
              {cfg.badge}
            </span>
            <span className="flex-1 h-px bg-border" />
          </div>

          {/* Título */}
          <h1 className="font-display font-bold text-text-primary mb-3"
            style={{ fontSize: 'clamp(28px, 4vw, 42px)', lineHeight: 1.15 }}>
            {cfg.title}
          </h1>

          {/* Descripción */}
          <p className="text-text-muted text-sm leading-relaxed mb-8 max-w-sm">
            {cfg.body}
          </p>

          {/* Acciones */}
          <div className="flex flex-wrap gap-3">
            {cfg.actions.map((action, i) =>
              action.reload ? (
                <button
                  key={i}
                  onClick={() => window.location.reload()}
                  className={`flex items-center gap-2 px-5 py-2.5 text-[11px] uppercase tracking-[2.5px] font-medium transition-colors ${
                    i === 0
                      ? 'bg-accent text-background hover:bg-accent-hover'
                      : 'border border-border text-text-muted hover:border-accent hover:text-accent'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {action.label}
                </button>
              ) : (
                <Link
                  key={i}
                  to={action.to!}
                  className={`flex items-center gap-2 px-5 py-2.5 text-[11px] uppercase tracking-[2.5px] font-medium transition-colors ${
                    i === 0
                      ? 'bg-accent text-background hover:bg-accent-hover'
                      : 'border border-border text-text-muted hover:border-accent hover:text-accent'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  {action.label}
                </Link>
              )
            )}
          </div>
        </div>
      </main>

      {/* ── Footer mínimo ──────────────────────────────────────────────────── */}
      <footer className="relative z-10 px-8 py-5 border-t border-border">
        <p className="text-[10px] text-text-muted">
          © DROPEN — Si el problema persiste, escribinos.
        </p>
      </footer>
    </div>
  )
}
