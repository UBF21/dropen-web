import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="font-display font-bold tracking-[0.3em] text-text-primary">DROPEN</p>
          <p className="text-text-muted text-xs mt-1">Jeans baggy de edición limitada · Lima, Perú</p>
        </div>
        <nav className="flex gap-6 text-xs text-text-muted tracking-widest uppercase">
          <Link to="/colecciones" className="hover:text-text-primary transition-colors">Colecciones</Link>
          <Link to="/wholesale" className="hover:text-text-primary transition-colors">Wholesale</Link>
          <Link to="/admin" className="hover:text-text-primary transition-colors">Admin</Link>
        </nav>
        <p className="text-text-muted text-xs">© 2026 DROPEN. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}
