import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Tag, Settings, LogOut, ScanBarcode, Barcode } from 'lucide-react'
import { useAdmin } from '@/hooks/useAdmin'

const NAV_ITEMS = [
  { to: '/admin',              icon: LayoutDashboard, label: 'Dashboard',  end: true },
  { to: '/admin/productos',    icon: Package,          label: 'Productos',  end: false },
  { to: '/admin/drops',        icon: Tag,              label: 'Drops',      end: false },
  { to: '/admin/inventario',   icon: ScanBarcode,      label: 'Inventario', end: false },
  { to: '/admin/inventario/etiquetas', icon: Barcode, label: 'Etiquetas', end: false },
  { to: '/admin/ajustes',      icon: Settings,         label: 'Ajustes',    end: false },
]

export default function AdminLayout() {
  const { profile, signOut } = useAdmin()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-60 bg-surface border-r border-border flex flex-col">
        <div className="px-6 py-5 border-b border-border">
          <p className="font-display font-bold text-lg tracking-widest text-text-primary">DROPEN</p>
          <p className="text-xs text-text-muted mt-1">{profile?.role ?? 'admin'}</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-accent text-background'
                    : 'text-text-muted hover:text-text-primary hover:bg-border'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-border">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 text-sm text-text-muted hover:text-error w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
