# DROPEN — E-commerce Design Spec
**Fecha:** 2026-06-12  
**Stack:** React 19 + Vite, shadcn/ui, Supabase, Framer Motion, Zustand, React Router v7  
**Estado:** Aprobado

---

## 1. Visión general

E-commerce minimalista premium para la marca **DROPEN** (jeans baggy). Estética dark luxury con parallax/motion. Sin pagos con tarjeta en MVP — el checkout redirige a WhatsApp generando una reserva automática de 2 horas. Incluye formulario de pedidos por lote (wholesale) configurable desde base de datos.

**Marca:** DROPEN (texto logo hasta que exista asset)  
**WhatsApp:** +51991941252  
**Moneda base:** PEN (soles peruanos)

---

## 2. Arquitectura

### Tipo
Vite + React 19 SPA. Deploy estático en Vercel. Sin backend propio — toda la lógica de datos vía Supabase JS client + Edge Functions.

### Estructura de carpetas

```
dropen-web/
├── docs/superpowers/
│   ├── specs/     ← este archivo
│   └── plans/     ← plan de implementación
├── src/
│   ├── components/
│   │   ├── ui/              ← shadcn generados
│   │   ├── layout/          ← Header, Footer, Layout
│   │   ├── product/         ← ProductCard, ProductGallery, VariantSelector
│   │   ├── cart/            ← CartDrawer, CartItem, CartSummary
│   │   ├── checkout/        ← WhatsAppCheckout
│   │   ├── wholesale/       ← WholesaleForm, LotConfigurator
│   │   ├── home/            ← HeroParallax, DropsGrid, BrandStatement
│   │   └── admin/           ← AdminLayout, Sidebar, ProtectedRoute, DataTable, ImageUploader, VariantEditor
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── CatalogPage.tsx
│   │   ├── DropPage.tsx
│   │   ├── ProductPage.tsx
│   │   ├── WholesalePage.tsx
│   │   └── admin/
│   │       ├── AdminLoginPage.tsx
│   │       ├── DashboardPage.tsx
│   │       ├── CollectionsPage.tsx
│   │       ├── CollectionFormPage.tsx
│   │       ├── ProductsPage.tsx
│   │       ├── ProductFormPage.tsx
│   │       ├── ReservationsPage.tsx
│   │       ├── WholesaleOrdersPage.tsx
│   │       ├── ConfigPage.tsx
│   │       └── UsersPage.tsx
│   ├── store/
│   │   ├── cart.store.ts        ← items, addItem, removeItem, persist
│   │   ├── reservation.store.ts ← reservationId, expiresAt, status
│   │   ├── ui.store.ts          ← isCartOpen, activeProduct, modals
│   │   └── index.ts
│   ├── lib/
│   │   ├── supabase.ts          ← cliente Supabase
│   │   ├── whatsapp.ts          ← genera URL + mensaje formateado
│   │   └── reservations.ts      ← crear/liberar reservas
│   └── hooks/
│       ├── useProducts.ts
│       ├── useCart.ts
│       ├── useReservation.ts
│       ├── useAdminAuth.ts
│       └── useAdminStats.ts
├── supabase/
│   ├── migrations/
│   └── functions/
│       └── release-reservations/  ← Edge Function cron cada 30min
└── .env.local
```

### Estado global — Zustand stores

| Store | Contenido | Persistencia |
|---|---|---|
| `cart.store` | items[], addItem, removeItem, updateQty, clearCart | localStorage |
| `reservation.store` | reservationId, expiresAt, status, timer | sessionStorage |
| `ui.store` | isCartOpen, isWholesaleModalOpen, activeProduct | ninguna |

---

## 3. Modelo de datos Supabase

### Tablas reutilizadas de Ana_Morriberon_web
Migrar seed data de estas tablas al proyecto `dropen` (icfqhtiujsboyrggxpqu):
- `monedas` — 18 monedas (incluye PEN, USD)
- `paises` — 21 países LatAm
- `ciudades` — 33 ciudades
- `distritos` — 37 distritos urbanos
- `tipos_documento` — DNI, RUC, PAS, etc.

### Tablas nuevas

```sql
-- Colecciones / Drops
collections (
  id            uuid PK DEFAULT gen_random_uuid(),
  name          text NOT NULL,          -- "Drop 01"
  slug          text UNIQUE NOT NULL,
  description   text,
  cover_url     text,
  active        boolean DEFAULT true,
  created_at    timestamptz DEFAULT now()
)

-- Productos
products (
  id            uuid PK DEFAULT gen_random_uuid(),
  collection_id uuid FK → collections,
  name          text NOT NULL,
  slug          text UNIQUE NOT NULL,
  description   text,
  price         numeric(10,2) NOT NULL,
  moneda_code   char(3) FK → monedas(code) DEFAULT 'PEN',
  active        boolean DEFAULT true,
  created_at    timestamptz DEFAULT now()
)

-- Imágenes de producto (Supabase Storage bucket: product-images)
product_images (
  id            uuid PK DEFAULT gen_random_uuid(),
  product_id    uuid FK → products ON DELETE CASCADE,
  url           text NOT NULL,          -- URL pública del bucket
  storage_path  text NOT NULL,          -- 'products/{product_id}/{filename}'
  alt_text      text,
  order         integer DEFAULT 0,      -- 0 = primera/principal
  is_primary    boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
)

-- Variantes (talla + color)
product_variants (
  id            uuid PK DEFAULT gen_random_uuid(),
  product_id    uuid FK → products,
  size          text NOT NULL,          -- '28','30','32','34','36'
  color         text NOT NULL,          -- 'Black','Stone','Indigo'
  stock         integer DEFAULT 0,
  sku           text UNIQUE NOT NULL,
  UNIQUE(product_id, size, color)
)

-- Reservas WhatsApp
reservations (
  id            uuid PK DEFAULT gen_random_uuid(),
  variant_id    uuid FK → product_variants,
  quantity      integer NOT NULL,
  status        text DEFAULT 'pending'  -- 'pending'|'confirmed'|'expired'
                CHECK (status IN ('pending','confirmed','expired')),
  expires_at    timestamptz NOT NULL,   -- created_at + interval '2 hours'
  customer_wa   text,
  created_at    timestamptz DEFAULT now()
)

-- Configuración global (patrón site_settings)
site_settings (
  key           text PK,
  value         text NOT NULL,
  updated_at    timestamptz DEFAULT now()
)
-- Keys usadas:
-- 'wholesale_min_units'  → '6'
-- 'wholesale_max_units'  → '60'
-- 'whatsapp_number'      → '51991941252'
-- 'store_currency'       → 'PEN'

-- Pedidos wholesale
wholesale_orders (
  id                  uuid PK DEFAULT gen_random_uuid(),
  customer_name       text NOT NULL,
  customer_email      text NOT NULL,
  customer_phone      text NOT NULL,
  tipo_documento_id   uuid FK → tipos_documento(id),
  numero_documento    text,
  pais_code           char(2) FK → paises(code),
  ciudad_code         text FK → ciudades(code),
  items               jsonb DEFAULT '[]',  -- [{product_id, name, size, color, quantity}]
  total_units         integer NOT NULL,
  notes               text,
  status              text DEFAULT 'pending'
                      CHECK (status IN ('pending','contacted','confirmed')),
  created_at          timestamptz DEFAULT now()
)
```

### Stock disponible en tiempo real
```sql
available_stock(variant_id) =
  variant.stock
  - COALESCE(SUM(r.quantity) FILTER (
      WHERE r.status = 'pending' AND r.expires_at > now()
    ), 0)
```

### Edge Function — release-reservations
- Trigger: cron cada 30 minutos
- Acción:
```sql
UPDATE reservations
SET status = 'expired'
WHERE status = 'pending' AND expires_at < now()
```

### Bucket Supabase Storage
- Nombre: `product-images`
- Lectura: pública
- Escritura: solo `service_role`
- Path: `products/{product_id}/{uuid}.webp`

---

## 4. Flujo de checkout WhatsApp + reserva

```
1. Usuario abre CartDrawer → revisa items y variantes seleccionadas
2. Clic "Confirmar pedido"
3. Para cada item del carrito:
   INSERT INTO reservations (variant_id, quantity, status='pending',
   expires_at = now() + interval '2 hours')
4. Si todas las reservas se crean OK:
   a. Generar mensaje formateado:
      "🛍 Nuevo pedido DROPEN
       ─────────────────────
       Jean Baggy Cargo
       Talla: 32 | Negro
       Cant: 1 — S/ 189.00
       
       Total: S/ 189.00
       Ref: DRP-{8chars}
       ─────────────────────
       *Reservado por 2 horas*"
   b. window.open(`https://wa.me/51991941252?text=${encoded}`)
   c. reservation.store guarda {reservationId, expiresAt}
   d. UI muestra ReservationTimer con countdown
5. Si falla alguna reserva:
   → No abrir WhatsApp
   → Toast de error
   → Revertir reservas creadas en esa transacción
```

**Casos edge:**
- Sin stock → botón "Agregar" deshabilitado, badge "Agotado"
- Stock insuficiente → validación pre-INSERT, error inline
- Múltiples items → `Promise.all` de reservas
- Usuario cierra WA sin enviar → reserva expira en 2hs (aceptable MVP)
- Referencia pedido: `DRP-` + primeros 8 chars del UUID de la primera reserva

---

## 5. UI / Design System

### Paleta dark luxury
```
Background:   #0A0A0A
Surface:      #111111
Border:       #1F1F1F
Text primary: #F5F0E8
Text muted:   #6B6B6B
Accent:       #C9A96E  ← dorado (CTAs, highlights)
Accent hover: #E8C97A
Error:        #C0392B
```

### Tipografía
- **Display** (hero, títulos): PP Neue Montreal — fallback DM Sans → sans-serif — weights: 300, 500, 700
- **Body / UI**: Inter via @fontsource/inter — weights: 400, 500

### Animaciones — Framer Motion
| Elemento | Animación |
|---|---|
| Hero | Parallax scroll (background 0.5x velocidad) |
| ProductCards | Fade-in + slide-up al entrar viewport (stagger 0.1s) |
| Rutas | Fade con AnimatePresence |
| CartDrawer | Slide-in desde la derecha |
| Hover cards | Scale 1.02 + shadow sutil |
| Drops grid cover | Zoom lento al hover (scale 1.05, 600ms) |
| reducedMotion | Respetado vía `useReducedMotion()` |

### Componentes shadcn
`Button, Sheet, Dialog, Badge, Select, Input, Textarea, Form, Sonner (Toast), Separator, Skeleton`

### Componentes custom
| Componente | Descripción |
|---|---|
| `HeroParallax` | Fullscreen, imagen/video de fondo, texto centrado, CTA |
| `DropsGrid` | Grid de colecciones con cover full-bleed |
| `ProductCard` | Imagen, nombre, precio, badge stock |
| `VariantSelector` | Botones talla + color swatches |
| `CartDrawer` | Sheet lateral, items, total, botón WA |
| `ReservationTimer` | Countdown 2hs post-checkout |
| `WholesaleForm` | Multi-step con validación Zod |

---

## 6. Páginas y rutas

| Ruta | Página | Contenido clave |
|---|---|---|
| `/` | HomePage | HeroParallax, DropsGrid, FeaturedProducts (6), BrandStatement, WholesaleCTA |
| `/colecciones` | CatalogPage | DropsGrid completo |
| `/colecciones/:slug` | DropPage | Cover con parallax reducido, ProductsGrid del drop |
| `/productos/:slug` | ProductPage | Galería, VariantSelector, stock real, carrito, productos relacionados |
| `/wholesale` | WholesalePage | Info límites desde DB, WholesaleForm 3 steps |

### WholesaleForm — 3 pasos
1. **Datos personales**: nombre, email, teléfono, tipo documento, número, país, ciudad
2. **Configurador de lote**: seleccionar productos + talla + color + cantidad (validado contra min/max de site_settings)
3. **Revisión + envío**: resumen + INSERT wholesale_orders + mensaje WA automático

---

## 7. Responsividad

Mobile-first. Breakpoints Tailwind estándar:

| Breakpoint | px | Comportamiento |
|---|---|---|
| default | < 640 | 1 columna, nav hamburguesa |
| sm | 640 | — |
| md | 768 | 2 columnas en grids |
| lg | 1024 | Layout completo |
| xl | 1280 | max-w-7xl centrado |

---

## 8. Performance

- `React.lazy` + `Suspense` por ruta (code splitting)
- Skeleton loaders en ProductCard y ProductGallery
- Imágenes Supabase Storage con query params de resize (`?width=800&quality=80`)
- `prefers-reduced-motion` respetado en todas las animaciones

---

## 9. Variables de entorno

```env
VITE_SUPABASE_URL=https://icfqhtiujsboyrggxpqu.supabase.co
VITE_SUPABASE_ANON_KEY=  ← ver .env.local (no commitear)
VITE_WHATSAPP_NUMBER=51991941252
```

---

## 10. Panel de administración

### Autenticación
- Supabase Auth — email/password
- Login en `/admin/login` — ruta pública, resto de `/admin/*` protegido
- Al autenticar: leer `admin_profiles.role` para determinar permisos
- Sesión persistida via Supabase session (localStorage)

### Roles y permisos

| Sección | `admin` | `editor` | `viewer` |
|---|---|---|---|
| Dashboard (stats) | ✅ | ✅ | ✅ |
| Colecciones (CRUD) | ✅ | ✅ | ❌ |
| Productos (CRUD) | ✅ | ✅ | ❌ |
| Reservas (ver) | ✅ | ❌ | ✅ |
| Pedidos wholesale (ver) | ✅ | ❌ | ✅ |
| Configuración (site_settings) | ✅ | ❌ | ❌ |
| Usuarios (CRUD) | ✅ | ❌ | ❌ |

### Tabla de perfiles admin

```sql
admin_profiles (
  id        uuid PK REFERENCES auth.users(id) ON DELETE CASCADE,
  email     text NOT NULL,
  full_name text,
  role      text NOT NULL DEFAULT 'viewer'
            CHECK (role IN ('admin','editor','viewer')),
  active    boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)
```

### Rutas del panel

```
/admin/login              → AdminLoginPage (pública)
/admin                    → redirect → /admin/dashboard
/admin/dashboard          → DashboardPage       [admin, editor, viewer]
/admin/colecciones        → CollectionsPage     [admin, editor]
/admin/colecciones/nueva  → CollectionFormPage  [admin, editor]
/admin/colecciones/:id    → CollectionFormPage  [admin, editor]
/admin/productos          → ProductsPage        [admin, editor]
/admin/productos/nuevo    → ProductFormPage     [admin, editor]
/admin/productos/:id      → ProductFormPage     [admin, editor]
/admin/reservas           → ReservationsPage    [admin, viewer]
/admin/wholesale          → WholesaleOrdersPage [admin, viewer]
/admin/configuracion      → ConfigPage          [admin]
/admin/usuarios           → UsersPage           [admin]
```

### Secciones por página

**DashboardPage** (todos los roles)
- Stat cards: total productos activos, stock total disponible, reservas pendientes activas, pedidos wholesale pendientes
- Tabla de últimas 5 reservas con countdown
- Tabla de últimos 5 pedidos wholesale

**CollectionsPage / CollectionFormPage** (admin, editor)
- Lista de drops con cover, nombre, cantidad de productos, estado activo/inactivo
- Formulario: nombre, slug (auto-generado), descripción, upload de cover (bucket `collection-covers`)
- Toggle activo/inactivo

**ProductsPage / ProductFormPage** (admin, editor)
- Lista con imagen principal, nombre, colección, precio, stock total, estado
- Filtro por colección
- Formulario:
  - Datos básicos: nombre, slug, descripción, precio, moneda, colección
  - Galería: upload múltiple de imágenes al bucket `product-images`, drag & drop para ordenar, marcar principal
  - Variantes: tabla inline para agregar/editar/eliminar combinaciones talla+color+stock+SKU

**ReservationsPage** (admin, viewer)
- Tabla con: referencia DRP-, producto, variante, cantidad, estado (badge), tiempo restante (countdown si pending), fecha
- Filtro por estado: pending / confirmed / expired
- Acción admin: marcar como `confirmed` manualmente

**WholesaleOrdersPage** (admin, viewer)
- Tabla con: cliente, email, teléfono, país, unidades totales, estado, fecha
- Ver detalle en modal: items del pedido, datos de contacto completos
- Acción admin: cambiar estado (pending → contacted → confirmed)

**ConfigPage** (solo admin)
- Formulario de site_settings con labels amigables:
  - Mínimo por lote (`wholesale_min_units`)
  - Máximo por lote (`wholesale_max_units`)
  - Número WhatsApp (`whatsapp_number`)
  - Moneda base (`store_currency`)

**UsersPage** (solo admin)
- Lista de usuarios admin con nombre, email, rol, estado activo
- Invitar nuevo usuario: email + rol (crea registro en auth + admin_profiles)
- Cambiar rol / desactivar usuario existente

### UI del admin
- Tema: dark (consistente con el e-commerce), sidebar colapsable
- Layout: sidebar izquierdo fijo + contenido principal
- Componentes shadcn adicionales: Table, DataTable (TanStack Table), Tabs, Switch, DropdownMenu, Avatar, Command (búsqueda)
- Sin animaciones de parallax — UX funcional y rápida

### Carpetas nuevas en src/

```
src/
├── pages/admin/
│   ├── AdminLoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── CollectionsPage.tsx
│   ├── CollectionFormPage.tsx
│   ├── ProductsPage.tsx
│   ├── ProductFormPage.tsx
│   ├── ReservationsPage.tsx
│   ├── WholesaleOrdersPage.tsx
│   ├── ConfigPage.tsx
│   └── UsersPage.tsx
├── components/admin/
│   ├── AdminLayout.tsx       ← sidebar + topbar
│   ├── AdminSidebar.tsx
│   ├── ProtectedRoute.tsx    ← HOC con verificación de rol
│   ├── StatCard.tsx
│   ├── DataTable.tsx         ← TanStack Table wrapper
│   ├── ImageUploader.tsx     ← upload a bucket Supabase
│   └── VariantEditor.tsx     ← tabla inline de variantes
└── hooks/
    ├── useAdminAuth.ts       ← session + role
    └── useAdminStats.ts      ← queries del dashboard
```

---

## 11. Fuera del alcance (MVP)

- Pagos con tarjeta
- Autenticación de clientes (tienda pública)
- Sistema de cupones / descuentos
- Tracking de envíos
- Reviews de productos
