import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, Tag, Settings, LogOut, ScanBarcode, Barcode, Menu } from 'lucide-react'
import { useAdmin } from '@/hooks/useAdmin'
import { useAdminLowStockCount } from '@/hooks/useAdminLowStockCount'
import { Sheet, SheetContent } from '@/components/ui/sheet'

const NAV_ITEMS = [
  { to: '/admin',                       icon: LayoutDashboard, label: 'Dashboard',  end: true },
  { to: '/admin/productos',             icon: Package,          label: 'Productos',  end: false },
  { to: '/admin/drops',                 icon: Tag,              label: 'Drops',      end: false },
  { to: '/admin/inventario',            icon: ScanBarcode,      label: 'Inventario', end: false },
  { to: '/admin/inventario/etiquetas',  icon: Barcode,          label: 'Etiquetas',  end: false },
  { to: '/admin/ajustes',               icon: Settings,         label: 'Ajustes',    end: false },
]

function useMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isMobile
}

interface SidebarContentProps {
  role: string
  lowStockCount: number
  onNavigate?: () => void
  onSignOut: () => void
}

function SidebarContent({ role, lowStockCount, onNavigate, onSignOut }: SidebarContentProps) {
  return (
    <>
      <div className="px-6 py-5 border-b border-border">
        <p className="font-display font-bold text-lg tracking-widest text-text-primary">DROPEN</p>
        <p className="text-xs text-text-muted mt-1">{role}</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                isActive
                  ? 'bg-accent text-background'
                  : 'text-text-muted hover:text-text-primary hover:bg-border'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            <span className="flex-1">{label}</span>
            {to === '/admin/inventario' && lowStockCount > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                {lowStockCount > 9 ? '9+' : lowStockCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 px-3 py-2 text-sm text-text-muted hover:text-error w-full transition-colors rounded-md"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </>
  )
}

export default function AdminLayout() {
  const { profile, signOut } = useAdmin()
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useMobile()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { count: lowStockCount } = useAdminLowStockCount()

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  async function handleSignOut() {
    await signOut()
    navigate('/admin/login')
  }

  const role = profile?.role ?? 'admin'

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar — oculto en mobile */}
      {!isMobile && (
        <aside className="w-60 bg-surface border-r border-border flex flex-col shrink-0">
          <SidebarContent role={role} lowStockCount={lowStockCount} onSignOut={handleSignOut} />
        </aside>
      )}

      {/* Mobile top-bar */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-40 h-14 bg-surface border-b border-border flex items-center px-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-text-muted hover:text-text-primary transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
          <p className="flex-1 text-center font-display font-bold tracking-widest text-text-primary text-sm">
            DROPEN
          </p>
          <p className="text-xs text-text-muted">{role}</p>
        </div>
      )}

      {/* Mobile Sheet */}
      {isMobile && (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            className="p-0 w-60 bg-surface border-border flex flex-col [&>button]:hidden"
          >
            <SidebarContent
              role={role}
              lowStockCount={lowStockCount}
              onNavigate={() => setMobileOpen(false)}
              onSignOut={handleSignOut}
            />
          </SheetContent>
        </Sheet>
      )}

      <main className={`flex-1 overflow-y-auto ${isMobile ? 'pt-14' : ''}`}>
        <Outlet />
      </main>
    </div>
  )
}
