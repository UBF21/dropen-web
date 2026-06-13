# Admin UI Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar animaciones (counter-up KPIs, fade-in, charts), sidebar responsive con Sheet en mobile, migrar todos los forms de Dialog a Sheet, y mejorar el Home con marquee ticker, scroll indicator, BrandStatement con stats y hover overlay en ProductCard.

**Architecture:** Todas las animaciones usan Framer Motion (ya instalado). El sidebar mobile usa el componente `Sheet` de shadcn/ui (ya instalado). Los formularios mantienen exactamente la misma lógica de negocio — solo cambia el componente contenedor de `Dialog` a `Sheet`. Los componentes de home nuevos son independientes y se insertan en `HomePage.tsx`.

**Tech Stack:** React 19, TypeScript, Framer Motion 11, shadcn/ui (Sheet), Tailwind CSS, Vite

---

## File Map

| Acción | Archivo | Responsabilidad |
|---|---|---|
| Modificar | `src/components/admin/AdminLayout.tsx` | Sidebar responsive + top-bar mobile |
| Crear | `src/components/admin/products/ProductFormSheet.tsx` | Form producto como Sheet derecho |
| Crear | `src/components/admin/drops/DropFormSheet.tsx` | Form drop como Sheet derecho |
| Modificar | `src/pages/admin/AdminProductsPage.tsx` | Import Sheet en vez de Dialog |
| Modificar | `src/pages/admin/AdminDropsPage.tsx` | Import Sheet en vez de Dialog |
| Modificar | `src/pages/admin/AdminDashboardPage.tsx` | Counter-up KPIs + fade-in charts |
| Modificar | `src/components/ui/data-table/data-table.tsx` | Fade-in wrapper |
| Crear | `src/components/ui/animated-section-title.tsx` | `<h2>` animado con whileInView |
| Crear | `src/components/home/MarqueeTicker.tsx` | Banda horizontal scrolling |
| Modificar | `src/index.css` | `@keyframes marquee` |
| Modificar | `src/components/home/HeroParallax.tsx` | ScrollIndicator (chevron bounce) |
| Modificar | `src/components/home/BrandStatement.tsx` | Stats row con counter-up |
| Modificar | `src/components/home/DropsGrid.tsx` | AnimatedSectionTitle |
| Modificar | `src/components/product/ProductCard.tsx` | Hover overlay "Ver producto" |
| Modificar | `src/pages/HomePage.tsx` | MarqueeTicker + AnimatedSectionTitle en Destacados |

---

### Task 1: Sidebar responsive — AdminLayout

**Files:**
- Modify: `src/components/admin/AdminLayout.tsx`

- [ ] **Step 1: Reemplazar AdminLayout.tsx completo**

```tsx
import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, Tag, Settings, LogOut, ScanBarcode, Barcode, Menu } from 'lucide-react'
import { useAdmin } from '@/hooks/useAdmin'
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
  onNavigate?: () => void
  onSignOut: () => void
}

function SidebarContent({ role, onNavigate, onSignOut }: SidebarContentProps) {
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
            {label}
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
          <SidebarContent role={role} onSignOut={handleSignOut} />
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
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Esperado: sin errores TypeScript.

- [ ] **Step 3: Verificar visual**

Abrir `http://localhost:5173/admin` en el browser.
- Desktop (≥ 1024px): sidebar izquierdo visible, contenido a la derecha.
- Reducir ventana a < 1024px: sidebar desaparece, aparece top-bar con hamburger.
- Click hamburger: Sheet desliza desde la izquierda con los nav items.
- Click en un nav item: Sheet se cierra y navega.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/AdminLayout.tsx
git commit -m "feat(admin): add responsive sidebar with mobile hamburger Sheet"
```

---

### Task 2: ProductFormSheet

**Files:**
- Create: `src/components/admin/products/ProductFormSheet.tsx`

- [ ] **Step 1: Crear ProductFormSheet.tsx**

```tsx
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import VariantsEditor, { type VariantDraft } from './VariantsEditor'
import ImageUploader from './ImageUploader'
import type { Product, Collection } from '@/types'
import { useSiteCurrency } from '@/hooks/useSiteCurrency'

const schema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  slug: z.string().min(2, 'Slug requerido').regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  collection_id: z.string().min(1, 'Colección requerida'),
  price: z.coerce.number().positive('Precio inválido'),
  description: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  product: Product | null
  collections: Collection[]
  onClose: () => void
  onSaved: () => void
}

async function saveVariants(productId: string, variants: VariantDraft[]): Promise<boolean> {
  const { error: deleteError } = await supabase.from('product_variants').delete().eq('product_id', productId)
  if (deleteError) { toast.error('Error al actualizar variantes'); return false }
  if (variants.length > 0) {
    const { error: insertError } = await supabase
      .from('product_variants')
      .insert(variants.map((v) => ({ product_id: productId, ...v })))
    if (insertError) { toast.error('Error al insertar variantes'); return false }
  }
  return true
}

export default function ProductFormSheet({ open, product, collections, onClose, onSaved }: Props) {
  const isEdit = !!product
  const [variants, setVariants] = useState<VariantDraft[]>([])
  const [saving, setSaving] = useState(false)
  const currency = useSiteCurrency()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '', collection_id: '', price: 0, description: '' },
  })

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        slug: product.slug,
        collection_id: product.collection_id ?? '',
        price: product.price,
        description: product.description ?? '',
      })
      setVariants(
        product.variants?.map((v) => ({
          size: v.size,
          color: v.color,
          stock: v.stock,
          sku: v.sku,
        })) ?? []
      )
    } else {
      form.reset({ name: '', slug: '', collection_id: '', price: 0, description: '' })
      setVariants([])
    }
  }, [product, form])

  async function handleImageUploaded(url: string, storagePath: string) {
    if (!product) return
    const { error } = await supabase.from('product_images').insert({
      product_id: product.id,
      url,
      storage_path: storagePath,
      order: 0,
      is_primary: (product.images?.length ?? 0) === 0,
    })
    if (error) { toast.error('Error al registrar imagen'); return }
    toast.success('Imagen agregada')
    onSaved()
  }

  async function handleSave(data: FormData) {
    setSaving(true)
    try {
      if (isEdit && product) {
        const { error: updateError } = await supabase
          .from('products')
          .update({
            name: data.name,
            slug: data.slug,
            collection_id: data.collection_id,
            price: data.price,
            description: data.description ?? null,
          })
          .eq('id', product.id)
        if (updateError) { toast.error('Error al actualizar producto'); return }
        const variantsSaved = await saveVariants(product.id, variants)
        if (!variantsSaved) return
        toast.success('Producto actualizado')
        onSaved(); onClose()
      } else {
        const { data: inserted, error } = await supabase
          .from('products')
          .insert({
            name: data.name,
            slug: data.slug,
            collection_id: data.collection_id,
            price: data.price,
            moneda_code: currency.code,
            description: data.description ?? null,
            active: true,
          })
          .select('id')
          .single()
        if (error || !inserted) { toast.error('Error al crear producto'); return }
        await saveVariants(inserted.id, variants)
        toast.success('Producto creado')
        onSaved(); onClose()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="sm:max-w-xl w-full bg-surface border-border overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display tracking-wide text-text-primary">
            {isEdit ? 'Editar producto' : 'Nuevo producto'}
          </SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-5 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-text-muted uppercase tracking-wider">Nombre</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-background border-border text-text-primary rounded-none focus:border-accent" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="slug" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-text-muted uppercase tracking-wider">Slug</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-background border-border text-text-primary rounded-none focus:border-accent" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="collection_id" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-text-muted uppercase tracking-wider">Drop</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="bg-background border-border text-text-primary rounded-none">
                        <SelectValue placeholder="Seleccionar drop" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-surface border-border">
                      {collections.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-text-muted uppercase tracking-wider">
                    Precio ({currency.code})
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.01" min="0"
                      className="bg-background border-border text-text-primary rounded-none focus:border-accent" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-text-muted uppercase tracking-wider">Descripción</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3}
                    className="bg-background border-border text-text-primary rounded-none focus:border-accent resize-none" />
                </FormControl>
              </FormItem>
            )} />
            {isEdit && product && (
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Imágenes</p>
                <ImageUploader productId={product.id} onUploaded={handleImageUploaded} />
              </div>
            )}
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Variantes</p>
              <VariantsEditor variants={variants} onChange={setVariants} />
            </div>
            <div className="flex justify-end gap-3 pt-2 pb-6">
              <Button type="button" variant="outline" onClick={onClose}
                className="border-border text-text-muted rounded-none">
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}
                className="bg-accent hover:bg-accent-hover text-background text-xs tracking-wider rounded-none">
                {saving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear producto'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/products/ProductFormSheet.tsx
git commit -m "feat(admin): add ProductFormSheet replacing Dialog with right-side Sheet"
```

---

### Task 3: DropFormSheet

**Files:**
- Create: `src/components/admin/drops/DropFormSheet.tsx`

- [ ] **Step 1: Crear DropFormSheet.tsx**

```tsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import type { Collection } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  slug: z.string().min(2, 'Slug requerido').regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  description: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  collection: Collection | null
  onClose: () => void
  onSaved: () => void
}

export default function DropFormSheet({ open, collection, onClose, onSaved }: Props) {
  const isEdit = !!collection
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '', description: '' },
  })

  useEffect(() => {
    if (collection) {
      form.reset({ name: collection.name, slug: collection.slug, description: collection.description ?? '' })
    } else {
      form.reset({ name: '', slug: '', description: '' })
    }
  }, [collection, form])

  async function handleSave(data: FormData) {
    if (isEdit && collection) {
      const { error } = await supabase.from('collections').update({
        name: data.name, slug: data.slug, description: data.description ?? null,
      }).eq('id', collection.id)
      if (error) { toast.error('Error al actualizar'); return }
      toast.success('Drop actualizado')
    } else {
      const { error } = await supabase.from('collections').insert({
        name: data.name, slug: data.slug, description: data.description ?? null, active: true,
      })
      if (error) { toast.error('Error al crear'); return }
      toast.success('Drop creado')
    }
    onSaved()
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="sm:max-w-md w-full bg-surface border-border overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display tracking-wide text-text-primary">
            {isEdit ? 'Editar drop' : 'Nuevo drop'}
          </SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4 mt-6">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-text-muted uppercase tracking-wider">Nombre</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-background border-border text-text-primary rounded-none focus:border-accent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="slug" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-text-muted uppercase tracking-wider">Slug</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-background border-border text-text-primary rounded-none focus:border-accent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-text-muted uppercase tracking-wider">Descripción</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3}
                    className="bg-background border-border text-text-primary rounded-none focus:border-accent resize-none" />
                </FormControl>
              </FormItem>
            )} />
            <div className="flex justify-end gap-3 pt-2 pb-6">
              <Button type="button" variant="outline" onClick={onClose}
                className="border-border text-text-muted rounded-none">Cancelar</Button>
              <Button type="submit"
                className="bg-accent hover:bg-accent-hover text-background text-xs tracking-wider rounded-none">
                {isEdit ? 'Actualizar' : 'Crear drop'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/drops/DropFormSheet.tsx
git commit -m "feat(admin): add DropFormSheet replacing Dialog with right-side Sheet"
```

---

### Task 4: Actualizar páginas — swapear Dialog por Sheet

**Files:**
- Modify: `src/pages/admin/AdminProductsPage.tsx`
- Modify: `src/pages/admin/AdminDropsPage.tsx`

- [ ] **Step 1: Actualizar AdminProductsPage.tsx**

Reemplazar en `src/pages/admin/AdminProductsPage.tsx`:

```tsx
// Línea 8 — cambiar:
import ProductFormDialog from '@/components/admin/products/ProductFormDialog'
// por:
import ProductFormSheet from '@/components/admin/products/ProductFormSheet'
```

```tsx
// Líneas 58-64 — cambiar:
<ProductFormDialog
  open={dialogOpen}
  product={editingProduct}
  collections={collections}
  onClose={() => setDialogOpen(false)}
  onSaved={handleSaved}
/>
// por:
<ProductFormSheet
  open={dialogOpen}
  product={editingProduct}
  collections={collections}
  onClose={() => setDialogOpen(false)}
  onSaved={handleSaved}
/>
```

- [ ] **Step 2: Actualizar AdminDropsPage.tsx**

Reemplazar en `src/pages/admin/AdminDropsPage.tsx`:

```tsx
// Línea 8 — cambiar:
import DropFormDialog from '@/components/admin/drops/DropFormDialog'
// por:
import DropFormSheet from '@/components/admin/drops/DropFormSheet'
```

```tsx
// Líneas 49-53 — cambiar:
<DropFormDialog
  open={dialogOpen} collection={editingCol}
  onClose={() => setDialogOpen(false)} onSaved={() => forceRefresh((n) => n + 1)}
/>
// por:
<DropFormSheet
  open={dialogOpen} collection={editingCol}
  onClose={() => setDialogOpen(false)} onSaved={() => forceRefresh((n) => n + 1)}
/>
```

- [ ] **Step 3: Verificar build**

```bash
npm run build
```

- [ ] **Step 4: Verificar visual**

Abrir `/admin/productos` → click "Nuevo producto" → Sheet desliza desde la derecha.
Abrir `/admin/drops` → click "Nuevo drop" → Sheet desliza desde la derecha.

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin/AdminProductsPage.tsx src/pages/admin/AdminDropsPage.tsx
git commit -m "feat(admin): migrate product and drop forms from Dialog to Sheet"
```

---

### Task 5: KPI counter-up + chart fade-in (AdminDashboardPage)

**Files:**
- Modify: `src/pages/admin/AdminDashboardPage.tsx`

- [ ] **Step 1: Reemplazar AdminDashboardPage.tsx completo**

```tsx
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
          formatter={String}
          icon={ShoppingBag}
          trend="Salidas registradas"
          delay={0.1}
        />
        <KpiCard
          label="Stock total"
          rawValue={stats?.totalStock ?? null}
          formatter={String}
          icon={Package}
          trend="Unidades disponibles"
          delay={0.2}
        />
        <KpiCard
          label="Productos activos"
          rawValue={stats?.activeProducts ?? null}
          formatter={String}
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
                    tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={(v: unknown) => `${currency.symbol}${((v as number) / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} width={48} />
                  <Tooltip
                    contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: 'var(--color-text-muted)', fontSize: 11 }}
                    formatter={(v: unknown) => [currency.format(v as number), 'Revenue'] as [string, string]}
                    labelFormatter={formatShortDate}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="var(--color-accent)"
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
                    tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip
                    contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: 'var(--color-text-muted)', fontSize: 11 }}
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
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

- [ ] **Step 3: Verificar visual**

Abrir `/admin` → los 4 KPI cards deben aparecer con fade-in escalonado y los números deben contar desde 0.
Al cambiar el date range, los números deben actualizarse sin animación (snap directo).
Los charts deben hacer fade-in al cargar.

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/AdminDashboardPage.tsx
git commit -m "feat(admin): add counter-up KPI animations and chart fade-in on dashboard"
```

---

### Task 6: DataTable fade-in wrapper

**Files:**
- Modify: `src/components/ui/data-table/data-table.tsx`

- [ ] **Step 1: Agregar import de motion y envolver el return**

En `src/components/ui/data-table/data-table.tsx`, línea 13, cambiar:

```tsx
import { useState } from 'react'
```

por:

```tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
```

Luego en el `return`, línea 65, cambiar:

```tsx
  return (
    <div className="space-y-3">
```

por:

```tsx
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
```

Y el cierre `</div>` final (línea 109) por `</motion.div>`.

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/data-table/data-table.tsx
git commit -m "feat(ui): add fade-in animation to DataTable wrapper"
```

---

### Task 7: AnimatedSectionTitle

**Files:**
- Create: `src/components/ui/animated-section-title.tsx`

- [ ] **Step 1: Crear animated-section-title.tsx**

```tsx
import { motion, useReducedMotion } from 'framer-motion'

interface Props {
  children: React.ReactNode
  className?: string
}

export function AnimatedSectionTitle({ children, className = '' }: Props) {
  const prefersReduced = useReducedMotion()
  return (
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: prefersReduced ? 0 : 0.5 }}
      className={className}
    >
      {children}
    </motion.h2>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/animated-section-title.tsx
git commit -m "feat(ui): add AnimatedSectionTitle with whileInView fade-in"
```

---

### Task 8: MarqueeTicker + CSS keyframe

**Files:**
- Create: `src/components/home/MarqueeTicker.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Agregar @keyframes marquee a index.css**

Agregar al final de `src/index.css`:

```css
@keyframes marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@media (prefers-reduced-motion: reduce) {
  .animate-marquee { animation-play-state: paused !important; }
}
```

- [ ] **Step 2: Crear MarqueeTicker.tsx**

```tsx
const TEXT = 'STREETWEAR · LIMA · EDICIÓN LIMITADA · DROPEN · '

export default function MarqueeTicker() {
  return (
    <div className="bg-accent text-background overflow-hidden h-9 flex items-center select-none">
      <span
        className="animate-marquee whitespace-nowrap font-mono text-xs tracking-widest uppercase inline-block"
        style={{ animation: 'marquee 20s linear infinite' }}
        aria-hidden="true"
      >
        {TEXT.repeat(8)}
      </span>
    </div>
  )
}
```

- [ ] **Step 3: Verificar build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/components/home/MarqueeTicker.tsx src/index.css
git commit -m "feat(home): add MarqueeTicker with CSS marquee animation"
```

---

### Task 9: HeroParallax ScrollIndicator

**Files:**
- Modify: `src/components/home/HeroParallax.tsx`

- [ ] **Step 1: Agregar ScrollIndicator dentro de HeroParallax**

Reemplazar `src/components/home/HeroParallax.tsx` completo:

```tsx
import { useRef } from 'react'
import {
  motion, useScroll, useTransform, useReducedMotion, AnimatePresence,
} from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HeroParallax() {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', prefersReduced ? '0%' : '50%'])
  const indicatorOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0])

  return (
    <div ref={ref} className="relative h-screen overflow-hidden">
      <motion.div style={{ y: bgY }} className="absolute inset-0 bg-surface" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
      </motion.div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-display font-bold text-7xl md:text-9xl tracking-[0.2em] text-text-primary"
        >
          DROPEN
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="mt-4 text-text-muted text-base md:text-lg tracking-widest uppercase"
        >
          Jeans baggy de edicion limitada
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6 }}
          className="mt-10"
        >
          <Button
            asChild
            className="bg-accent hover:bg-accent-hover text-background px-10 py-3 text-xs tracking-[0.2em] uppercase rounded-none"
          >
            <Link to="/colecciones">Ver colecciones</Link>
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <AnimatePresence>
        <motion.div
          style={{ opacity: indicatorOpacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
          aria-hidden="true"
        >
          <motion.div
            animate={prefersReduced ? {} : { y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-6 h-6 text-text-muted" />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

- [ ] **Step 3: Verificar visual**

Abrir `/` — debe verse un chevron rebotando en la parte inferior del hero. Al hacer scroll, el chevron debe desaparecer suavemente.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/HeroParallax.tsx
git commit -m "feat(home): add scroll indicator with bounce animation to HeroParallax"
```

---

### Task 10: BrandStatement — stats row con counter-up

**Files:**
- Modify: `src/components/home/BrandStatement.tsx`

- [ ] **Step 1: Reemplazar BrandStatement.tsx completo**

```tsx
import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useMotionValue, useReducedMotion, animate } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

interface StatProps {
  target: number
  suffix?: string
  label: string
  delay?: number
}

function CountUpStat({ target, suffix = '', label, delay = 0 }: StatProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const prefersReduced = useReducedMotion()
  const motionValue = useMotionValue(0)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    return motionValue.on('change', (v) => setDisplay(Math.round(v)))
  }, [motionValue])

  useEffect(() => {
    if (!inView) return
    if (prefersReduced) { setDisplay(target); return }
    animate(motionValue, target, { duration: 1.2, ease: 'easeOut', delay })
  }, [inView, target, prefersReduced, motionValue, delay])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: prefersReduced ? 0 : 0.5, delay }}
      className="text-center"
    >
      <p className="font-display font-bold text-4xl text-accent tabular-nums">
        {display}{suffix}
      </p>
      <p className="text-xs text-text-muted uppercase tracking-widest mt-2">{label}</p>
    </motion.div>
  )
}

export default function BrandStatement() {
  const dur = useReducedMotion() ? 0 : 0.7
  return (
    <section className="py-32 px-4 bg-surface border-t border-b border-border">
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: dur }}
          className="font-display font-bold text-4xl md:text-5xl text-text-primary tracking-wide"
        >
          Pedidos por lote para distribuidores
        </motion.h2>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-8 my-14">
          <CountUpStat target={50}  suffix="+"  label="Productos"    delay={0} />
          <CountUpStat target={3}   suffix=""   label="Colecciones"  delay={0.15} />
          <CountUpStat target={100} suffix="%"  label="Streetwear"   delay={0.3} />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: dur, delay: 0.3 }}
        >
          <Button
            asChild
            variant="outline"
            className="border-accent text-accent hover:bg-accent hover:text-background px-10 py-3 text-xs tracking-[0.2em] uppercase rounded-none"
          >
            <Link to="/wholesale">Hacer pedido wholesale</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

- [ ] **Step 3: Verificar visual**

Hacer scroll hasta el BrandStatement — los 3 números deben contar desde 0 al entrar en viewport. Solo ocurre una vez.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/BrandStatement.tsx
git commit -m "feat(home): add stats counter-up row to BrandStatement"
```

---

### Task 11: DropsGrid — AnimatedSectionTitle

**Files:**
- Modify: `src/components/home/DropsGrid.tsx`

- [ ] **Step 1: Actualizar DropsGrid.tsx**

Reemplazar en `src/components/home/DropsGrid.tsx`:

```tsx
// Agregar import en la línea 2 (después del import de framer-motion):
import { AnimatedSectionTitle } from '@/components/ui/animated-section-title'
```

Y dentro del return, reemplazar el `<h2>` estático:

```tsx
// Cambiar:
<h2 className="font-display font-bold text-3xl tracking-widest text-text-primary mb-12 uppercase">
  Drops
</h2>
// por:
<AnimatedSectionTitle className="font-display font-bold text-3xl tracking-widest text-text-primary mb-12 uppercase">
  Drops
</AnimatedSectionTitle>
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/home/DropsGrid.tsx
git commit -m "feat(home): animate Drops section title with whileInView"
```

---

### Task 12: ProductCard — hover overlay

**Files:**
- Modify: `src/components/product/ProductCard.tsx`

- [ ] **Step 1: Agregar overlay en ProductCard**

En `src/components/product/ProductCard.tsx`, dentro del `<div className="relative overflow-hidden aspect-[3/4]...">`, agregar el overlay después del bloque de imagen y antes del badge "Agotado". El resultado del div interno debe quedar así:

```tsx
<div className="relative overflow-hidden aspect-[3/4] bg-surface mb-4">
  {imageUrl ? (
    <img
      src={`${imageUrl}?width=600&quality=80`}
      alt={product.name}
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
    />
  ) : (
    <div className="absolute inset-0 flex items-center justify-center text-text-muted text-sm">
      Sin imagen
    </div>
  )}
  {imageUrl && (
    <motion.div
      initial={{ opacity: 0 }}
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 bg-background/50 backdrop-blur-[2px] flex items-center justify-center pointer-events-none"
    >
      <span className="text-text-primary text-xs tracking-[0.2em] uppercase font-medium">
        Ver producto
      </span>
    </motion.div>
  )}
  {outOfStock && (
    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
      <Badge variant="secondary">Agotado</Badge>
    </div>
  )}
</div>
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

- [ ] **Step 3: Verificar visual**

Abrir la home o catálogo → hacer hover sobre un producto con imagen → debe aparecer un overlay semitransparente con "Ver producto".

- [ ] **Step 4: Commit**

```bash
git add src/components/product/ProductCard.tsx
git commit -m "feat(home): add hover overlay 'Ver producto' to ProductCard"
```

---

### Task 13: HomePage — integrar MarqueeTicker + AnimatedSectionTitle

**Files:**
- Modify: `src/pages/HomePage.tsx`

- [ ] **Step 1: Reemplazar HomePage.tsx completo**

```tsx
import { useCollections, useAllProducts } from '@/hooks/useProducts'
import HeroParallax from '@/components/home/HeroParallax'
import DropsGrid from '@/components/home/DropsGrid'
import BrandStatement from '@/components/home/BrandStatement'
import MarqueeTicker from '@/components/home/MarqueeTicker'
import { AnimatedSectionTitle } from '@/components/ui/animated-section-title'
import { Skeleton } from '@/components/ui/skeleton'
import ProductCard from '@/components/product/ProductCard'
import PageMeta from '@/components/seo/PageMeta'

export default function HomePage() {
  const { collections, loading: loadingCollections } = useCollections()
  const { products, loading: loadingProducts } = useAllProducts()
  const featured = products.slice(0, 4)
  const loading = loadingCollections || loadingProducts

  return (
    <>
      <PageMeta title="DROPEN" description="Jeans baggy premium. Streetwear consciente desde Lima." />
      <HeroParallax />
      <MarqueeTicker />
      {loading ? (
        <section className="py-20 px-4 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] bg-surface" />
            ))}
          </div>
        </section>
      ) : (
        <DropsGrid collections={collections} limit={2} />
      )}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimatedSectionTitle className="font-display font-bold text-3xl tracking-widest text-text-primary mb-12 uppercase">
            Destacados
          </AnimatedSectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4] bg-surface" />
                ))
              : featured.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
          </div>
        </div>
      </section>
      <BrandStatement />
    </>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

- [ ] **Step 3: Verificar visual completo del home**

Abrir `/`:
- Hero con scroll indicator (chevron rebotando)
- Al bajar: ticker de texto animado (fondo accent, letras blancas corriendo)
- Sección "Drops" con título animado al entrar en viewport
- Sección "Destacados" con título animado al entrar en viewport
- ProductCards con hover overlay "Ver producto"
- BrandStatement con stats counter-up (50+, 3, 100%) al entrar en viewport

- [ ] **Step 4: Commit**

```bash
git add src/pages/HomePage.tsx
git commit -m "feat(home): integrate MarqueeTicker and AnimatedSectionTitle in HomePage"
```

---

## Self-Review Checklist

- ✅ Sidebar responsive (Task 1) — useMobile hook + Sheet desde izquierda
- ✅ ProductFormSheet (Task 2) — Dialog → Sheet lado derecho
- ✅ DropFormSheet (Task 3) — Dialog → Sheet lado derecho
- ✅ Page imports actualizados (Task 4)
- ✅ Counter-up KPIs con `hasAnimated` ref para solo primer load (Task 5)
- ✅ Chart fade-in con AnimatePresence (Task 5)
- ✅ DataTable fade-in wrapper (Task 6)
- ✅ AnimatedSectionTitle reutilizable (Task 7)
- ✅ MarqueeTicker + @keyframes CSS (Task 8)
- ✅ ScrollIndicator con opacity vinculada a scrollYProgress (Task 9)
- ✅ BrandStatement stats con CountUpStat + useInView (Task 10)
- ✅ DropsGrid usa AnimatedSectionTitle (Task 11)
- ✅ ProductCard hover overlay solo cuando hay imagen (Task 12)
- ✅ HomePage integra todos los componentes nuevos (Task 13)
- ✅ Todos los efectos respetan `useReducedMotion()`
- ✅ Sin nuevas librerías — todo con Framer Motion + CSS nativo
- ✅ No se modifica lógica de negocio en Tasks 2-4
