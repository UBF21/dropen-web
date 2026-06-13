# UI Upgrade — Animaciones + Sidebar Responsive + Sheets + Home

**Fecha:** 2026-06-13  
**Scope:** Admin panel + Home público  
**Stack:** React 19, TypeScript, Framer Motion (ya instalado), shadcn/ui (Sheet ya instalado), Tailwind CSS

---

## 1. Sidebar Responsive (Admin)

### Comportamiento

| Viewport | Comportamiento |
|---|---|
| Desktop ≥ 1024px | Sidebar fijo 240px, siempre visible (sin cambios) |
| Mobile < 1024px | Sidebar oculto; top-bar de 56px con hamburger + logo + rol |

### Top-bar mobile
- **Izquierda:** botón `<Menu>` (lucide) que abre el Sheet
- **Centro:** texto "DROPEN" (`font-display`, `tracking-widest`)
- **Derecha:** texto del rol del usuario (`text-xs text-text-muted`)

### Sheet mobile
- Componente shadcn `Sheet` con `side="left"`, ancho 240px
- Contenido idéntico al sidebar actual (logo, nav items, sign out)
- Se cierra al hacer click en un NavLink o al tocar el overlay
- Usa `useNavigate` para detectar cambio de ruta y cerrar

### Archivos modificados
- `src/components/admin/AdminLayout.tsx` — único archivo a cambiar
- Nuevo hook inline `useMobile` (o import desde `@/hooks/useMobile`) basado en `window.matchMedia('(max-width: 1023px)')` con listener de resize

---

## 2. Animaciones Admin

### KPI Cards — Dashboard

**Entrada (mount):**
- 4 cards con `motion.div`, `initial={{ opacity: 0, y: 20 }}`, `animate={{ opacity: 1, y: 0 }}`
- Stagger: delays de 0ms, 100ms, 200ms, 300ms
- Ícono: micro-scale `initial={{ scale: 0.8 }} animate={{ scale: 1 }}`

**Counter-up numérico:**
- Solo en primera carga (cuando `stats` pasa de `null` a tener valor)
- Implementación: `useMotionValue(0)` + `animate(motionValue, target, { duration: 1.2, ease: 'easeOut' })` dentro de `useEffect` con un ref `hasAnimated` para no repetir
- `useTransform` para redondear el valor a entero y formatearlo
- Los valores de currency usan el mismo formatter que hoy

### Charts

- `AnimatePresence` wrapping cada chart container
- Cuando `loading` pasa a `false`: `motion.div` con `initial={{ opacity: 0 }} animate={{ opacity: 1 }}`, `transition={{ duration: 0.4 }}`

### DataTable

- Wrapper de la tabla: `motion.div` con `initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}` cuando los datos llegan
- Sin animación por fila (performance con 50+ rows)

### Archivos modificados
- `src/pages/admin/AdminDashboardPage.tsx` — KPI cards + charts
- `src/components/ui/data-table/data-table.tsx` — wrapper fade-in

---

## 3. Forms → Sheet (Admin)

### ProductFormDialog → ProductFormSheet

- Reemplaza `Dialog` / `DialogContent` por `Sheet` / `SheetContent`
- `side="right"`, `className="sm:max-w-xl w-full"`
- `SheetHeader` con `SheetTitle` + botón close implícito del Sheet
- Contenido (form, campos, VariantsEditor, ImageUploader) sin cambios
- En mobile: ocupa pantalla completa, el Sheet es scrollable internamente

**Archivos:**
- `src/components/admin/products/ProductFormDialog.tsx` → renombrar a `ProductFormSheet.tsx`
- `src/pages/admin/AdminProductsPage.tsx` → actualizar import

### DropFormDialog → DropFormSheet

- Misma migración: `Dialog` → `Sheet`, `side="right"`, `sm:max-w-md`
- Lógica de negocio sin cambios

**Archivos:**
- `src/components/admin/drops/DropFormDialog.tsx` → renombrar a `DropFormSheet.tsx`
- `src/pages/admin/AdminDropsPage.tsx` → actualizar import

---

## 4. Home — Más Vida

### 4.1 ScrollIndicator en Hero

- Componente inline dentro de `HeroParallax.tsx`
- `motion.div` con `animate={{ y: [0, 8, 0] }}`, `transition={{ repeat: Infinity, duration: 1.4 }}`
- Ícono `<ChevronDown>` (lucide), posicionado `absolute bottom-8 left-1/2 -translate-x-1/2`
- Desaparece con `AnimatePresence` cuando `scrollYProgress > 0.05`
- Respeta `useReducedMotion`

### 4.2 Marquee Ticker

- Nuevo componente `src/components/home/MarqueeTicker.tsx`
- Se inserta en `HomePage.tsx` entre `<HeroParallax />` y `<DropsGrid />`
- Contenido: `STREETWEAR · LIMA · EDICIÓN LIMITADA · DROPEN ·` (repetido ×4 en el DOM)
- Implementación: CSS `@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }` con `animation: marquee 20s linear infinite`
- Estilos: `bg-accent text-background`, tipografía `font-mono text-xs tracking-widest uppercase`, altura 36px
- Respeta `prefers-reduced-motion`: `animation-play-state: paused`

### 4.3 AnimatedSectionTitle

- Nuevo componente `src/components/ui/animated-section-title.tsx`
- Props: `children`, `className?`
- `motion.h2` con `initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}`
- Reemplaza los `<h2>` estáticos en `DropsGrid.tsx` y en la sección "Destacados" de `HomePage.tsx`

### 4.4 BrandStatement Upgrade

- Agrega fila de 3 stats encima del botón wholesale
- Stats: `50+ Productos`, `3 Colecciones`, `100% Streetwear`
- Cada stat: número con counter-up (`whileInView`, `once: true`) + label con fade-in staggered
- Layout: `grid grid-cols-3 gap-8 my-12`
- Número: `font-display font-bold text-4xl text-accent`
- Label: `text-xs text-text-muted uppercase tracking-widest mt-1`

### 4.5 ProductCard Hover Overlay

- Dentro de `ProductCard.tsx`, agregar `<motion.div>` sobre la imagen
- `initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}`, `transition={{ duration: 0.2 }}`
- Contenido: `bg-background/40 backdrop-blur-sm` + texto "Ver producto" centrado
- Solo visible cuando la imagen existe (no en el estado "Sin imagen")

---

## Archivos a crear

| Archivo | Descripción |
|---|---|
| `src/components/home/MarqueeTicker.tsx` | Ticker horizontal animado |
| `src/components/ui/animated-section-title.tsx` | Título de sección con whileInView |
| `src/components/admin/products/ProductFormSheet.tsx` | Form de producto como Sheet |
| `src/components/admin/drops/DropFormSheet.tsx` | Form de drop como Sheet |

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/components/admin/AdminLayout.tsx` | Sidebar responsive + top-bar mobile |
| `src/pages/admin/AdminDashboardPage.tsx` | Counter-up KPIs + animaciones charts |
| `src/components/ui/data-table/data-table.tsx` | Fade-in wrapper |
| `src/pages/admin/AdminProductsPage.tsx` | Import ProductFormSheet |
| `src/pages/admin/AdminDropsPage.tsx` | Import DropFormSheet |
| `src/components/home/HeroParallax.tsx` | ScrollIndicator |
| `src/components/home/DropsGrid.tsx` | AnimatedSectionTitle |
| `src/components/home/BrandStatement.tsx` | Stats row + counter-up |
| `src/components/product/ProductCard.tsx` | Hover overlay |
| `src/pages/HomePage.tsx` | MarqueeTicker + AnimatedSectionTitle en Destacados |

---

## Restricciones

- No instalar nuevas librerías — todo con Framer Motion (ya instalado) + CSS nativo
- Todos los efectos respetan `useReducedMotion()`
- Counter-up solo en primera carga (ref `hasAnimated`)
- Sin animación por fila en DataTable (performance)
- Los Sheets no cambian lógica de negocio, solo el contenedor visual
