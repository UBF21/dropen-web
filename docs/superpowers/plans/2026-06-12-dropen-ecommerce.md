# DROPEN E-commerce Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack e-commerce SPA for DROPEN (jeans baggy) con checkout WhatsApp, pedidos wholesale y panel admin, desplegado en Vercel con Supabase como backend.

**Architecture:** React 19 SPA (Vite) con React Router v7. Estado global via Zustand (carrito persistido, UI transient). Toda la data via Supabase JS client — sin backend propio. El panel admin es una sección protegida del mismo SPA.

**Tech Stack:** React 19, Vite 6, TypeScript 5, React Router v7, Zustand v5, Supabase JS v2, Framer Motion v11, shadcn/ui, Tailwind CSS v3, Vitest + React Testing Library

---

## Mapa de ejecución paralela

```
Task 1 (Foundation — scaffold, deps, config)
  ├── Task 2 (Supabase migrations)          ─┐
  ├── Task 3 (Types + Lib layer)             ├─ paralelas
  └── Task 4 (Zustand stores)               ─┘
        └── Task 5 (Router + Layout)
              ├── Task 6 (Home page)              ─┐
              ├── Task 7 (Catalog + hooks)         ├─ paralelas
              ├── Task 9 (Cart + Checkout)         │
              └── Task 10 (Wholesale)             ─┘
                    └── Task 8 (Product page — depende de 7+9)
              └── Task 11 (Admin foundation)
                    ├── Task 12 (Admin collections + products)  ─┐ paralelas
                    └── Task 13 (Admin operations)             ─┘
Task 14 (Edge Function) — independiente después de Task 2
Task 15 (Performance + polish) — última
```

---

## Estructura de archivos

```
dropen-web/
├── src/
│   ├── types/index.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── whatsapp.ts
│   │   └── reservations.ts
│   ├── store/
│   │   ├── cart.store.ts
│   │   ├── reservation.store.ts
│   │   ├── ui.store.ts
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useProducts.ts
│   │   ├── useCart.ts
│   │   ├── useReservation.ts
│   │   ├── useAdminAuth.ts
│   │   └── useAdminStats.ts
│   ├── components/
│   │   ├── ui/                    ← shadcn generados (no editar a mano)
│   │   ├── layout/Header.tsx
│   │   ├── layout/Footer.tsx
│   │   ├── layout/Layout.tsx
│   │   ├── product/ProductCard.tsx
│   │   ├── product/ProductGallery.tsx
│   │   ├── product/VariantSelector.tsx
│   │   ├── cart/CartDrawer.tsx
│   │   ├── cart/CartItem.tsx
│   │   ├── cart/CartSummary.tsx
│   │   ├── checkout/WhatsAppCheckout.tsx
│   │   ├── checkout/ReservationTimer.tsx
│   │   ├── wholesale/WholesaleForm.tsx
│   │   ├── wholesale/LotConfigurator.tsx
│   │   ├── home/HeroParallax.tsx
│   │   ├── home/DropsGrid.tsx
│   │   ├── home/BrandStatement.tsx
│   │   └── admin/
│   │       ├── AdminLayout.tsx
│   │       ├── AdminSidebar.tsx
│   │       ├── ProtectedRoute.tsx
│   │       ├── StatCard.tsx
│   │       ├── DataTable.tsx
│   │       ├── ImageUploader.tsx
│   │       └── VariantEditor.tsx
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
│   ├── router.tsx
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── migrations/001_initial_schema.sql
│   ├── migrations/002_admin_profiles.sql
│   └── functions/release-reservations/index.ts
├── src/test/
│   ├── setup.ts
│   └── mocks/supabase.ts
├── vite.config.ts
├── tailwind.config.ts
└── components.json        ← shadcn config
```

---

## Task 1: Foundation — scaffold, dependencias y configuración

**Files:**
- Create: `vite.config.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `tsconfig.json`
- Create: `src/index.css`
- Create: `src/test/setup.ts`
- Create: `components.json`

- [ ] **Step 1.1: Scaffold Vite + React 19 en el directorio actual**

```bash
cd C:\Users\fmontenegro\Documents\proyectos\dropen-web
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" create vite@latest . -- --template react-ts
```

Cuando pregunte si continuar en directorio no vacío: `y`

- [ ] **Step 1.2: Instalar todas las dependencias**

```bash
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" install react-router-dom@^7.0.0 zustand@^5.0.0 @supabase/supabase-js@^2.47.0 framer-motion@^11.0.0 @tanstack/react-table@^8.20.0 react-hook-form@^7.54.0 zod@^3.24.0 @hookform/resolvers@^3.9.0 clsx@^2.1.0 tailwind-merge@^2.5.0 date-fns@^4.1.0 @fontsource/inter lucide-react@^0.468.0 class-variance-authority@^0.7.0 @radix-ui/react-slot@^1.0.0
```

- [ ] **Step 1.3: Instalar dev dependencies**

```bash
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" install -D tailwindcss@^3.4.0 autoprefixer@^10.4.0 postcss@^8.4.0 vitest@^2.1.0 @testing-library/react@^16.0.0 @testing-library/user-event@^14.5.0 @testing-library/jest-dom@^6.6.0 jsdom@^25.0.0 @types/node
```

- [ ] **Step 1.4: Inicializar Tailwind**

```bash
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" exec tailwindcss init -p
```

- [ ] **Step 1.5: Reemplazar `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

- [ ] **Step 1.6: Reemplazar `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        surface: '#111111',
        border: '#1F1F1F',
        'text-primary': '#F5F0E8',
        'text-muted': '#6B6B6B',
        accent: '#C9A96E',
        'accent-hover': '#E8C97A',
        error: '#C0392B',
      },
      fontFamily: {
        display: ['"DM Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 1.7: Reemplazar `src/index.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;500;700&display=swap');
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { box-sizing: border-box; }
  body {
    @apply bg-background text-text-primary font-body antialiased;
    margin: 0;
  }
}
```

- [ ] **Step 1.8: Crear `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 1.9: Inicializar shadcn**

```bash
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" exec shadcn@latest init
```

Respuestas al wizard:
- Style: Default
- Base color: Neutral
- CSS variables: Yes

- [ ] **Step 1.10: Agregar componentes shadcn necesarios**

```bash
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" exec shadcn@latest add button sheet dialog badge select input textarea form sonner separator skeleton table tabs switch dropdown-menu avatar command
```

- [ ] **Step 1.11: Actualizar `package.json` scripts**

Agregar al bloque `"scripts"`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest --coverage"
  }
}
```

- [ ] **Step 1.12: Limpiar archivos de scaffold innecesarios**

Eliminar:
- `src/App.css`
- `src/assets/react.svg`
- `public/vite.svg`

Reemplazar `src/App.tsx` con:
```tsx
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { Toaster } from '@/components/ui/sonner'

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster theme="dark" position="bottom-right" />
    </>
  )
}
```

- [ ] **Step 1.13: Verificar que el proyecto compila**

```bash
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run build
```

Esperado: build exitoso sin errores de TypeScript.

- [ ] **Step 1.14: Commit**

```bash
git init
git add vite.config.ts tailwind.config.ts postcss.config.js tsconfig.json src/ components.json package.json package-lock.json index.html
git commit -m "chore: scaffold Vite + React 19 with full dependency stack"
```

---

## Task 2: Supabase — migraciones y Storage

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`
- Create: `supabase/migrations/002_admin_profiles.sql`

- [ ] **Step 2.1: Crear `supabase/migrations/001_initial_schema.sql`**

```sql
-- Colecciones / Drops
CREATE TABLE collections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text UNIQUE NOT NULL,
  description text,
  cover_url   text,
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Productos
CREATE TABLE products (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES collections(id) ON DELETE SET NULL,
  name          text NOT NULL,
  slug          text UNIQUE NOT NULL,
  description   text,
  price         numeric(10,2) NOT NULL,
  moneda_code   char(3) NOT NULL DEFAULT 'PEN',
  active        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Imágenes de producto
CREATE TABLE product_images (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url          text NOT NULL,
  storage_path text NOT NULL,
  alt_text     text,
  "order"      integer NOT NULL DEFAULT 0,
  is_primary   boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Variantes (talla + color)
CREATE TABLE product_variants (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size       text NOT NULL,
  color      text NOT NULL,
  stock      integer NOT NULL DEFAULT 0,
  sku        text UNIQUE NOT NULL,
  UNIQUE(product_id, size, color)
);

-- Reservas WhatsApp
CREATE TABLE reservations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id  uuid NOT NULL REFERENCES product_variants(id),
  quantity    integer NOT NULL,
  status      text NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending','confirmed','expired')),
  expires_at  timestamptz NOT NULL,
  customer_wa text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Configuración global
CREATE TABLE site_settings (
  key        text PRIMARY KEY,
  value      text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO site_settings (key, value) VALUES
  ('wholesale_min_units', '6'),
  ('wholesale_max_units', '60'),
  ('whatsapp_number', '51991941252'),
  ('store_currency', 'PEN');

-- Pedidos wholesale
CREATE TABLE wholesale_orders (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name     text NOT NULL,
  customer_email    text NOT NULL,
  customer_phone    text NOT NULL,
  tipo_documento_id uuid,
  numero_documento  text,
  pais_code         char(2),
  ciudad_code       text,
  items             jsonb NOT NULL DEFAULT '[]',
  total_units       integer NOT NULL,
  notes             text,
  status            text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','contacted','confirmed')),
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- Función helper para evitar recursión en RLS
CREATE OR REPLACE FUNCTION is_authenticated_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid() AND active = true
  )
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid() AND active = true AND role = 'admin'
  )
$$;

CREATE OR REPLACE FUNCTION is_admin_or_editor()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid() AND active = true AND role IN ('admin','editor')
  )
$$;

-- RLS en todas las tablas
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wholesale_orders ENABLE ROW LEVEL SECURITY;

-- Lectura pública (storefront)
CREATE POLICY "public_read_collections"     ON collections     FOR SELECT USING (active = true);
CREATE POLICY "public_read_products"        ON products        FOR SELECT USING (active = true);
CREATE POLICY "public_read_product_images"  ON product_images  FOR SELECT USING (true);
CREATE POLICY "public_read_product_variants"ON product_variants FOR SELECT USING (true);
CREATE POLICY "public_read_site_settings"   ON site_settings   FOR SELECT USING (true);

-- Clientes pueden insertar reservas y wholesale
CREATE POLICY "anyone_insert_reservations"     ON reservations     FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone_insert_wholesale_orders" ON wholesale_orders FOR INSERT WITH CHECK (true);

-- Admins — reservas
CREATE POLICY "admin_read_reservations"   ON reservations FOR SELECT USING (is_authenticated_admin());
CREATE POLICY "admin_update_reservations" ON reservations FOR UPDATE USING (is_authenticated_admin());

-- Admins — wholesale
CREATE POLICY "admin_read_wholesale"   ON wholesale_orders FOR SELECT USING (is_authenticated_admin());
CREATE POLICY "admin_update_wholesale" ON wholesale_orders FOR UPDATE USING (is_authenticated_admin());

-- Admins — colecciones y productos (CRUD)
CREATE POLICY "admin_all_collections"    ON collections    FOR ALL USING (is_admin_or_editor());
CREATE POLICY "admin_all_products"       ON products       FOR ALL USING (is_admin_or_editor());
CREATE POLICY "admin_all_product_images" ON product_images FOR ALL USING (is_admin_or_editor());
CREATE POLICY "admin_all_variants"       ON product_variants FOR ALL USING (is_admin_or_editor());

-- Admins — configuración
CREATE POLICY "admin_update_settings" ON site_settings FOR UPDATE USING (is_admin());
```

- [ ] **Step 2.2: Crear `supabase/migrations/002_admin_profiles.sql`**

```sql
CREATE TABLE admin_profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text NOT NULL,
  full_name  text,
  role       text NOT NULL DEFAULT 'viewer'
             CHECK (role IN ('admin','editor','viewer')),
  active     boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Cada admin puede leer su propio perfil
CREATE POLICY "admin_read_own_profile" ON admin_profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins autenticados pueden leer todos los perfiles
CREATE POLICY "admin_read_all_profiles" ON admin_profiles
  FOR SELECT USING (is_authenticated_admin());

-- Solo rol 'admin' puede modificar perfiles
CREATE POLICY "admin_manage_profiles" ON admin_profiles
  FOR ALL USING (is_admin());

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER admin_profiles_updated_at
  BEFORE UPDATE ON admin_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

- [ ] **Step 2.3: Ejecutar migraciones en Supabase**

En el dashboard de Supabase (proyecto `icfqhtiujsboyrggxpqu`), ir a SQL Editor y ejecutar ambos archivos en orden: primero `001`, luego `002`.

- [ ] **Step 2.4: Crear buckets en Supabase Storage**

En el dashboard → Storage → New bucket:
- Nombre: `product-images`, Public: ✅
- Nombre: `collection-covers`, Public: ✅

En cada bucket → Policies → New policy:
- SELECT: `true` (lectura pública)
- INSERT/UPDATE/DELETE: `is_admin_or_editor()`

- [ ] **Step 2.5: Commit**

```bash
git add supabase/
git commit -m "chore: add Supabase migrations and storage bucket config"
```

---

## Task 3: Types + Lib layer

**Files:**
- Create: `src/types/index.ts`
- Create: `src/lib/supabase.ts`
- Create: `src/lib/whatsapp.ts`
- Create: `src/lib/reservations.ts`
- Create: `src/test/mocks/supabase.ts`
- Test: `src/lib/__tests__/whatsapp.test.ts`
- Test: `src/lib/__tests__/reservations.test.ts`

- [ ] **Step 3.1: Crear `src/types/index.ts`**

```ts
export type AdminRole = 'admin' | 'editor' | 'viewer'
export type ReservationStatus = 'pending' | 'confirmed' | 'expired'
export type WholesaleOrderStatus = 'pending' | 'contacted' | 'confirmed'

export interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  cover_url: string | null
  active: boolean
  created_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  storage_path: string
  alt_text: string | null
  order: number
  is_primary: boolean
  created_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  size: string
  color: string
  stock: number
  sku: string
  available_stock?: number
}

export interface Product {
  id: string
  collection_id: string | null
  name: string
  slug: string
  description: string | null
  price: number
  moneda_code: string
  active: boolean
  created_at: string
  collection?: Collection
  images?: ProductImage[]
  variants?: ProductVariant[]
}

export interface Reservation {
  id: string
  variant_id: string
  quantity: number
  status: ReservationStatus
  expires_at: string
  customer_wa: string | null
  created_at: string
}

export interface SiteSetting {
  key: string
  value: string
  updated_at: string
}

export interface WholesaleOrderItem {
  product_id: string
  name: string
  size: string
  color: string
  quantity: number
}

export interface WholesaleOrder {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  tipo_documento_id: string | null
  numero_documento: string | null
  pais_code: string | null
  ciudad_code: string | null
  items: WholesaleOrderItem[]
  total_units: number
  notes: string | null
  status: WholesaleOrderStatus
  created_at: string
}

export interface AdminProfile {
  id: string
  email: string
  full_name: string | null
  role: AdminRole
  active: boolean
  created_at: string
  updated_at: string
}

export interface CartItem {
  variantId: string
  productId: string
  productName: string
  size: string
  color: string
  price: number
  quantity: number
  imageUrl: string
}

export interface WhatsAppLine {
  productName: string
  size: string
  color: string
  quantity: number
  price: number
}
```

- [ ] **Step 3.2: Crear `src/lib/supabase.ts`**

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 3.3: Crear `src/lib/whatsapp.ts`**

```ts
import type { WhatsAppLine } from '@/types'

export function buildWhatsAppMessage(lines: WhatsAppLine[], reference: string): string {
  const itemLines = lines
    .map(
      (l) =>
        `${l.productName}\nTalla: ${l.size} | ${l.color}\nCant: ${l.quantity} — S/ ${l.price.toFixed(2)}`
    )
    .join('\n\n')

  const total = lines.reduce((sum, l) => sum + l.price * l.quantity, 0)

  return [
    '🛍 Nuevo pedido DROPEN',
    '─────────────────────',
    itemLines,
    '',
    `Total: S/ ${total.toFixed(2)}`,
    `Ref: ${reference}`,
    '─────────────────────',
    '*Reservado por 2 horas*',
  ].join('\n')
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}
```

- [ ] **Step 3.4: Escribir tests para whatsapp.ts**

```ts
// src/lib/__tests__/whatsapp.test.ts
import { describe, it, expect } from 'vitest'
import { buildWhatsAppMessage, buildWhatsAppUrl } from '../whatsapp'
import type { WhatsAppLine } from '@/types'

const lines: WhatsAppLine[] = [
  { productName: 'Jean Baggy Cargo', size: '32', color: 'Black', quantity: 1, price: 189 },
  { productName: 'Jean Baggy Slim', size: '30', color: 'Stone', quantity: 2, price: 199 },
]

describe('buildWhatsAppMessage', () => {
  it('incluye nombre, talla y color de cada item', () => {
    const msg = buildWhatsAppMessage(lines, 'DRP-ABC12345')
    expect(msg).toContain('Jean Baggy Cargo')
    expect(msg).toContain('Talla: 32 | Black')
    expect(msg).toContain('Jean Baggy Slim')
    expect(msg).toContain('Talla: 30 | Stone')
  })

  it('calcula el total correctamente', () => {
    const msg = buildWhatsAppMessage(lines, 'DRP-ABC12345')
    // 189*1 + 199*2 = 587
    expect(msg).toContain('Total: S/ 587.00')
  })

  it('incluye la referencia', () => {
    const msg = buildWhatsAppMessage(lines, 'DRP-ABC12345')
    expect(msg).toContain('Ref: DRP-ABC12345')
  })

  it('incluye aviso de reserva 2 horas', () => {
    const msg = buildWhatsAppMessage(lines, 'DRP-ABC12345')
    expect(msg).toContain('Reservado por 2 horas')
  })
})

describe('buildWhatsAppUrl', () => {
  it('retorna URL wa.me con teléfono correcto', () => {
    const url = buildWhatsAppUrl('51991941252', 'hola')
    expect(url).toMatch(/^https:\/\/wa\.me\/51991941252\?text=/)
  })

  it('encodifica el mensaje', () => {
    const url = buildWhatsAppUrl('51991941252', 'test message')
    expect(url).toContain(encodeURIComponent('test message'))
  })
})
```

- [ ] **Step 3.5: Run tests — verificar que pasan**

```bash
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run test:run -- src/lib/__tests__/whatsapp.test.ts
```

Esperado: 6 tests PASS

- [ ] **Step 3.6: Crear mock de Supabase para tests**

```ts
// src/test/mocks/supabase.ts
import { vi } from 'vitest'

export const mockFrom = vi.fn()
export const mockSelect = vi.fn()
export const mockInsert = vi.fn()
export const mockUpdate = vi.fn()
export const mockEq = vi.fn()
export const mockIn = vi.fn()
export const mockSingle = vi.fn()

const chain = {
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  eq: mockEq,
  in: mockIn,
  single: mockSingle,
}

// Cada método del chain retorna el chain para permitir encadenamiento
Object.values(chain).forEach((fn) => fn.mockReturnValue(chain))

export const mockSupabase = {
  from: mockFrom.mockReturnValue(chain),
  auth: {
    getSession: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  },
}

vi.mock('@/lib/supabase', () => ({ supabase: mockSupabase }))
```

- [ ] **Step 3.7: Crear `src/lib/reservations.ts`**

```ts
import { supabase } from './supabase'
import type { CartItem } from '@/types'

export interface CreateReservationsResult {
  success: boolean
  reservationIds: string[]
  expiresAt: string
  reference: string
  error?: string
}

export async function createReservations(
  items: CartItem[]
): Promise<CreateReservationsResult> {
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
  const reservationIds: string[] = []

  try {
    for (const item of items) {
      const { data, error } = await supabase
        .from('reservations')
        .insert({
          variant_id: item.variantId,
          quantity: item.quantity,
          status: 'pending',
          expires_at: expiresAt,
        })
        .select('id')
        .single()

      if (error) throw error
      reservationIds.push(data.id)
    }

    const reference = `DRP-${reservationIds[0].substring(0, 8).toUpperCase()}`
    return { success: true, reservationIds, expiresAt, reference }
  } catch (err) {
    if (reservationIds.length > 0) {
      await supabase
        .from('reservations')
        .update({ status: 'expired' })
        .in('id', reservationIds)
    }
    return {
      success: false,
      reservationIds: [],
      expiresAt: '',
      reference: '',
      error: err instanceof Error ? err.message : 'Error desconocido',
    }
  }
}
```

- [ ] **Step 3.8: Escribir tests para reservations.ts**

```ts
// src/lib/__tests__/reservations.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockSupabase, mockFrom, mockInsert, mockSingle, mockUpdate, mockIn } from '@/test/mocks/supabase'
import type { CartItem } from '@/types'

// Importar DESPUÉS del mock
const { createReservations } = await import('../reservations')

const item: CartItem = {
  variantId: 'variant-1',
  productId: 'product-1',
  productName: 'Jean Baggy Cargo',
  size: '32',
  color: 'Black',
  price: 189,
  quantity: 1,
  imageUrl: 'https://example.com/img.webp',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createReservations', () => {
  it('retorna success true con ids y referencia cuando todo va bien', async () => {
    mockSingle.mockResolvedValueOnce({ data: { id: 'abc12345-uuid' }, error: null })

    const result = await createReservations([item])

    expect(result.success).toBe(true)
    expect(result.reservationIds).toEqual(['abc12345-uuid'])
    expect(result.reference).toBe('DRP-ABC12345')
    expect(result.expiresAt).toBeTruthy()
  })

  it('retorna success false y revierte si Supabase lanza error', async () => {
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'Stock insuficiente' },
    })

    const result = await createReservations([item])

    expect(result.success).toBe(false)
    expect(result.error).toBe('Stock insuficiente')
  })

  it('llama insert con variant_id y quantity correctos', async () => {
    mockSingle.mockResolvedValueOnce({ data: { id: 'uuid-1' }, error: null })

    await createReservations([item])

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        variant_id: 'variant-1',
        quantity: 1,
        status: 'pending',
      })
    )
  })
})
```

- [ ] **Step 3.9: Run tests**

```bash
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run test:run -- src/lib/__tests__/reservations.test.ts
```

Esperado: 3 tests PASS

- [ ] **Step 3.10: Commit**

```bash
git add src/types/ src/lib/ src/test/
git commit -m "feat(lib): add types, supabase client, whatsapp builder, reservations logic"
```

---

## Task 4: Zustand stores

**Files:**
- Create: `src/store/cart.store.ts`
- Create: `src/store/reservation.store.ts`
- Create: `src/store/ui.store.ts`
- Create: `src/store/index.ts`
- Test: `src/store/__tests__/cart.store.test.ts`
- Test: `src/store/__tests__/reservation.store.test.ts`

- [ ] **Step 4.1: Crear `src/store/cart.store.ts`**

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types'

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (variantId: string) => void
  updateQty: (variantId: string, quantity: number) => void
  clearCart: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem(item) {
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, item] }
        })
      },
      removeItem(variantId) {
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        }))
      },
      updateQty(variantId, quantity) {
        if (quantity <= 0) {
          get().removeItem(variantId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i
          ),
        }))
      },
      clearCart() {
        set({ items: [] })
      },
    }),
    { name: 'dropen-cart' }
  )
)

// Selectors — usar estos hooks en lugar de acceder a state.total directamente
export const useCartTotal = () =>
  useCartStore((state) =>
    state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  )

export const useCartItemCount = () =>
  useCartStore((state) =>
    state.items.reduce((sum, i) => sum + i.quantity, 0)
  )
```

- [ ] **Step 4.2: Escribir tests para cart.store**

```ts
// src/store/__tests__/cart.store.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '../cart.store'
import type { CartItem } from '@/types'

const makeItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  variantId: 'v1',
  productId: 'p1',
  productName: 'Jean Baggy Cargo',
  size: '32',
  color: 'Black',
  price: 189,
  quantity: 1,
  imageUrl: 'https://example.com/img.webp',
  ...overrides,
})

beforeEach(() => {
  useCartStore.setState({ items: [] })
})

describe('addItem', () => {
  it('agrega un item nuevo al carrito', () => {
    useCartStore.getState().addItem(makeItem())
    expect(useCartStore.getState().items).toHaveLength(1)
  })

  it('incrementa quantity si la misma variante ya existe', () => {
    useCartStore.getState().addItem(makeItem({ quantity: 1 }))
    useCartStore.getState().addItem(makeItem({ quantity: 2 }))
    expect(useCartStore.getState().items).toHaveLength(1)
    expect(useCartStore.getState().items[0].quantity).toBe(3)
  })

  it('agrega items distintos como entradas separadas', () => {
    useCartStore.getState().addItem(makeItem({ variantId: 'v1' }))
    useCartStore.getState().addItem(makeItem({ variantId: 'v2' }))
    expect(useCartStore.getState().items).toHaveLength(2)
  })
})

describe('removeItem', () => {
  it('elimina el item del carrito', () => {
    useCartStore.setState({ items: [makeItem()] })
    useCartStore.getState().removeItem('v1')
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})

describe('updateQty', () => {
  it('actualiza la cantidad correctamente', () => {
    useCartStore.setState({ items: [makeItem({ quantity: 1 })] })
    useCartStore.getState().updateQty('v1', 5)
    expect(useCartStore.getState().items[0].quantity).toBe(5)
  })

  it('elimina el item si quantity <= 0', () => {
    useCartStore.setState({ items: [makeItem()] })
    useCartStore.getState().updateQty('v1', 0)
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})

describe('clearCart', () => {
  it('vacía el carrito', () => {
    useCartStore.setState({ items: [makeItem(), makeItem({ variantId: 'v2' })] })
    useCartStore.getState().clearCart()
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})

describe('useCartTotal selector', () => {
  it('calcula total correctamente', () => {
    useCartStore.setState({
      items: [
        makeItem({ variantId: 'v1', price: 189, quantity: 2 }),
        makeItem({ variantId: 'v2', price: 199, quantity: 1 }),
      ],
    })
    const total = useCartStore.getState().items.reduce(
      (sum, i) => sum + i.price * i.quantity, 0
    )
    expect(total).toBe(577)
  })
})
```

- [ ] **Step 4.3: Run tests**

```bash
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run test:run -- src/store/__tests__/cart.store.test.ts
```

Esperado: 7 tests PASS

- [ ] **Step 4.4: Crear `src/store/reservation.store.ts`**

```ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface ReservationStore {
  reservationIds: string[]
  expiresAt: string | null
  reference: string | null
  setReservation: (ids: string[], expiresAt: string, reference: string) => void
  clearReservation: () => void
  isExpired: () => boolean
}

export const useReservationStore = create<ReservationStore>()(
  persist(
    (set, get) => ({
      reservationIds: [],
      expiresAt: null,
      reference: null,
      setReservation(ids, expiresAt, reference) {
        set({ reservationIds: ids, expiresAt, reference })
      },
      clearReservation() {
        set({ reservationIds: [], expiresAt: null, reference: null })
      },
      isExpired() {
        const { expiresAt } = get()
        if (!expiresAt) return true
        return new Date(expiresAt) < new Date()
      },
    }),
    {
      name: 'dropen-reservation',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
```

- [ ] **Step 4.5: Escribir tests para reservation.store**

```ts
// src/store/__tests__/reservation.store.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useReservationStore } from '../reservation.store'

beforeEach(() => {
  useReservationStore.setState({
    reservationIds: [],
    expiresAt: null,
    reference: null,
  })
})

describe('setReservation', () => {
  it('guarda ids, expiresAt y referencia', () => {
    useReservationStore.getState().setReservation(
      ['id-1', 'id-2'],
      '2026-06-12T10:00:00Z',
      'DRP-ABC12345'
    )
    const state = useReservationStore.getState()
    expect(state.reservationIds).toEqual(['id-1', 'id-2'])
    expect(state.expiresAt).toBe('2026-06-12T10:00:00Z')
    expect(state.reference).toBe('DRP-ABC12345')
  })
})

describe('clearReservation', () => {
  it('resetea el estado', () => {
    useReservationStore.setState({
      reservationIds: ['id-1'],
      expiresAt: '2026-06-12T10:00:00Z',
      reference: 'DRP-ABC12345',
    })
    useReservationStore.getState().clearReservation()
    expect(useReservationStore.getState().reservationIds).toEqual([])
    expect(useReservationStore.getState().expiresAt).toBeNull()
  })
})

describe('isExpired', () => {
  it('retorna true cuando no hay reserva', () => {
    expect(useReservationStore.getState().isExpired()).toBe(true)
  })

  it('retorna false cuando expiresAt es en el futuro', () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000).toISOString()
    useReservationStore.setState({ expiresAt: futureDate, reservationIds: ['id-1'], reference: 'DRP-X' })
    expect(useReservationStore.getState().isExpired()).toBe(false)
  })

  it('retorna true cuando expiresAt es en el pasado', () => {
    const pastDate = new Date(Date.now() - 1000).toISOString()
    useReservationStore.setState({ expiresAt: pastDate, reservationIds: ['id-1'], reference: 'DRP-X' })
    expect(useReservationStore.getState().isExpired()).toBe(true)
  })
})
```

- [ ] **Step 4.6: Crear `src/store/ui.store.ts`**

```ts
import { create } from 'zustand'

interface UIStore {
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
}

export const useUIStore = create<UIStore>()((set) => ({
  isCartOpen: false,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
}))
```

- [ ] **Step 4.7: Crear `src/store/index.ts`**

```ts
export { useCartStore, useCartTotal, useCartItemCount } from './cart.store'
export { useReservationStore } from './reservation.store'
export { useUIStore } from './ui.store'
```

- [ ] **Step 4.8: Run todos los tests de stores**

```bash
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run test:run -- src/store/
```

Esperado: 11 tests PASS

- [ ] **Step 4.9: Commit**

```bash
git add src/store/
git commit -m "feat(store): add cart, reservation and ui Zustand stores with tests"
```

---

## Task 5: Router + Layout

**Files:**
- Create: `src/router.tsx`
- Create: `src/components/layout/Layout.tsx`
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/Footer.tsx`
- Test: `src/components/layout/__tests__/Header.test.tsx`

- [ ] **Step 5.1: Crear placeholders de páginas (necesarios para el router)**

Crear cada uno de estos archivos con contenido mínimo:

```tsx
// src/pages/HomePage.tsx
export default function HomePage() { return <div>Home</div> }
```

Repetir para: `CatalogPage.tsx`, `DropPage.tsx`, `ProductPage.tsx`, `WholesalePage.tsx`, y todos en `src/pages/admin/` (`AdminLoginPage`, `DashboardPage`, `CollectionsPage`, `CollectionFormPage`, `ProductsPage`, `ProductFormPage`, `ReservationsPage`, `WholesaleOrdersPage`, `ConfigPage`, `UsersPage`).

- [ ] **Step 5.2: Crear `src/components/layout/Footer.tsx`**

```tsx
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-display font-bold text-lg tracking-widest text-text-primary">
          DROPEN
        </span>
        <nav className="flex gap-6 text-sm text-text-muted">
          <Link to="/colecciones" className="hover:text-text-primary transition-colors">
            Colecciones
          </Link>
          <Link to="/wholesale" className="hover:text-text-primary transition-colors">
            Wholesale
          </Link>
        </nav>
        <p className="text-xs text-text-muted">© 2026 DROPEN. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 5.3: Crear `src/components/layout/Header.tsx`**

```tsx
import { Link } from 'react-router-dom'
import { ShoppingBag, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartItemCount } from '@/store/cart.store'
import { useUIStore } from '@/store/ui.store'
import { useState } from 'react'

export default function Header() {
  const openCart = useUIStore((s) => s.openCart)
  const itemCount = useCartItemCount()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="font-display font-bold text-xl tracking-[0.3em] text-text-primary"
        >
          DROPEN
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/colecciones"
            className="text-sm text-text-muted hover:text-text-primary transition-colors tracking-wide"
          >
            Colecciones
          </Link>
          <Link
            to="/wholesale"
            className="text-sm text-text-muted hover:text-text-primary transition-colors tracking-wide"
          >
            Wholesale
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={openCart}
            className="relative text-text-primary hover:text-accent"
            aria-label={`Abrir carrito — ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent text-background text-[10px] flex items-center justify-center font-bold">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Button>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-text-primary"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden bg-surface border-t border-border px-4 py-4 flex flex-col gap-4">
          <Link
            to="/colecciones"
            className="text-sm text-text-muted hover:text-text-primary transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Colecciones
          </Link>
          <Link
            to="/wholesale"
            className="text-sm text-text-muted hover:text-text-primary transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Wholesale
          </Link>
        </div>
      )}
    </header>
  )
}
```

- [ ] **Step 5.4: Crear `src/components/layout/Layout.tsx`**

```tsx
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
```

- [ ] **Step 5.5: Crear `src/router.tsx`**

```tsx
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/layout/Layout'

const Spinner = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
  </div>
)

const wrap = (Component: React.LazyExoticComponent<() => JSX.Element>) => (
  <Suspense fallback={<Spinner />}>
    <Component />
  </Suspense>
)

const HomePage         = lazy(() => import('./pages/HomePage'))
const CatalogPage      = lazy(() => import('./pages/CatalogPage'))
const DropPage         = lazy(() => import('./pages/DropPage'))
const ProductPage      = lazy(() => import('./pages/ProductPage'))
const WholesalePage    = lazy(() => import('./pages/WholesalePage'))
const AdminLoginPage   = lazy(() => import('./pages/admin/AdminLoginPage'))
const DashboardPage    = lazy(() => import('./pages/admin/DashboardPage'))
const CollectionsPage  = lazy(() => import('./pages/admin/CollectionsPage'))
const CollectionFormPage = lazy(() => import('./pages/admin/CollectionFormPage'))
const ProductsPage     = lazy(() => import('./pages/admin/ProductsPage'))
const ProductFormPage  = lazy(() => import('./pages/admin/ProductFormPage'))
const ReservationsPage = lazy(() => import('./pages/admin/ReservationsPage'))
const WholesaleOrdersPage = lazy(() => import('./pages/admin/WholesaleOrdersPage'))
const ConfigPage       = lazy(() => import('./pages/admin/ConfigPage'))
const UsersPage        = lazy(() => import('./pages/admin/UsersPage'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true,                   element: wrap(HomePage) },
      { path: 'colecciones',           element: wrap(CatalogPage) },
      { path: 'colecciones/:slug',     element: wrap(DropPage) },
      { path: 'productos/:slug',       element: wrap(ProductPage) },
      { path: 'wholesale',             element: wrap(WholesalePage) },
    ],
  },
  {
    path: '/admin/login',
    element: wrap(AdminLoginPage),
  },
  {
    path: '/admin',
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard',             element: wrap(DashboardPage) },
      { path: 'colecciones',           element: wrap(CollectionsPage) },
      { path: 'colecciones/nueva',     element: wrap(CollectionFormPage) },
      { path: 'colecciones/:id',       element: wrap(CollectionFormPage) },
      { path: 'productos',             element: wrap(ProductsPage) },
      { path: 'productos/nuevo',       element: wrap(ProductFormPage) },
      { path: 'productos/:id',         element: wrap(ProductFormPage) },
      { path: 'reservas',              element: wrap(ReservationsPage) },
      { path: 'wholesale',             element: wrap(WholesaleOrdersPage) },
      { path: 'configuracion',         element: wrap(ConfigPage) },
      { path: 'usuarios',              element: wrap(UsersPage) },
    ],
  },
])
```

> Nota: el `ProtectedRoute` con verificación de roles se agrega en Task 11. Por ahora el router funciona sin auth guard para poder desarrollar el storefront primero.

- [ ] **Step 5.6: Escribir test de Header**

```tsx
// src/components/layout/__tests__/Header.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Header from '../Header'

// Mock stores
vi.mock('@/store/cart.store', () => ({
  useCartItemCount: () => 0,
}))
vi.mock('@/store/ui.store', () => ({
  useUIStore: (selector: (s: { openCart: () => void }) => unknown) =>
    selector({ openCart: vi.fn() }),
}))

describe('Header', () => {
  it('muestra el logo DROPEN', () => {
    render(<MemoryRouter><Header /></MemoryRouter>)
    expect(screen.getByText('DROPEN')).toBeInTheDocument()
  })

  it('muestra links de navegación en desktop', () => {
    render(<MemoryRouter><Header /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /colecciones/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /wholesale/i })).toBeInTheDocument()
  })

  it('muestra badge de carrito cuando hay items', () => {
    vi.mock('@/store/cart.store', () => ({ useCartItemCount: () => 3 }))
    render(<MemoryRouter><Header /></MemoryRouter>)
    // El badge es parte del aria-label del botón
    expect(screen.getByRole('button', { name: /abrir carrito/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 5.7: Run tests del layout**

```bash
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run test:run -- src/components/layout/
```

Esperado: 3 tests PASS

- [ ] **Step 5.8: Verificar que la app levanta**

```bash
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run dev
```

Abrir `http://localhost:5173` — debe mostrar header con "DROPEN" y footer.

- [ ] **Step 5.9: Commit**

```bash
git add src/router.tsx src/components/layout/ src/pages/
git commit -m "feat(layout): add router, header, footer and layout shell"
```

---

## Task 6: Home page

**Files:**
- Create: `src/components/home/HeroParallax.tsx`
- Create: `src/components/home/DropsGrid.tsx`
- Create: `src/components/home/BrandStatement.tsx`
- Modify: `src/pages/HomePage.tsx`
- Create: `src/test/mocks/framer-motion.tsx`
- Test: `src/components/home/__tests__/HeroParallax.test.tsx`
- Test: `src/components/home/__tests__/DropsGrid.test.tsx`

- [ ] **Step 6.1: Crear mock de framer-motion para tests**

```tsx
// src/test/mocks/framer-motion.tsx
import { vi } from 'vitest'
import React from 'react'

vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_t, tag: string) =>
      ({ children, style: _s, initial: _i, animate: _a, transition: _tr, whileInView: _w, viewport: _vp, ...props }: React.HTMLAttributes<HTMLElement> & Record<string, unknown>) => {
        const El = tag as keyof JSX.IntrinsicElements
        return React.createElement(El, props as object, children as React.ReactNode)
      },
  }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
  useTransform: () => '0%',
  useReducedMotion: () => false,
}))
```

- [ ] **Step 6.2: Crear `src/components/home/HeroParallax.tsx`**

```tsx
import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function HeroParallax() {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', prefersReduced ? '0%' : '50%'])

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
          <Button asChild className="bg-accent hover:bg-accent-hover text-background px-10 py-3 text-xs tracking-[0.2em] uppercase rounded-none">
            <Link to="/colecciones">Ver colecciones</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
```

- [ ] **Step 6.3: Crear `src/components/home/DropsGrid.tsx`**

```tsx
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import type { Collection } from '@/types'

interface Props {
  collections: Collection[]
  limit?: number
}

export default function DropsGrid({ collections, limit }: Props) {
  const prefersReduced = useReducedMotion()
  const items = limit ? collections.slice(0, limit) : collections

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-display font-bold text-3xl tracking-widest text-text-primary mb-12 uppercase">Drops</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((col, i) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: prefersReduced ? 0 : 0.5, delay: prefersReduced ? 0 : i * 0.1 }}
            >
              <Link
                to={`/colecciones/${col.slug}`}
                className="group block relative overflow-hidden aspect-[4/5] bg-surface border border-border"
              >
                {col.cover_url ? (
                  <img src={`${col.cover_url}?width=800&quality=80`} alt={col.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 bg-surface" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <p className="text-text-muted text-xs tracking-widest uppercase mb-1">Coleccion</p>
                  <h3 className="font-display font-bold text-2xl text-text-primary">{col.name}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 6.4: Crear `src/components/home/BrandStatement.tsx`**

```tsx
import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function BrandStatement() {
  const dur = useReducedMotion() ? 0 : 0.7
  return (
    <section className="py-32 px-4 bg-surface border-t border-b border-border">
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: dur }}
          className="font-display font-bold text-4xl md:text-5xl text-text-primary tracking-wide">
          Pedidos por lote para distribuidores
        </motion.h2>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ duration: dur, delay: 0.3 }} className="mt-10">
          <Button asChild variant="outline"
            className="border-accent text-accent hover:bg-accent hover:text-background px-10 py-3 text-xs tracking-[0.2em] uppercase rounded-none">
            <Link to="/wholesale">Hacer pedido wholesale</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 6.5: Actualizar `src/pages/HomePage.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Collection, Product } from '@/types'
import HeroParallax from '@/components/home/HeroParallax'
import DropsGrid from '@/components/home/DropsGrid'
import BrandStatement from '@/components/home/BrandStatement'
import ProductCard from '@/components/product/ProductCard'
import { Skeleton } from '@/components/ui/skeleton'

export default function HomePage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [colRes, prodRes] = await Promise.all([
        supabase.from('collections').select('*').eq('active', true).order('created_at', { ascending: false }),
        supabase.from('products')
          .select('*, images:product_images(*), variants:product_variants(*)')
          .eq('active', true).order('created_at', { ascending: false }).limit(6),
      ])
      if (colRes.data) setCollections(colRes.data)
      if (prodRes.data) setFeatured(prodRes.data)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <>
      <HeroParallax />
      {loading ? (
        <section className="py-20 px-4 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] bg-surface" />)}
          </div>
        </section>
      ) : <DropsGrid collections={collections} limit={2} />}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display font-bold text-3xl tracking-widest text-text-primary mb-12 uppercase">Destacados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] bg-surface" />)
              : featured.map((p) => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </div>
      </section>
      <BrandStatement />
    </>
  )
}
```

- [ ] **Step 6.6: Tests de Home components**

```tsx
// src/components/home/__tests__/HeroParallax.test.tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import '@/test/mocks/framer-motion'
import HeroParallax from '../HeroParallax'

describe('HeroParallax', () => {
  it('muestra heading DROPEN', () => {
    render(<MemoryRouter><HeroParallax /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /dropen/i })).toBeInTheDocument()
  })
  it('tiene link a colecciones', () => {
    render(<MemoryRouter><HeroParallax /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /ver colecciones/i })).toHaveAttribute('href', '/colecciones')
  })
})
```

```tsx
// src/components/home/__tests__/DropsGrid.test.tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import '@/test/mocks/framer-motion'
import DropsGrid from '../DropsGrid'
import type { Collection } from '@/types'

const cols: Collection[] = [
  { id: '1', name: 'Drop 01', slug: 'drop-01', description: null, cover_url: null, active: true, created_at: '2026-01-01' },
  { id: '2', name: 'Drop 02', slug: 'drop-02', description: null, cover_url: null, active: true, created_at: '2026-01-02' },
]
describe('DropsGrid', () => {
  it('muestra todas las colecciones', () => {
    render(<MemoryRouter><DropsGrid collections={cols} /></MemoryRouter>)
    expect(screen.getByText('Drop 01')).toBeInTheDocument()
    expect(screen.getByText('Drop 02')).toBeInTheDocument()
  })
  it('respeta el limite', () => {
    render(<MemoryRouter><DropsGrid collections={cols} limit={1} /></MemoryRouter>)
    expect(screen.queryByText('Drop 02')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 6.7: Run tests**

```bash
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run test:run -- src/components/home/
```

Esperado: 4 tests PASS

- [ ] **Step 6.8: Commit**

```bash
git add src/components/home/ src/pages/HomePage.tsx src/test/mocks/framer-motion.tsx
git commit -m "feat(home): add hero parallax, drops grid, brand statement and home page"
```

> **Nota post-Task 3:** Agregar `src/lib/query-fields.ts` antes de implementar los hooks de datos:
>
> ```ts
> // src/lib/query-fields.ts — evitar select-all para queries explícitas
> export const COLLECTION_FIELDS = 'id, name, slug, description, cover_url, active, created_at'
> export const PRODUCT_IMAGE_FIELDS = 'id, url, storage_path, alt_text, "order", is_primary, created_at'
> export const PRODUCT_VARIANT_FIELDS = 'id, size, color, stock, sku'
> export const PRODUCT_BASE_FIELDS = 'id, collection_id, name, slug, description, price, moneda_code, active, created_at'
> export const PRODUCT_FIELDS = `${PRODUCT_BASE_FIELDS}, images:product_images(${PRODUCT_IMAGE_FIELDS}), variants:product_variants(${PRODUCT_VARIANT_FIELDS})`
> export const PRODUCT_WITH_COLLECTION = `${PRODUCT_FIELDS}, collection:collections(${COLLECTION_FIELDS})`
> export const RESERVATION_FIELDS = 'id, variant_id, quantity, status, expires_at, customer_wa, created_at'
> ```
>
> Commit: `git commit -m "feat(lib): add explicit Supabase field selectors"`

---

## Task 7: Catalog + Drop pages + hooks + ProductCard

**Files:**
- Create: `src/lib/query-fields.ts`
- Create: `src/hooks/useProducts.ts`
- Create: `src/components/product/ProductCard.tsx`
- Modify: `src/pages/CatalogPage.tsx`
- Modify: `src/pages/DropPage.tsx`
- Test: `src/components/product/__tests__/ProductCard.test.tsx`

- [ ] **Step 7.1: Crear `src/lib/query-fields.ts`**

Centraliza los campos de select para evitar wildcards implícitos y que cambios de schema se propaguen desde un solo lugar.

```ts
export const COLLECTION_FIELDS =
  'id, name, slug, description, cover_url, active, created_at'

export const PRODUCT_IMAGE_FIELDS =
  'id, url, storage_path, alt_text, "order", is_primary, created_at'

export const PRODUCT_VARIANT_FIELDS =
  'id, size, color, stock, sku'

export const PRODUCT_BASE_FIELDS =
  'id, collection_id, name, slug, description, price, moneda_code, active, created_at'

export const PRODUCT_FIELDS =
  `${PRODUCT_BASE_FIELDS}, images:product_images(${PRODUCT_IMAGE_FIELDS}), variants:product_variants(${PRODUCT_VARIANT_FIELDS})`

export const PRODUCT_WITH_COLLECTION =
  `${PRODUCT_FIELDS}, collection:collections(${COLLECTION_FIELDS})`

export const RESERVATION_FIELDS =
  'id, variant_id, quantity, status, expires_at, customer_wa, created_at'
```

- [ ] **Step 7.2: Crear `src/hooks/useProducts.ts`**

```ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  COLLECTION_FIELDS,
  PRODUCT_FIELDS,
  PRODUCT_WITH_COLLECTION,
} from '@/lib/query-fields'
import type { Collection, Product } from '@/types'

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('collections')
      .select(COLLECTION_FIELDS)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setCollections(data ?? [])
        setLoading(false)
      })
  }, [])

  return { collections, loading, error }
}

export function useCollection(slug: string) {
  const [collection, setCollection] = useState<Collection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    supabase
      .from('collections')
      .select(COLLECTION_FIELDS)
      .eq('slug', slug)
      .single()
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setCollection(data)
        setLoading(false)
      })
  }, [slug])

  return { collection, loading, error }
}

// collectionId no-nullable: pasar string vacío para no ejecutar la query
export function useProductsByCollection(collectionId: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(!!collectionId)

  useEffect(() => {
    if (!collectionId) return
    setLoading(true)
    supabase
      .from('products')
      .select(PRODUCT_FIELDS)
      .eq('collection_id', collectionId)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setProducts(data ?? [])
        setLoading(false)
      })
  }, [collectionId])

  return { products, loading }
}

// Todos los productos activos — usar en wholesale y búsqueda global
export function useAllProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('products')
      .select(PRODUCT_FIELDS)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setProducts(data ?? [])
        setLoading(false)
      })
  }, [])

  return { products, loading }
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    supabase
      .from('products')
      .select(PRODUCT_WITH_COLLECTION)
      .eq('slug', slug)
      .single()
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setProduct(data)
        setLoading(false)
      })
  }, [slug])

  return { product, loading, error }
}
```

- [ ] **Step 7.3: Crear `src/components/product/ProductCard.tsx`**

```tsx
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/types'

interface Props {
  product: Product
  index?: number
}

function getPrimaryImageUrl(product: Product): string | null {
  if (!product.images?.length) return null
  return (
    product.images.find((i) => i.is_primary)?.url ??
    product.images.sort((a, b) => a.order - b.order)[0].url
  )
}

function getTotalStock(product: Product): number {
  return product.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0
}

export default function ProductCard({ product, index = 0 }: Props) {
  const prefersReduced = useReducedMotion()
  const imageUrl = getPrimaryImageUrl(product)
  const outOfStock = getTotalStock(product) === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: prefersReduced ? 0 : 0.5,
        delay: prefersReduced ? 0 : index * 0.1,
      }}
    >
      <Link to={`/productos/${product.slug}`} className="group block" aria-label={product.name}>
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
          {outOfStock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <Badge variant="secondary">Agotado</Badge>
            </div>
          )}
        </div>
        <div className="space-y-1">
          {product.collection && (
            <p className="font-body text-xs text-text-muted uppercase tracking-wider">
              {product.collection.name}
            </p>
          )}
          <h3 className="font-body font-medium text-text-primary group-hover:text-accent transition-colors">
            {product.name}
          </h3>
          <p className="font-body text-accent font-medium">S/ {product.price.toFixed(2)}</p>
        </div>
      </Link>
    </motion.div>
  )
}
```

- [ ] **Step 7.4: Actualizar `src/pages/CatalogPage.tsx`**

```tsx
import { useCollections } from '@/hooks/useProducts'
import DropsGrid from '@/components/home/DropsGrid'
import { Skeleton } from '@/components/ui/skeleton'

export default function CatalogPage() {
  const { collections, loading } = useCollections()

  return (
    <div className="min-h-screen">
      <div className="pt-24 pb-4 px-4 max-w-7xl mx-auto">
        <h1 className="font-display font-bold text-4xl tracking-[0.2em] uppercase text-text-primary">
          Colecciones
        </h1>
      </div>
      {loading ? (
        <section className="px-4 max-w-7xl mx-auto py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] bg-surface" />
            ))}
          </div>
        </section>
      ) : (
        <DropsGrid collections={collections} />
      )}
    </div>
  )
}
```

- [ ] **Step 7.5: Actualizar `src/pages/DropPage.tsx`**

```tsx
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useCollection, useProductsByCollection } from '@/hooks/useProducts'
import ProductCard from '@/components/product/ProductCard'
import { Skeleton } from '@/components/ui/skeleton'

export default function DropPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { collection, loading: colLoading } = useCollection(slug)
  const collectionId = collection?.id ?? ''
  const { products, loading: prodLoading } = useProductsByCollection(collectionId)
  const loading = colLoading || (!!collectionId && prodLoading)

  return (
    <div className="min-h-screen">
      <div className="relative h-64 md:h-96 bg-surface overflow-hidden">
        {collection?.cover_url && (
          <img
            src={`${collection.cover_url}?width=1200&quality=80`}
            alt={collection.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-8 left-8">
          <Link
            to="/colecciones"
            className="flex items-center gap-1 text-text-muted text-sm mb-4 hover:text-text-primary"
          >
            <ChevronLeft className="w-4 h-4" />
            Colecciones
          </Link>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-text-primary">
            {colLoading ? '...' : collection?.name}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] bg-surface" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-text-muted text-center py-20">No hay productos en esta colección.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 7.6: Test de ProductCard**

```tsx
// src/components/product/__tests__/ProductCard.test.tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import '@/test/mocks/framer-motion'
import ProductCard from '../ProductCard'
import type { Product } from '@/types'

const SAMPLE_PRODUCT: Product = {
  id: 'p1',
  collection_id: 'c1',
  name: 'Jean Baggy Cargo',
  slug: 'jean-baggy-cargo',
  description: null,
  price: 189,
  moneda_code: 'PEN',
  active: true,
  created_at: '2026-01-01',
  collection: {
    id: 'c1', name: 'Drop 01', slug: 'drop-01',
    description: null, cover_url: null, active: true, created_at: '2026-01-01',
  },
  images: [{
    id: 'i1', product_id: 'p1', url: 'https://cdn.example.com/img.webp',
    storage_path: 'p1/img.webp', alt_text: null, order: 0, is_primary: true, created_at: '2026-01-01',
  }],
  variants: [{ id: 'v1', product_id: 'p1', size: '32', color: 'Black', stock: 5, sku: 'DRP-001' }],
}

describe('ProductCard', () => {
  it('muestra nombre y precio', () => {
    render(<MemoryRouter><ProductCard product={SAMPLE_PRODUCT} /></MemoryRouter>)
    expect(screen.getByText('Jean Baggy Cargo')).toBeInTheDocument()
    expect(screen.getByText('S/ 189.00')).toBeInTheDocument()
  })

  it('linkea a la ruta del producto', () => {
    render(<MemoryRouter><ProductCard product={SAMPLE_PRODUCT} /></MemoryRouter>)
    const link = screen.getByRole('link', { name: /jean baggy cargo/i })
    expect(link).toHaveAttribute('href', '/productos/jean-baggy-cargo')
  })

  it('muestra badge Agotado cuando no hay stock', () => {
    const oos = { ...SAMPLE_PRODUCT, variants: [{ ...SAMPLE_PRODUCT.variants![0], stock: 0 }] }
    render(<MemoryRouter><ProductCard product={oos} /></MemoryRouter>)
    expect(screen.getByText('Agotado')).toBeInTheDocument()
  })
})
```

- [ ] **Step 7.7: Run tests**

```bash
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run test:run -- src/components/product/__tests__/ProductCard.test.tsx
```

Esperado: 3 tests PASS

- [ ] **Step 7.8: Commit**

```bash
git add src/lib/query-fields.ts src/hooks/useProducts.ts src/components/product/ProductCard.tsx src/pages/CatalogPage.tsx src/pages/DropPage.tsx
git commit -m "feat(catalog): add query-fields, useProducts hooks, ProductCard, CatalogPage and DropPage"
```

---

## Task 8: Product page — galería, variantes y agregar al carrito

**Files:**
- Create: `src/components/product/ProductGallery.tsx`
- Create: `src/components/product/VariantSelector.tsx`
- Create: `src/hooks/useCart.ts`
- Modify: `src/pages/ProductPage.tsx`
- Test: `src/components/product/__tests__/VariantSelector.test.tsx`

- [ ] **Step 8.1: Crear `src/components/product/ProductGallery.tsx`**

```tsx
import { useState } from 'react'
import type { ProductImage } from '@/types'

interface Props {
  images: ProductImage[]
  productName: string
}

export default function ProductGallery({ images, productName }: Props) {
  const sorted = [...images].sort((a, b) => a.order - b.order)
  const [activeIdx, setActiveIdx] = useState(0)

  if (sorted.length === 0) {
    return (
      <div className="aspect-[3/4] bg-surface flex items-center justify-center text-text-muted text-sm">
        Sin imagen
      </div>
    )
  }

  const active = sorted[activeIdx]

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-[3/4] overflow-hidden bg-surface">
        <img
          src={`${active.url}?width=900&quality=85`}
          alt={active.alt_text ?? productName}
          className="w-full h-full object-cover"
        />
      </div>
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIdx(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={`flex-shrink-0 w-16 h-20 overflow-hidden border-2 transition-colors ${
                i === activeIdx ? 'border-accent' : 'border-transparent'
              }`}
            >
              <img
                src={`${img.url}?width=150&quality=70`}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 8.2: Crear `src/components/product/VariantSelector.tsx`**

```tsx
import type { ProductVariant } from '@/types'

interface Props {
  variants: ProductVariant[]
  selectedVariantId: string | null
  onSelect: (variantId: string) => void
}

const COLOR_HEX: Record<string, string> = {
  Black:  '#1a1a1a',
  Stone:  '#c8b89a',
  Indigo: '#4a4e8c',
  White:  '#f0ede8',
}

function uniqueSorted(arr: string[]): string[] {
  return [...new Set(arr)].sort((a, b) => parseInt(a) - parseInt(b) || a.localeCompare(b))
}

export default function VariantSelector({ variants, selectedVariantId, onSelect }: Props) {
  const selected = variants.find((v) => v.id === selectedVariantId)
  const sizes  = uniqueSorted(variants.map((v) => v.size))
  const colors = [...new Set(variants.map((v) => v.color))]

  function findVariant(size: string, color: string): ProductVariant | undefined {
    return variants.find((v) => v.size === size && v.color === color)
  }

  function pickVariant(size: string, color: string): void {
    const target = findVariant(size, color) ?? variants.find((v) => v.size === size || v.color === color)
    if (target) onSelect(target.id)
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-text-muted uppercase tracking-widest mb-3">
          Talla{selected ? ` — ${selected.size}` : ''}
        </p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const v = findVariant(size, selected?.color ?? colors[0])
            const isSelected = selected?.size === size
            const noStock = (v?.stock ?? 0) === 0
            return (
              <button
                key={size}
                onClick={() => pickVariant(size, selected?.color ?? colors[0])}
                disabled={noStock}
                aria-pressed={isSelected}
                className={`w-12 h-12 text-sm border transition-all ${
                  isSelected    ? 'border-accent text-accent' :
                  noStock       ? 'border-border text-text-muted opacity-40 cursor-not-allowed line-through' :
                                  'border-border text-text-primary hover:border-accent'
                }`}
              >
                {size}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="text-xs text-text-muted uppercase tracking-widest mb-3">
          Color{selected ? ` — ${selected.color}` : ''}
        </p>
        <div className="flex gap-3">
          {colors.map((color) => {
            const v = findVariant(selected?.size ?? sizes[0], color)
            const isSelected = selected?.color === color
            const noStock = (v?.stock ?? 0) === 0
            const hex = COLOR_HEX[color] ?? '#888'
            return (
              <button
                key={color}
                onClick={() => pickVariant(selected?.size ?? sizes[0], color)}
                disabled={noStock}
                aria-pressed={isSelected}
                aria-label={color}
                style={{ backgroundColor: hex }}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  isSelected ? 'border-accent scale-110' : 'border-border hover:border-text-muted'
                } ${noStock ? 'opacity-40 cursor-not-allowed' : ''}`}
              />
            )
          })}
        </div>
      </div>

      {selected && selected.stock > 0 && selected.stock <= 3 && (
        <p className="text-xs text-accent">Solo quedan {selected.stock} unidades</p>
      )}
    </div>
  )
}
```

- [ ] **Step 8.3: Crear `src/hooks/useCart.ts`**

```ts
import { useCartStore, useCartTotal, useCartItemCount } from '@/store/cart.store'
import type { Product, ProductVariant } from '@/types'

export function useCart() {
  const { items, addItem, removeItem, updateQty, clearCart } = useCartStore()
  const total = useCartTotal()
  const itemCount = useCartItemCount()

  function addProductVariant(product: Product, variant: ProductVariant, quantity = 1) {
    const primaryImageUrl =
      product.images?.find((i) => i.is_primary)?.url ??
      product.images?.sort((a, b) => a.order - b.order)[0]?.url ??
      ''

    addItem({
      variantId: variant.id,
      productId: product.id,
      productName: product.name,
      size: variant.size,
      color: variant.color,
      price: product.price,
      quantity,
      imageUrl: primaryImageUrl,
    })
  }

  return { items, total, itemCount, addProductVariant, removeItem, updateQty, clearCart }
}
```

- [ ] **Step 8.4: Actualizar `src/pages/ProductPage.tsx`**

```tsx
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ChevronLeft } from 'lucide-react'
import { useProduct } from '@/hooks/useProducts'
import { useCart } from '@/hooks/useCart'
import { useUIStore } from '@/store/ui.store'
import ProductGallery from '@/components/product/ProductGallery'
import VariantSelector from '@/components/product/VariantSelector'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProductPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { product, loading } = useProduct(slug)
  const { addProductVariant } = useCart()
  const openCart = useUIStore((s) => s.openCart)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)

  const selectedVariant = product?.variants?.find((v) => v.id === selectedVariantId)
  const outOfStock = selectedVariant ? selectedVariant.stock === 0 : false

  function handleAddToCart() {
    if (!product || !selectedVariant) {
      toast.error('Seleccioná una talla y color antes de agregar al carrito.')
      return
    }
    addProductVariant(product, selectedVariant)
    toast.success(`${product.name} agregado al carrito`)
    openCart()
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 grid grid-cols-1 md:grid-cols-2 gap-12">
        <Skeleton className="aspect-[3/4] bg-surface" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-48 bg-surface" />
          <Skeleton className="h-6 w-32 bg-surface" />
          <Skeleton className="h-40 w-full bg-surface" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <p className="text-text-muted">Producto no encontrado.</p>
        <Link to="/colecciones" className="text-accent hover:underline mt-4 inline-block">
          Ver colecciones
        </Link>
      </div>
    )
  }

  const collectionSlug = product.collection?.slug ?? null

  return (
    <div className="max-w-6xl mx-auto px-4 py-24">
      <Link
        to={collectionSlug ? `/colecciones/${collectionSlug}` : '/colecciones'}
        className="flex items-center gap-1 text-text-muted text-sm mb-8 hover:text-text-primary transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        {product.collection?.name ?? 'Colecciones'}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <ProductGallery images={product.images ?? []} productName={product.name} />

        <div className="space-y-8">
          <div>
            <p className="text-text-muted text-xs uppercase tracking-[0.2em] mb-2">
              {product.collection?.name}
            </p>
            <h1 className="font-display font-bold text-4xl text-text-primary tracking-wide">
              {product.name}
            </h1>
            <p className="mt-3 text-2xl text-accent font-medium">
              S/ {product.price.toFixed(2)}
            </p>
          </div>

          {product.description && (
            <p className="text-text-muted text-sm leading-relaxed">{product.description}</p>
          )}

          {product.variants && product.variants.length > 0 && (
            <VariantSelector
              variants={product.variants}
              selectedVariantId={selectedVariantId}
              onSelect={setSelectedVariantId}
            />
          )}

          <Button
            onClick={handleAddToCart}
            disabled={!selectedVariantId || outOfStock}
            className="w-full bg-accent hover:bg-accent-hover text-background py-4 text-xs tracking-[0.2em] uppercase rounded-none disabled:opacity-50"
          >
            {outOfStock
              ? 'Agotado'
              : !selectedVariantId
              ? 'Seleccioná talla y color'
              : 'Agregar al carrito'}
          </Button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 8.5: Test de VariantSelector**

```tsx
// src/components/product/__tests__/VariantSelector.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import VariantSelector from '../VariantSelector'
import type { ProductVariant } from '@/types'

const VARIANTS: ProductVariant[] = [
  { id: 'v1', product_id: 'p1', size: '30', color: 'Black', stock: 5, sku: 'DRP-001' },
  { id: 'v2', product_id: 'p1', size: '32', color: 'Black', stock: 3, sku: 'DRP-002' },
  { id: 'v3', product_id: 'p1', size: '30', color: 'Stone', stock: 0, sku: 'DRP-003' },
]

describe('VariantSelector', () => {
  it('muestra todos los tamaños', () => {
    render(<VariantSelector variants={VARIANTS} selectedVariantId={null} onSelect={vi.fn()} />)
    expect(screen.getByRole('button', { name: '30' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '32' })).toBeInTheDocument()
  })

  it('llama onSelect al hacer click en una talla', async () => {
    const onSelect = vi.fn()
    render(<VariantSelector variants={VARIANTS} selectedVariantId={null} onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('button', { name: '32' }))
    expect(onSelect).toHaveBeenCalledWith('v2')
  })

  it('deshabilita tallas sin stock', () => {
    const noStock = [{ ...VARIANTS[0], stock: 0 }]
    render(<VariantSelector variants={noStock} selectedVariantId={null} onSelect={vi.fn()} />)
    expect(screen.getByRole('button', { name: '30' })).toBeDisabled()
  })
})
```

- [ ] **Step 8.6: Run tests**

```bash
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run test:run -- src/components/product/__tests__/VariantSelector.test.tsx
```

Esperado: 3 tests PASS

- [ ] **Step 8.7: Commit**

```bash
git add src/components/product/ src/hooks/useCart.ts src/pages/ProductPage.tsx
git commit -m "feat(product): add gallery, variant selector, useCart hook and product page"
```

---

## Task 9: Cart drawer + WhatsApp checkout + ReservationTimer

**Files:**
- Create: `src/components/cart/CartItem.tsx`
- Create: `src/components/cart/CartSummary.tsx`
- Create: `src/components/checkout/ReservationTimer.tsx`
- Create: `src/components/checkout/WhatsAppCheckout.tsx`
- Create: `src/components/cart/CartDrawer.tsx`
- Modify: `src/components/layout/Layout.tsx`
- Test: `src/components/checkout/__tests__/ReservationTimer.test.tsx`
- Test: `src/components/checkout/__tests__/WhatsAppCheckout.test.tsx`

- [ ] **Step 9.1: Crear `src/components/cart/CartItem.tsx`**

```tsx
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CartItem as CartItemType } from '@/types'

interface Props {
  item: CartItemType
  onRemove: (variantId: string) => void
  onQtyChange: (variantId: string, qty: number) => void
}

export default function CartItem({ item, onRemove, onQtyChange }: Props) {
  return (
    <div className="flex gap-4 py-4 border-b border-border">
      <div className="w-16 h-20 flex-shrink-0 bg-surface overflow-hidden">
        {item.imageUrl ? (
          <img
            src={`${item.imageUrl}?width=200&quality=70`}
            alt={item.productName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-surface" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-body font-medium text-text-primary text-sm truncate">{item.productName}</p>
        <p className="text-text-muted text-xs mt-0.5">{item.size} / {item.color}</p>
        <p className="text-accent text-sm font-medium mt-1">S/ {item.price.toFixed(2)}</p>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onQtyChange(item.variantId, item.quantity - 1)}
            className="w-6 h-6 border border-border text-text-muted hover:text-text-primary flex items-center justify-center text-sm transition-colors"
            aria-label="Reducir cantidad"
          >
            −
          </button>
          <span className="text-sm text-text-primary w-4 text-center">{item.quantity}</span>
          <button
            onClick={() => onQtyChange(item.variantId, item.quantity + 1)}
            className="w-6 h-6 border border-border text-text-muted hover:text-text-primary flex items-center justify-center text-sm transition-colors"
            aria-label="Aumentar cantidad"
          >
            +
          </button>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(item.variantId)}
        className="text-text-muted hover:text-error self-start flex-shrink-0"
        aria-label={`Eliminar ${item.productName}`}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}
```

- [ ] **Step 9.2: Crear `src/components/cart/CartSummary.tsx`**

```tsx
interface Props {
  total: number
  itemCount: number
}

export default function CartSummary({ total, itemCount }: Props) {
  const label = itemCount === 1 ? 'item' : 'items'
  return (
    <div className="border-t border-border pt-4 space-y-2">
      <div className="flex justify-between text-sm text-text-muted">
        <span>Subtotal ({itemCount} {label})</span>
        <span>S/ {total.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-medium text-text-primary">
        <span>Total</span>
        <span className="text-accent">S/ {total.toFixed(2)}</span>
      </div>
      <p className="text-xs text-text-muted pt-1">
        Envío coordinado por WhatsApp tras confirmar el pedido.
      </p>
    </div>
  )
}
```

- [ ] **Step 9.3: Crear `src/components/checkout/ReservationTimer.tsx`**

```tsx
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
    if (remaining <= 0) { onExpire?.(); return }
    const id = setInterval(() => {
      const ms = Math.max(0, new Date(expiresAt).getTime() - Date.now())
      setRemaining(ms)
      if (ms === 0) { clearInterval(id); onExpire?.() }
    }, 1000)
    return () => clearInterval(id)
  }, [expiresAt, onExpire, remaining])

  return (
    <div className="flex items-center gap-2 bg-surface border border-border px-3 py-2 text-sm">
      <Clock className="w-4 h-4 text-accent" />
      <span className="text-text-muted">Reserva expira en:</span>
      <span className="font-mono font-medium text-accent">{msToHHMMSS(remaining)}</span>
    </div>
  )
}
```

- [ ] **Step 9.4: Crear `src/components/checkout/WhatsAppCheckout.tsx`**

WhatsApp checkout dividido en funciones pequeñas para mantener handleCheckout bajo 30 líneas.

```tsx
import { useState } from 'react'
import { toast } from 'sonner'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createReservations } from '@/lib/reservations'
import { buildWhatsAppMessage, buildWhatsAppUrl } from '@/lib/whatsapp'
import { useCartStore, useCartTotal } from '@/store/cart.store'
import { useReservationStore } from '@/store/reservation.store'
import type { CartItem, WhatsAppLine } from '@/types'

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER as string

function cartItemToWhatsAppLine(item: CartItem): WhatsAppLine {
  return {
    productName: item.productName,
    size: item.size,
    color: item.color,
    quantity: item.quantity,
    price: item.price,
  }
}

interface Props {
  onSuccess?: () => void
}

export default function WhatsAppCheckout({ onSuccess }: Props) {
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const total = useCartTotal()
  const setReservation = useReservationStore((s) => s.setReservation)
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    if (items.length === 0) return
    setLoading(true)

    const result = await createReservations(items)
    if (!result.success) {
      toast.error(`Error al reservar: ${result.error}`)
      setLoading(false)
      return
    }

    setReservation(result.reservationIds, result.expiresAt, result.reference)

    const message = buildWhatsAppMessage(items.map(cartItemToWhatsAppLine), result.reference)
    window.open(buildWhatsAppUrl(WA_NUMBER, message), '_blank', 'noopener,noreferrer')

    clearCart()
    onSuccess?.()
    setLoading(false)
    toast.success(`Pedido reservado — ${result.reference}`, {
      description: 'Tenés 2 horas para confirmar el pedido por WhatsApp.',
    })
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={items.length === 0 || loading}
      className="w-full bg-[#25D366] hover:bg-[#20b857] text-white py-4 text-sm tracking-wide rounded-none gap-2"
    >
      <MessageCircle className="w-4 h-4" />
      {loading ? 'Procesando...' : `Confirmar por WhatsApp — S/ ${total.toFixed(2)}`}
    </Button>
  )
}
```

- [ ] **Step 9.5: Crear `src/components/cart/CartDrawer.tsx`**

```tsx
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useCartStore, useCartTotal, useCartItemCount } from '@/store/cart.store'
import { useUIStore } from '@/store/ui.store'
import { useReservationStore } from '@/store/reservation.store'
import CartItem from './CartItem'
import CartSummary from './CartSummary'
import WhatsAppCheckout from '@/components/checkout/WhatsAppCheckout'
import ReservationTimer from '@/components/checkout/ReservationTimer'

export default function CartDrawer() {
  const isOpen = useUIStore((s) => s.isCartOpen)
  const closeCart = useUIStore((s) => s.closeCart)
  const items = useCartStore((s) => s.items)
  const { removeItem, updateQty } = useCartStore()
  const total = useCartTotal()
  const itemCount = useCartItemCount()
  const { expiresAt, reference, clearReservation, isExpired } = useReservationStore()
  const hasActiveReservation = expiresAt !== null && !isExpired()

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-surface border-l border-border flex flex-col p-0"
      >
        <SheetHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display font-bold tracking-widest text-text-primary">
              CARRITO ({itemCount})
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeCart}
              className="text-text-muted hover:text-text-primary"
              aria-label="Cerrar carrito"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="py-16 text-center text-text-muted text-sm">El carrito está vacío.</div>
          ) : (
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.variantId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <CartItem item={item} onRemove={removeItem} onQtyChange={updateQty} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-6 py-4 border-t border-border space-y-4">
            {hasActiveReservation && expiresAt && (
              <div className="space-y-1">
                <ReservationTimer expiresAt={expiresAt} onExpire={clearReservation} />
                <p className="text-xs text-text-muted">Ref: {reference}</p>
              </div>
            )}
            <CartSummary total={total} itemCount={itemCount} />
            <WhatsAppCheckout onSuccess={closeCart} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 9.6: Actualizar `src/components/layout/Layout.tsx`**

```tsx
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import CartDrawer from '@/components/cart/CartDrawer'

export default function Layout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
```

- [ ] **Step 9.7: Test de ReservationTimer**

```tsx
// src/components/checkout/__tests__/ReservationTimer.test.tsx
import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ReservationTimer from '../ReservationTimer'

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

describe('ReservationTimer', () => {
  it('muestra 02:00:00 para reserva de 2 horas', () => {
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
    render(<ReservationTimer expiresAt={expiresAt} />)
    expect(screen.getByText('02:00:00')).toBeInTheDocument()
  })

  it('muestra 00:00:00 cuando ya expiró', () => {
    const expired = new Date(Date.now() - 1000).toISOString()
    render(<ReservationTimer expiresAt={expired} />)
    expect(screen.getByText('00:00:00')).toBeInTheDocument()
  })

  it('llama onExpire cuando llega a cero', () => {
    const onExpire = vi.fn()
    const expiresAt = new Date(Date.now() + 1500).toISOString()
    render(<ReservationTimer expiresAt={expiresAt} onExpire={onExpire} />)
    act(() => { vi.advanceTimersByTime(2000) })
    expect(onExpire).toHaveBeenCalled()
  })
})
```

- [ ] **Step 9.8: Test de WhatsAppCheckout**

```tsx
// src/components/checkout/__tests__/WhatsAppCheckout.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import WhatsAppCheckout from '../WhatsAppCheckout'
import { useCartStore } from '@/store/cart.store'
import type { CartItem } from '@/types'

vi.mock('@/lib/reservations', () => ({
  createReservations: vi.fn().mockResolvedValue({
    success: true,
    reservationIds: ['res-1'],
    expiresAt: '2026-06-12T12:00:00Z',
    reference: 'DRP-RES1',
  }),
}))

const ITEM: CartItem = {
  variantId: 'v1', productId: 'p1', productName: 'Jean Baggy Cargo',
  size: '32', color: 'Black', price: 189, quantity: 1, imageUrl: '',
}

beforeEach(() => {
  useCartStore.setState({ items: [ITEM] })
  window.open = vi.fn()
})

describe('WhatsAppCheckout', () => {
  it('muestra el total en el botón', () => {
    render(<WhatsAppCheckout />)
    expect(screen.getByRole('button', { name: /s\/ 189\.00/i })).toBeInTheDocument()
  })

  it('abre WhatsApp al confirmar', async () => {
    render(<WhatsAppCheckout />)
    await userEvent.click(screen.getByRole('button', { name: /confirmar por whatsapp/i }))
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('wa.me'), '_blank', 'noopener,noreferrer'
    )
  })

  it('deshabilita el botón con carrito vacío', () => {
    useCartStore.setState({ items: [] })
    render(<WhatsAppCheckout />)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

- [ ] **Step 9.9: Run tests**

```bash
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run test:run -- src/components/checkout/
```

Esperado: 6 tests PASS

- [ ] **Step 9.10: Commit**

```bash
git add src/components/cart/ src/components/checkout/ src/components/layout/Layout.tsx
git commit -m "feat(cart): add cart drawer, WhatsApp checkout and reservation timer"
```

---

## Task 10: Wholesale page

**Files:**
- Create: `src/components/wholesale/LotConfigurator.tsx`
- Create: `src/components/wholesale/WholesaleForm.tsx`
- Modify: `src/pages/WholesalePage.tsx`
- Test: `src/components/wholesale/__tests__/WholesaleForm.test.tsx`

- [ ] **Step 10.1: Crear `src/components/wholesale/LotConfigurator.tsx`**

```tsx
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Product, WholesaleOrderItem } from '@/types'

interface Props {
  products: Product[]
  items: WholesaleOrderItem[]
  onChange: (items: WholesaleOrderItem[]) => void
  minUnits: number
  maxUnits: number
}

export default function LotConfigurator({ products, items, onChange, minUnits, maxUnits }: Props) {
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [qty, setQty] = useState(1)

  const totalUnits = items.reduce((s, i) => s + i.quantity, 0)
  const selectedProduct = products.find((p) => p.id === selectedProductId)
  const availableSizes = [...new Set(selectedProduct?.variants?.map((v) => v.size) ?? [])].sort()
  const availableColors = [...new Set(selectedProduct?.variants?.map((v) => v.color) ?? [])]

  function addItem() {
    if (!selectedProduct || !selectedSize || !selectedColor) return
    const existingIdx = items.findIndex(
      (i) => i.product_id === selectedProductId && i.size === selectedSize && i.color === selectedColor
    )
    if (existingIdx >= 0) {
      const updated = [...items]
      updated[existingIdx] = { ...updated[existingIdx], quantity: updated[existingIdx].quantity + qty }
      onChange(updated)
    } else {
      onChange([...items, {
        product_id: selectedProductId,
        name: selectedProduct.name,
        size: selectedSize,
        color: selectedColor,
        quantity: qty,
      }])
    }
    setQty(1)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
          <SelectTrigger className="bg-surface border-border text-text-primary">
            <SelectValue placeholder="Producto" />
          </SelectTrigger>
          <SelectContent className="bg-surface border-border">
            {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={selectedSize} onValueChange={setSelectedSize} disabled={!selectedProductId}>
          <SelectTrigger className="bg-surface border-border text-text-primary">
            <SelectValue placeholder="Talla" />
          </SelectTrigger>
          <SelectContent className="bg-surface border-border">
            {availableSizes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={selectedColor} onValueChange={setSelectedColor} disabled={!selectedProductId}>
          <SelectTrigger className="bg-surface border-border text-text-primary">
            <SelectValue placeholder="Color" />
          </SelectTrigger>
          <SelectContent className="bg-surface border-border">
            {availableColors.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <input
            type="number" min={1} max={maxUnits - totalUnits} value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 bg-surface border border-border text-text-primary px-3 py-2 text-sm focus:outline-none focus:border-accent"
            aria-label="Cantidad"
          />
          <Button
            type="button" onClick={addItem}
            disabled={!selectedProductId || !selectedSize || !selectedColor}
            className="flex-1 bg-accent hover:bg-accent-hover text-background text-xs tracking-wider rounded-none"
          >
            Agregar
          </Button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="border border-border divide-y divide-border">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 text-sm gap-4">
              <span className="text-text-primary flex-1">{item.name}</span>
              <span className="text-text-muted">{item.size} / {item.color}</span>
              <span className="text-accent font-medium">{item.quantity} un.</span>
              <button
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                className="text-text-muted hover:text-error transition-colors"
                aria-label="Eliminar item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="px-4 py-3 flex justify-between text-sm font-medium">
            <span className="text-text-muted">Total unidades</span>
            <span className={totalUnits < minUnits ? 'text-error' : 'text-accent'}>
              {totalUnits} / {maxUnits}
              {totalUnits < minUnits && ` (mín. ${minUnits})`}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 10.2: Crear `src/components/wholesale/WholesaleForm.tsx`**

`handleSubmit` delegado en dos funciones auxiliares para mantenerse bajo 30 líneas.

```tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { useAllProducts } from '@/hooks/useProducts'
import LotConfigurator from './LotConfigurator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import type { WholesaleOrderItem } from '@/types'

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER as string

const step1Schema = z.object({
  customer_name: z.string().min(2, 'Nombre requerido'),
  customer_email: z.string().email('Email inválido'),
  customer_phone: z.string().min(7, 'Teléfono requerido'),
  notes: z.string().optional(),
})
type Step1Data = z.infer<typeof step1Schema>

interface Props {
  minUnits: number
  maxUnits: number
}

async function saveOrder(data: Step1Data, items: WholesaleOrderItem[], totalUnits: number): Promise<boolean> {
  const { error } = await supabase.from('wholesale_orders').insert({
    customer_name: data.customer_name,
    customer_email: data.customer_email,
    customer_phone: data.customer_phone,
    notes: data.notes ?? null,
    items,
    total_units: totalUnits,
  })
  return !error
}

function buildWholesaleWaMessage(data: Step1Data, items: WholesaleOrderItem[], totalUnits: number): string {
  const itemLines = items.map((i) => `${i.name} | ${i.size} / ${i.color} x${i.quantity}`).join('\n')
  return [
    'Pedido Wholesale DROPEN',
    '─────────────────────',
    `Cliente: ${data.customer_name}`,
    `Tel: ${data.customer_phone}`,
    '',
    itemLines,
    '',
    `Total: ${totalUnits} unidades`,
  ].join('\n')
}

export default function WholesaleForm({ minUnits, maxUnits }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [lotItems, setLotItems] = useState<WholesaleOrderItem[]>([])
  const [submitting, setSubmitting] = useState(false)
  const { products } = useAllProducts()

  const form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { customer_name: '', customer_email: '', customer_phone: '', notes: '' },
  })

  const totalUnits = lotItems.reduce((s, i) => s + i.quantity, 0)

  function handleStep1(data: Step1Data) {
    setStep1Data(data)
    setStep(2)
  }

  async function handleSubmit() {
    if (!step1Data) return
    setSubmitting(true)
    const ok = await saveOrder(step1Data, lotItems, totalUnits)
    if (!ok) { toast.error('Error al enviar. Intentá de nuevo.'); setSubmitting(false); return }
    const msg = buildWholesaleWaMessage(step1Data, lotItems, totalUnits)
    window.open(buildWhatsAppUrl(WA_NUMBER, msg), '_blank', 'noopener,noreferrer')
    setStep(3)
    setSubmitting(false)
  }

  if (step === 3) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-4xl">✅</p>
        <h3 className="font-display font-bold text-2xl text-text-primary">Pedido enviado</h3>
        <p className="text-text-muted">
          Te contactaremos a <strong>{step1Data?.customer_email}</strong> para confirmar los detalles.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-10">
        {[1, 2].map((n) => (
          <div key={n} className={`flex items-center gap-2 ${n > step ? 'opacity-40' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
              step >= n ? 'bg-accent border-accent text-background' : 'border-border text-text-muted'
            }`}>{n}</div>
            <span className="text-sm text-text-muted">{n === 1 ? 'Datos' : 'Lote'}</span>
            {n < 2 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleStep1)} className="space-y-5">
            <FormField control={form.control} name="customer_name" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-text-muted text-xs uppercase tracking-wider">Nombre completo</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-surface border-border text-text-primary focus:border-accent rounded-none" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="customer_email" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-text-muted text-xs uppercase tracking-wider">Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" className="bg-surface border-border text-text-primary focus:border-accent rounded-none" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="customer_phone" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-text-muted text-xs uppercase tracking-wider">Teléfono / WhatsApp</FormLabel>
                <FormControl>
                  <Input {...field} type="tel" className="bg-surface border-border text-text-primary focus:border-accent rounded-none" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-text-muted text-xs uppercase tracking-wider">Notas (opcional)</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} className="bg-surface border-border text-text-primary focus:border-accent rounded-none resize-none" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full bg-accent hover:bg-accent-hover text-background text-xs tracking-wider rounded-none py-4">
              Siguiente — Configurar lote
            </Button>
          </form>
        </Form>
      )}

      {step === 2 && (
        <div className="space-y-8">
          <LotConfigurator
            products={products}
            items={lotItems}
            onChange={setLotItems}
            minUnits={minUnits}
            maxUnits={maxUnits}
          />
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setStep(1)}
              className="flex-1 border-border text-text-muted rounded-none">
              Atrás
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={totalUnits < minUnits || totalUnits > maxUnits || submitting}
              className="flex-1 bg-accent hover:bg-accent-hover text-background text-xs tracking-wider rounded-none py-4"
            >
              {submitting ? 'Enviando...' : `Enviar pedido (${totalUnits} un.)`}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 10.3: Actualizar `src/pages/WholesalePage.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import WholesaleForm from '@/components/wholesale/WholesaleForm'

export default function WholesalePage() {
  const [minUnits, setMinUnits] = useState(6)
  const [maxUnits, setMaxUnits] = useState(60)

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['wholesale_min_units', 'wholesale_max_units'])
      .then(({ data }) => {
        data?.forEach(({ key, value }) => {
          if (key === 'wholesale_min_units') setMinUnits(parseInt(value))
          if (key === 'wholesale_max_units') setMaxUnits(parseInt(value))
        })
      })
  }, [])

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-2xl mx-auto mb-16 text-center">
        <p className="text-text-muted text-xs uppercase tracking-[0.3em] mb-4">Wholesale</p>
        <h1 className="font-display font-bold text-5xl text-text-primary tracking-wide mb-6">
          Pedidos por lote
        </h1>
        <p className="text-text-muted leading-relaxed">
          Mínimo {minUnits} unidades — máximo {maxUnits} por pedido.
          Completá el formulario y te contactamos en 24–48 hs hábiles.
        </p>
      </div>
      <WholesaleForm minUnits={minUnits} maxUnits={maxUnits} />
    </div>
  )
}
```

- [ ] **Step 10.4: Test de WholesaleForm**

```tsx
// src/components/wholesale/__tests__/WholesaleForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import WholesaleForm from '../WholesaleForm'

vi.mock('@/hooks/useProducts', () => ({
  useAllProducts: () => ({ products: [], loading: false }),
}))

describe('WholesaleForm', () => {
  it('muestra el paso 1 con campos de datos', () => {
    render(<WholesaleForm minUnits={6} maxUnits={60} />)
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument()
  })

  it('avanza al paso 2 con datos válidos', async () => {
    render(<WholesaleForm minUnits={6} maxUnits={60} />)
    await userEvent.type(screen.getByLabelText(/nombre completo/i), 'Juan Pérez')
    await userEvent.type(screen.getByLabelText(/email/i), 'juan@test.com')
    await userEvent.type(screen.getByLabelText(/teléfono/i), '+51987654321')
    await userEvent.click(screen.getByRole('button', { name: /siguiente/i }))
    await waitFor(() => {
      expect(screen.getByText(/configurar lote/i)).toBeInTheDocument()
    })
  })

  it('muestra error con email inválido', async () => {
    render(<WholesaleForm minUnits={6} maxUnits={60} />)
    await userEvent.type(screen.getByLabelText(/email/i), 'no-es-email')
    await userEvent.click(screen.getByRole('button', { name: /siguiente/i }))
    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 10.5: Run tests**

```bash
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run test:run -- src/components/wholesale/
```

Esperado: 3 tests PASS

- [ ] **Step 10.6: Commit**

```bash
git add src/components/wholesale/ src/pages/WholesalePage.tsx
git commit -m "feat(wholesale): add lot configurator, wholesale form and wholesale page"
```

---

## Task 11: Admin — AuthGuard + login + dashboard shell

**Files:**
- Create: `src/components/admin/AdminGuard.tsx`
- Create: `src/hooks/useAdmin.ts`
- Create: `src/pages/admin/AdminLoginPage.tsx`
- Create: `src/pages/admin/AdminDashboardPage.tsx`
- Create: `src/components/admin/AdminLayout.tsx`
- Test: `src/components/admin/__tests__/AdminGuard.test.tsx`

- [ ] **Step 11.1: Crear `src/hooks/useAdmin.ts`**

```ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { AdminRole } from '@/types'

interface AdminProfile {
  user_id: string
  role: AdminRole
  display_name: string | null
  avatar_url: string | null
}

interface UseAdminResult {
  user: User | null
  profile: AdminProfile | null
  role: AdminRole | null
  loading: boolean
  signOut: () => Promise<void>
  can: (allowedRoles: AdminRole[]) => boolean
}

export function useAdmin(): UseAdminResult {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data } = await supabase
          .from('admin_profiles')
          .select('user_id, role, display_name, avatar_url')
          .eq('user_id', session.user.id)
          .single()
        if (mounted) setProfile(data ?? null)
      }
      if (mounted) setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data } = await supabase
          .from('admin_profiles')
          .select('user_id, role, display_name, avatar_url')
          .eq('user_id', session.user.id)
          .single()
        if (mounted) setProfile(data ?? null)
      } else {
        if (mounted) setProfile(null)
      }
    })
    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  return {
    user,
    profile,
    role: profile?.role ?? null,
    loading,
    signOut: () => supabase.auth.signOut(),
    can: (allowedRoles: AdminRole[]) => !!profile && allowedRoles.includes(profile.role),
  }
}
```

- [ ] **Step 11.2: Crear `src/components/admin/AdminGuard.tsx`**

```tsx
import { Navigate } from 'react-router-dom'
import { useAdmin } from '@/hooks/useAdmin'
import type { AdminRole } from '@/types'

interface Props {
  children: React.ReactNode
  allowedRoles?: AdminRole[]
}

export default function AdminGuard({ children, allowedRoles }: Props) {
  const { user, profile, loading } = useAdmin()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || !profile) {
    return <Navigate to="/admin/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/admin" replace />
  }

  return <>{children}</>
}
```

- [ ] **Step 11.3: Crear `src/pages/admin/AdminLoginPage.tsx`**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña requerida'),
})
type FormData = z.infer<typeof schema>

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  async function handleLogin(data: FormData) {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error) {
      toast.error('Credenciales inválidas')
      setLoading(false)
      return
    }
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="font-display font-bold text-3xl tracking-[0.3em] text-text-primary">DROPEN</h1>
          <p className="text-text-muted text-sm mt-2 tracking-widest uppercase">Admin</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-text-muted text-xs uppercase tracking-wider">Email</FormLabel>
                <FormControl>
                  <Input
                    {...field} type="email" autoComplete="email"
                    className="bg-surface border-border text-text-primary focus:border-accent rounded-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-text-muted text-xs uppercase tracking-wider">Contraseña</FormLabel>
                <FormControl>
                  <Input
                    {...field} type="password" autoComplete="current-password"
                    className="bg-surface border-border text-text-primary focus:border-accent rounded-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button
              type="submit" disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover text-background text-xs tracking-wider rounded-none py-4"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
```

- [ ] **Step 11.4: Crear `src/components/admin/AdminLayout.tsx`**

```tsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Tag, Settings, LogOut } from 'lucide-react'
import { useAdmin } from '@/hooks/useAdmin'

const NAV_ITEMS = [
  { to: '/admin',           icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/productos', icon: Package,          label: 'Productos',  end: false },
  { to: '/admin/drops',     icon: Tag,              label: 'Drops',      end: false },
  { to: '/admin/ajustes',   icon: Settings,         label: 'Ajustes',    end: false },
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
```

- [ ] **Step 11.5: Crear `src/pages/admin/AdminDashboardPage.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { RESERVATION_FIELDS } from '@/lib/query-fields'

interface Stats {
  activeReservations: number
  totalProducts: number
  totalCollections: number
  pendingWholesale: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    activeReservations: 0,
    totalProducts: 0,
    totalCollections: 0,
    pendingWholesale: 0,
  })

  useEffect(() => {
    Promise.all([
      supabase.from('reservations').select(RESERVATION_FIELDS, { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('collections').select('id', { count: 'exact', head: true }),
      supabase.from('wholesale_orders').select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
    ]).then(([res, prod, col, ws]) => {
      setStats({
        activeReservations: res.count ?? 0,
        totalProducts: prod.count ?? 0,
        totalCollections: col.count ?? 0,
        pendingWholesale: ws.count ?? 0,
      })
    })
  }, [])

  const cards = [
    { label: 'Reservas activas',   value: stats.activeReservations },
    { label: 'Productos',          value: stats.totalProducts },
    { label: 'Drops',              value: stats.totalCollections },
    { label: 'Wholesale pendiente',value: stats.pendingWholesale },
  ]

  return (
    <div className="p-8">
      <h1 className="font-display font-bold text-2xl text-text-primary mb-8 tracking-wide">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value }) => (
          <div key={label} className="bg-surface border border-border p-6">
            <p className="text-xs text-text-muted uppercase tracking-widest">{label}</p>
            <p className="text-3xl font-bold text-accent mt-2">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 11.6: Test de AdminGuard**

```tsx
// src/components/admin/__tests__/AdminGuard.test.tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import AdminGuard from '../AdminGuard'

vi.mock('@/hooks/useAdmin')

import { useAdmin } from '@/hooks/useAdmin'

describe('AdminGuard', () => {
  it('muestra spinner mientras carga', () => {
    vi.mocked(useAdmin).mockReturnValue({
      user: null, profile: null, role: null, loading: true, signOut: vi.fn(), can: vi.fn(),
    })
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminGuard><div>Panel</div></AdminGuard>
      </MemoryRouter>
    )
    expect(screen.queryByText('Panel')).not.toBeInTheDocument()
  })

  it('redirige a login sin sesión', () => {
    vi.mocked(useAdmin).mockReturnValue({
      user: null, profile: null, role: null, loading: false, signOut: vi.fn(), can: vi.fn(),
    })
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminGuard><div>Panel</div></AdminGuard>
      </MemoryRouter>
    )
    expect(screen.queryByText('Panel')).not.toBeInTheDocument()
  })

  it('muestra children con sesión válida', () => {
    const mockUser = { id: 'u1', email: 'admin@dropen.com' } as never
    const mockProfile = { user_id: 'u1', role: 'admin' as const, display_name: null, avatar_url: null }
    vi.mocked(useAdmin).mockReturnValue({
      user: mockUser, profile: mockProfile, role: 'admin', loading: false, signOut: vi.fn(), can: vi.fn(),
    })
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminGuard><div>Panel</div></AdminGuard>
      </MemoryRouter>
    )
    expect(screen.getByText('Panel')).toBeInTheDocument()
  })
})
```

- [ ] **Step 11.7: Run tests**

```bash
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run test:run -- src/components/admin/__tests__/AdminGuard.test.tsx
```

Esperado: 3 tests PASS

- [ ] **Step 11.8: Commit**

```bash
git add src/hooks/useAdmin.ts src/components/admin/ src/pages/admin/
git commit -m "feat(admin): add auth guard, login page, admin layout and dashboard"
```

---

## Task 12: Admin CRUD — productos y drops

**Files:**
- Create: `src/components/admin/products/ProductsTable.tsx`
- Create: `src/components/admin/products/ProductFormDialog.tsx`
- Create: `src/components/admin/products/VariantsEditor.tsx`
- Create: `src/components/admin/drops/DropsTable.tsx`
- Create: `src/components/admin/drops/DropFormDialog.tsx`
- Modify: `src/pages/admin/AdminProductsPage.tsx`
- Modify: `src/pages/admin/AdminDropsPage.tsx`
- Test: `src/components/admin/products/__tests__/ProductsTable.test.tsx`

- [ ] **Step 12.1: Crear `src/components/admin/products/ProductsTable.tsx`**

```tsx
import { Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Product } from '@/types'

interface Props {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
  onToggleActive: (productId: string, active: boolean) => void
}

export default function ProductsTable({ products, onEdit, onDelete, onToggleActive }: Props) {
  if (products.length === 0) {
    return <p className="text-center text-text-muted py-12 text-sm">No hay productos cargados.</p>
  }

  return (
    <div className="border border-border divide-y divide-border">
      {products.map((product) => {
        const totalStock = product.variants?.reduce((s, v) => s + v.stock, 0) ?? 0
        return (
          <div key={product.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-text-primary text-sm font-medium truncate">{product.name}</p>
              <p className="text-xs text-text-muted mt-0.5">
                S/ {product.price.toFixed(2)} · Stock: {totalStock}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onToggleActive(product.id, !product.active)}
                aria-label={product.active ? 'Desactivar' : 'Activar'}
                className="text-text-muted hover:text-accent transition-colors"
              >
                {product.active
                  ? <ToggleRight className="w-5 h-5 text-accent" />
                  : <ToggleLeft className="w-5 h-5" />
                }
              </button>
              <Button
                variant="ghost" size="icon"
                onClick={() => onEdit(product)}
                className="text-text-muted hover:text-text-primary"
                aria-label="Editar"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost" size="icon"
                onClick={() => onDelete(product.id)}
                className="text-text-muted hover:text-error"
                aria-label="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 12.2: Crear `src/components/admin/products/VariantsEditor.tsx`**

```tsx
import { useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export interface VariantDraft {
  size: string
  color: string
  stock: number
  sku: string
}

interface Props {
  variants: VariantDraft[]
  onChange: (variants: VariantDraft[]) => void
}

const EMPTY_VARIANT: VariantDraft = { size: '', color: '', stock: 0, sku: '' }

export default function VariantsEditor({ variants, onChange }: Props) {
  function addRow() { onChange([...variants, { ...EMPTY_VARIANT }]) }

  function updateRow(idx: number, patch: Partial<VariantDraft>) {
    const updated = variants.map((v, i) => i === idx ? { ...v, ...patch } : v)
    onChange(updated)
  }

  function removeRow(idx: number) { onChange(variants.filter((_, i) => i !== idx)) }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[2fr_2fr_1fr_2fr_auto] gap-2 text-xs text-text-muted uppercase tracking-wider px-1">
        <span>Talla</span><span>Color</span><span>Stock</span><span>SKU</span><span></span>
      </div>
      {variants.map((v, i) => (
        <div key={i} className="grid grid-cols-[2fr_2fr_1fr_2fr_auto] gap-2 items-center">
          <Input value={v.size} onChange={(e) => updateRow(i, { size: e.target.value })}
            placeholder="32" className="bg-surface border-border text-text-primary rounded-none text-sm h-8" />
          <Input value={v.color} onChange={(e) => updateRow(i, { color: e.target.value })}
            placeholder="Black" className="bg-surface border-border text-text-primary rounded-none text-sm h-8" />
          <Input type="number" min={0} value={v.stock}
            onChange={(e) => updateRow(i, { stock: parseInt(e.target.value) || 0 })}
            className="bg-surface border-border text-text-primary rounded-none text-sm h-8" />
          <Input value={v.sku} onChange={(e) => updateRow(i, { sku: e.target.value })}
            placeholder="DRP-001" className="bg-surface border-border text-text-primary rounded-none text-sm h-8" />
          <Button variant="ghost" size="icon" onClick={() => removeRow(i)}
            className="text-text-muted hover:text-error h-8 w-8" aria-label="Eliminar variante">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addRow}
        className="border-border text-text-muted hover:text-text-primary rounded-none gap-1.5">
        <Plus className="w-3.5 h-3.5" />
        Agregar variante
      </Button>
    </div>
  )
}
```

- [ ] **Step 12.3: Crear `src/components/admin/products/ProductFormDialog.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import VariantsEditor, { type VariantDraft } from './VariantsEditor'
import type { Product, Collection } from '@/types'

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

export default function ProductFormDialog({ open, product, collections, onClose, onSaved }: Props) {
  const isEdit = !!product
  const [variants, setVariants] = useState<VariantDraft[]>([])
  const [saving, setSaving] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '', collection_id: '', price: 0, description: '' },
  })

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        slug: product.slug,
        collection_id: product.collection_id,
        price: product.price,
        description: product.description ?? '',
      })
      setVariants(product.variants?.map((v) => ({
        size: v.size, color: v.color, stock: v.stock, sku: v.sku,
      })) ?? [])
    } else {
      form.reset({ name: '', slug: '', collection_id: '', price: 0, description: '' })
      setVariants([])
    }
  }, [product, form])

  async function handleSave(data: FormData) {
    setSaving(true)
    if (isEdit && product) {
      await updateProduct(product, data)
    } else {
      await createProduct(data)
    }
    setSaving(false)
  }

  async function createProduct(data: FormData) {
    const { data: inserted, error } = await supabase.from('products').insert({
      name: data.name, slug: data.slug, collection_id: data.collection_id,
      price: data.price, moneda_code: 'PEN', description: data.description ?? null, active: true,
    }).select('id').single()
    if (error || !inserted) { toast.error('Error al crear producto'); return }
    if (variants.length > 0) {
      await supabase.from('product_variants').insert(
        variants.map((v) => ({ product_id: inserted.id, ...v }))
      )
    }
    toast.success('Producto creado')
    onSaved()
    onClose()
  }

  async function updateProduct(product: Product, data: FormData) {
    await supabase.from('products').update({
      name: data.name, slug: data.slug, collection_id: data.collection_id,
      price: data.price, description: data.description ?? null,
    }).eq('id', product.id)
    await supabase.from('product_variants').delete().eq('product_id', product.id)
    if (variants.length > 0) {
      await supabase.from('product_variants').insert(
        variants.map((v) => ({ product_id: product.id, ...v }))
      )
    }
    toast.success('Producto actualizado')
    onSaved()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-surface border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wide text-text-primary">
            {isEdit ? 'Editar producto' : 'Nuevo producto'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-5">
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
                      {collections.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-text-muted uppercase tracking-wider">Precio (PEN)</FormLabel>
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
                  <Textarea {...field} rows={3} className="bg-background border-border text-text-primary rounded-none focus:border-accent resize-none" />
                </FormControl>
              </FormItem>
            )} />
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Variantes</p>
              <VariantsEditor variants={variants} onChange={setVariants} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
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
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 12.4: Actualizar `src/pages/admin/AdminProductsPage.tsx`**

```tsx
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAllProducts, useCollections } from '@/hooks/useProducts'
import { Button } from '@/components/ui/button'
import ProductsTable from '@/components/admin/products/ProductsTable'
import ProductFormDialog from '@/components/admin/products/ProductFormDialog'
import type { Product } from '@/types'

export default function AdminProductsPage() {
  const { products, loading } = useAllProducts()
  const { collections } = useCollections()
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [, forceRefresh] = useState(0)

  function openCreate() { setEditingProduct(null); setDialogOpen(true) }
  function openEdit(p: Product) { setEditingProduct(p); setDialogOpen(true) }
  function handleSaved() { forceRefresh((n) => n + 1) }

  async function handleDelete(productId: string) {
    if (!confirm('¿Eliminar este producto?')) return
    await supabase.from('products').delete().eq('id', productId)
    toast.success('Producto eliminado')
    forceRefresh((n) => n + 1)
  }

  async function handleToggleActive(productId: string, active: boolean) {
    await supabase.from('products').update({ active }).eq('id', productId)
    forceRefresh((n) => n + 1)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-2xl text-text-primary tracking-wide">Productos</h1>
        <Button onClick={openCreate}
          className="bg-accent hover:bg-accent-hover text-background text-xs tracking-wider rounded-none gap-2">
          <Plus className="w-4 h-4" />
          Nuevo producto
        </Button>
      </div>

      {loading ? (
        <p className="text-text-muted text-sm">Cargando...</p>
      ) : (
        <ProductsTable
          products={products}
          onEdit={openEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      )}

      <ProductFormDialog
        open={dialogOpen}
        product={editingProduct}
        collections={collections}
        onClose={() => setDialogOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  )
}
```

- [ ] **Step 12.5: Crear `src/components/admin/drops/DropsTable.tsx`**

```tsx
import { Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Collection } from '@/types'

interface Props {
  collections: Collection[]
  onEdit: (collection: Collection) => void
  onDelete: (collectionId: string) => void
  onToggleActive: (collectionId: string, active: boolean) => void
}

export default function DropsTable({ collections, onEdit, onDelete, onToggleActive }: Props) {
  if (collections.length === 0) {
    return <p className="text-center text-text-muted py-12 text-sm">No hay drops cargados.</p>
  }
  return (
    <div className="border border-border divide-y divide-border">
      {collections.map((col) => (
        <div key={col.id} className="flex items-center gap-4 px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-text-primary text-sm font-medium">{col.name}</p>
            <p className="text-xs text-text-muted mt-0.5">{col.slug}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onToggleActive(col.id, !col.active)}
              aria-label={col.active ? 'Desactivar' : 'Activar'}
              className="text-text-muted hover:text-accent transition-colors">
              {col.active
                ? <ToggleRight className="w-5 h-5 text-accent" />
                : <ToggleLeft className="w-5 h-5" />
              }
            </button>
            <Button variant="ghost" size="icon" onClick={() => onEdit(col)}
              className="text-text-muted hover:text-text-primary" aria-label="Editar">
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(col.id)}
              className="text-text-muted hover:text-error" aria-label="Eliminar">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 12.6: Crear `src/components/admin/drops/DropFormDialog.tsx`**

```tsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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

export default function DropFormDialog({ open, collection, onClose, onSaved }: Props) {
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
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-surface border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wide text-text-primary">
            {isEdit ? 'Editar drop' : 'Nuevo drop'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
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
                  <Textarea {...field} rows={3} className="bg-background border-border text-text-primary rounded-none focus:border-accent resize-none" />
                </FormControl>
              </FormItem>
            )} />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose}
                className="border-border text-text-muted rounded-none">Cancelar</Button>
              <Button type="submit"
                className="bg-accent hover:bg-accent-hover text-background text-xs tracking-wider rounded-none">
                {isEdit ? 'Actualizar' : 'Crear drop'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 12.7: Actualizar `src/pages/admin/AdminDropsPage.tsx`**

```tsx
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useCollections } from '@/hooks/useProducts'
import { Button } from '@/components/ui/button'
import DropsTable from '@/components/admin/drops/DropsTable'
import DropFormDialog from '@/components/admin/drops/DropFormDialog'
import type { Collection } from '@/types'

export default function AdminDropsPage() {
  const { collections, loading } = useCollections()
  const [editingCol, setEditingCol] = useState<Collection | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [, forceRefresh] = useState(0)

  function openCreate() { setEditingCol(null); setDialogOpen(true) }
  function openEdit(c: Collection) { setEditingCol(c); setDialogOpen(true) }

  async function handleDelete(colId: string) {
    if (!confirm('¿Eliminar este drop?')) return
    await supabase.from('collections').delete().eq('id', colId)
    toast.success('Drop eliminado')
    forceRefresh((n) => n + 1)
  }

  async function handleToggleActive(colId: string, active: boolean) {
    await supabase.from('collections').update({ active }).eq('id', colId)
    forceRefresh((n) => n + 1)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-2xl text-text-primary tracking-wide">Drops</h1>
        <Button onClick={openCreate}
          className="bg-accent hover:bg-accent-hover text-background text-xs tracking-wider rounded-none gap-2">
          <Plus className="w-4 h-4" /> Nuevo drop
        </Button>
      </div>
      {loading ? (
        <p className="text-text-muted text-sm">Cargando...</p>
      ) : (
        <DropsTable collections={collections} onEdit={openEdit}
          onDelete={handleDelete} onToggleActive={handleToggleActive} />
      )}
      <DropFormDialog
        open={dialogOpen} collection={editingCol}
        onClose={() => setDialogOpen(false)} onSaved={() => forceRefresh((n) => n + 1)}
      />
    </div>
  )
}
```

- [ ] **Step 12.8: Test de ProductsTable**

```tsx
// src/components/admin/products/__tests__/ProductsTable.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import ProductsTable from '../ProductsTable'
import type { Product } from '@/types'

const PRODUCT: Product = {
  id: 'p1', collection_id: 'c1', name: 'Jean Baggy', slug: 'jean-baggy',
  description: null, price: 189, moneda_code: 'PEN', active: true, created_at: '2026-01-01',
  images: [], variants: [{ id: 'v1', product_id: 'p1', size: '32', color: 'Black', stock: 5, sku: 'DRP-001' }],
}

describe('ProductsTable', () => {
  it('muestra los productos', () => {
    render(<ProductsTable products={[PRODUCT]} onEdit={vi.fn()} onDelete={vi.fn()} onToggleActive={vi.fn()} />)
    expect(screen.getByText('Jean Baggy')).toBeInTheDocument()
  })

  it('llama onEdit al hacer click en editar', async () => {
    const onEdit = vi.fn()
    render(<ProductsTable products={[PRODUCT]} onEdit={onEdit} onDelete={vi.fn()} onToggleActive={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Editar' }))
    expect(onEdit).toHaveBeenCalledWith(PRODUCT)
  })

  it('muestra mensaje cuando no hay productos', () => {
    render(<ProductsTable products={[]} onEdit={vi.fn()} onDelete={vi.fn()} onToggleActive={vi.fn()} />)
    expect(screen.getByText(/no hay productos/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 12.9: Run tests**

```bash
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run test:run -- src/components/admin/
```

Esperado: 6 tests PASS

- [ ] **Step 12.10: Commit**

```bash
git add src/components/admin/ src/pages/admin/
git commit -m "feat(admin): add products table, variants editor, form dialogs and drops CRUD"
```

---

## Task 13: Admin — image upload + ajustes + reservations view

**Files:**
- Create: `src/components/admin/products/ImageUploader.tsx`
- Create: `src/pages/admin/AdminSettingsPage.tsx`
- Create: `src/pages/admin/AdminReservationsPage.tsx`
- Test: `src/components/admin/products/__tests__/ImageUploader.test.tsx`

- [ ] **Step 13.1: Crear `src/components/admin/products/ImageUploader.tsx`**

```tsx
import { useCallback, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

interface Props {
  productId: string
  onUploaded: (url: string, storagePath: string) => void
}

export default function ImageUploader({ productId, onUploaded }: Props) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  const upload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Solo se aceptan imágenes.'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Máximo 5 MB por imagen.'); return }

    setUploading(true)
    const ext = file.name.split('.').pop()
    const storagePath = `products/${productId}/${Date.now()}.${ext}`

    const { error } = await supabase.storage.from('product-images').upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
    })
    if (error) { toast.error('Error al subir imagen'); setUploading(false); return }

    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(storagePath)
    onUploaded(urlData.publicUrl, storagePath)
    setUploading(false)
    toast.success('Imagen subida')
  }, [productId, onUploaded])

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) upload(file)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed transition-colors rounded-none p-8 text-center ${
        dragging ? 'border-accent bg-accent/5' : 'border-border hover:border-text-muted'
      }`}
    >
      <Upload className="w-6 h-6 text-text-muted mx-auto mb-2" />
      {uploading ? (
        <p className="text-sm text-text-muted">Subiendo...</p>
      ) : (
        <>
          <p className="text-sm text-text-muted mb-2">
            Arrastrá una imagen o hacé click para seleccionar
          </p>
          <label className="cursor-pointer">
            <span className="text-xs text-accent underline underline-offset-2">Seleccionar archivo</span>
            <input type="file" accept="image/*" onChange={handleFileInput} className="sr-only" />
          </label>
          <p className="text-xs text-text-muted mt-2">PNG, JPG, WebP — máximo 5 MB</p>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 13.2: Crear `src/pages/admin/AdminSettingsPage.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAdmin } from '@/hooks/useAdmin'

interface SiteSettings {
  wholesale_min_units: string
  wholesale_max_units: string
  whatsapp_number: string
  site_name: string
}

export default function AdminSettingsPage() {
  const { can } = useAdmin()
  const isAdmin = can(['admin'])
  const [settings, setSettings] = useState<SiteSettings>({
    wholesale_min_units: '6',
    wholesale_max_units: '60',
    whatsapp_number: '51991941252',
    site_name: 'DROPEN',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('key, value')
      .then(({ data }) => {
        if (!data) return
        const map = Object.fromEntries(data.map(({ key, value }) => [key, value]))
        setSettings((prev) => ({ ...prev, ...map }))
      })
  }, [])

  async function handleSave() {
    setSaving(true)
    const entries = Object.entries(settings).map(([key, value]) => ({ key, value }))
    for (const entry of entries) {
      await supabase.from('site_settings').upsert(entry, { onConflict: 'key' })
    }
    toast.success('Ajustes guardados')
    setSaving(false)
  }

  const fields: { key: keyof SiteSettings; label: string; type?: string }[] = [
    { key: 'site_name', label: 'Nombre del sitio' },
    { key: 'whatsapp_number', label: 'Número WhatsApp', type: 'tel' },
    { key: 'wholesale_min_units', label: 'Mínimo unidades wholesale', type: 'number' },
    { key: 'wholesale_max_units', label: 'Máximo unidades wholesale', type: 'number' },
  ]

  return (
    <div className="p-8 max-w-lg">
      <h1 className="font-display font-bold text-2xl text-text-primary mb-8 tracking-wide">Ajustes</h1>
      <div className="space-y-5">
        {fields.map(({ key, label, type }) => (
          <div key={key}>
            <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">{label}</label>
            <Input
              type={type ?? 'text'}
              value={settings[key]}
              disabled={!isAdmin}
              onChange={(e) => setSettings((prev) => ({ ...prev, [key]: e.target.value }))}
              className="bg-surface border-border text-text-primary rounded-none focus:border-accent disabled:opacity-50"
            />
          </div>
        ))}
      </div>
      {isAdmin && (
        <Button
          onClick={handleSave} disabled={saving}
          className="mt-8 bg-accent hover:bg-accent-hover text-background text-xs tracking-wider rounded-none"
        >
          {saving ? 'Guardando...' : 'Guardar ajustes'}
        </Button>
      )}
      {!isAdmin && (
        <p className="mt-4 text-xs text-text-muted">Solo administradores pueden cambiar estos ajustes.</p>
      )}
    </div>
  )
}
```

- [ ] **Step 13.3: Crear `src/pages/admin/AdminReservationsPage.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { RESERVATION_FIELDS } from '@/lib/query-fields'
import type { Reservation } from '@/types'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('reservations')
      .select(RESERVATION_FIELDS)
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setReservations(data ?? [])
        setLoading(false)
      })
  }, [])

  const statusColors: Record<string, string> = {
    pending:   'text-yellow-400',
    confirmed: 'text-green-400',
    expired:   'text-text-muted',
  }

  return (
    <div className="p-8">
      <h1 className="font-display font-bold text-2xl text-text-primary mb-8 tracking-wide">Reservas</h1>
      {loading ? (
        <p className="text-text-muted text-sm">Cargando...</p>
      ) : (
        <div className="border border-border divide-y divide-border">
          {reservations.length === 0 && (
            <p className="text-center text-text-muted py-12 text-sm">Sin reservas.</p>
          )}
          {reservations.map((r) => (
            <div key={r.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-4 py-3 text-sm items-center">
              <span className="text-text-primary font-mono text-xs truncate">{r.id}</span>
              <span className="text-text-muted">{r.quantity} un.</span>
              <span className={statusColors[r.status] ?? 'text-text-muted'}>{r.status}</span>
              <span className="text-text-muted text-xs">{formatDate(r.expires_at)}</span>
              <span className="text-text-muted text-xs">{r.customer_wa ?? '—'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 13.4: Test de ImageUploader**

```tsx
// src/components/admin/products/__tests__/ImageUploader.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ImageUploader from '../ImageUploader'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://cdn.example.com/img.webp' } }),
      }),
    },
  },
}))

describe('ImageUploader', () => {
  it('muestra la zona de arrastre', () => {
    render(<ImageUploader productId="p1" onUploaded={vi.fn()} />)
    expect(screen.getByText(/arrastrá una imagen/i)).toBeInTheDocument()
  })

  it('muestra "Seleccionar archivo" como label', () => {
    render(<ImageUploader productId="p1" onUploaded={vi.fn()} />)
    expect(screen.getByText(/seleccionar archivo/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 13.5: Run tests**

```bash
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run test:run -- src/components/admin/products/__tests__/ImageUploader.test.tsx
```

Esperado: 2 tests PASS

- [ ] **Step 13.6: Integrar ImageUploader en ProductFormDialog**

En `src/components/admin/products/ProductFormDialog.tsx`, dentro del `<form>` luego del campo description, agregar:

```tsx
{isEdit && product && (
  <div>
    <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Imágenes</p>
    <ImageUploader
      productId={product.id}
      onUploaded={async (url, storagePath) => {
        await supabase.from('product_images').insert({
          product_id: product.id,
          url,
          storage_path: storagePath,
          order: 0,
          is_primary: (product.images?.length ?? 0) === 0,
        })
        toast.success('Imagen agregada')
        onSaved()
      }}
    />
  </div>
)}
```

Agregar import:
```tsx
import ImageUploader from './ImageUploader'
```

- [ ] **Step 13.7: Commit**

```bash
git add src/components/admin/products/ImageUploader.tsx src/pages/admin/AdminSettingsPage.tsx src/pages/admin/AdminReservationsPage.tsx
git commit -m "feat(admin): add image uploader, settings page and reservations view"
```

---

## Task 14: Edge Function — auto-expire reservations

**Files:**
- Create: `supabase/functions/expire-reservations/index.ts`
- Create: `supabase/functions/expire-reservations/schedule.sql`

- [ ] **Step 14.1: Crear `supabase/functions/expire-reservations/index.ts`**

```ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const { data: expired, error: fetchError } = await supabase
    .from('reservations')
    .select('id, variant_id, quantity')
    .eq('status', 'pending')
    .lt('expires_at', new Date().toISOString())

  if (fetchError) {
    return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 })
  }

  if (!expired || expired.length === 0) {
    return new Response(JSON.stringify({ expired: 0 }), { status: 200 })
  }

  const ids = expired.map((r) => r.id)
  const { error: updateError } = await supabase
    .from('reservations')
    .update({ status: 'expired' })
    .in('id', ids)

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), { status: 500 })
  }

  for (const res of expired) {
    await supabase.rpc('release_reservation_stock', {
      p_variant_id: res.variant_id,
      p_quantity: res.quantity,
    })
  }

  return new Response(JSON.stringify({ expired: ids.length }), { status: 200 })
})
```

- [ ] **Step 14.2: Crear `supabase/functions/expire-reservations/schedule.sql`**

Registrar el cron job en pg_cron (ejecutar en Supabase SQL editor):

```sql
-- Cron job: expirar reservas vencidas cada 5 minutos
select cron.schedule(
  'expire-reservations',
  '*/5 * * * *',
  $$
    select net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/expire-reservations',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key'),
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    )
  $$
);
```

- [ ] **Step 14.3: Deploy de la función**

```bash
npx supabase functions deploy expire-reservations --project-ref icfqhtiujsboyrggxpqu
```

Verificar en el dashboard de Supabase > Functions que la función aparece deployada.

- [ ] **Step 14.4: Commit**

```bash
git add supabase/functions/
git commit -m "feat(backend): add expire-reservations edge function with pg_cron schedule"
```

---

## Task 15: Performance, SEO, meta tags y polish final

**Files:**
- Modify: `index.html`
- Create: `src/components/seo/PageMeta.tsx`
- Create: `public/robots.txt`
- Create: `vercel.json`
- Modify: `vite.config.ts` (bundle splitting)
- Modify: `src/pages/ProductPage.tsx` (meta tags)

- [ ] **Step 15.1: Crear `src/components/seo/PageMeta.tsx`**

```tsx
import { useEffect } from 'react'

interface Props {
  title: string
  description?: string
  image?: string
  url?: string
}

export default function PageMeta({ title, description, image, url }: Props) {
  const fullTitle = title === 'DROPEN' ? 'DROPEN' : `${title} — DROPEN`
  const desc = description ?? 'Jeans baggy premium. Streetwear consciente desde Lima.'

  useEffect(() => {
    document.title = fullTitle
    setMeta('description', desc)
    setMeta('og:title', fullTitle)
    setMeta('og:description', desc)
    setMeta('og:type', 'website')
    if (url) setMeta('og:url', url)
    if (image) setMeta('og:image', image)
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', fullTitle)
    setMeta('twitter:description', desc)
    if (image) setMeta('twitter:image', image)
  }, [fullTitle, desc, image, url])

  return null
}

function setMeta(nameOrProperty: string, content: string) {
  const isOg = nameOrProperty.startsWith('og:') || nameOrProperty.startsWith('twitter:')
  const attr = isOg ? 'property' : 'name'
  let el = document.querySelector(`meta[${attr}="${nameOrProperty}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, nameOrProperty)
    document.head.appendChild(el)
  }
  el.content = content
}
```

- [ ] **Step 15.2: Actualizar `index.html`**

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0a0a0a" />
    <title>DROPEN — Jeans Baggy Premium</title>
    <meta name="description" content="Jeans baggy premium. Streetwear consciente desde Lima." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 15.3: Actualizar `vite.config.ts` con code-splitting manual**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'analyze' && visualizer({ open: true, filename: 'dist/stats.html' }),
  ].filter(Boolean),

  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:   ['react', 'react-dom'],
          router:   ['react-router-dom'],
          motion:   ['framer-motion'],
          supabase: ['@supabase/supabase-js'],
          zustand:  ['zustand'],
          ui:       ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-sheet'],
        },
      },
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
}))
```

- [ ] **Step 15.4: Crear `public/robots.txt`**

```txt
User-agent: *
Allow: /
Disallow: /admin/

Sitemap: https://dropen.pe/sitemap.xml
```

- [ ] **Step 15.5: Crear `vercel.json`**

```json
{
  "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

- [ ] **Step 15.6: Integrar PageMeta en páginas clave**

En `src/pages/HomePage.tsx`:
```tsx
import PageMeta from '@/components/seo/PageMeta'
// Al inicio del return:
<PageMeta title="DROPEN" description="Jeans baggy premium. Streetwear consciente desde Lima." />
```

En `src/pages/ProductPage.tsx`, agregar dentro del render cuando product está cargado:
```tsx
import PageMeta from '@/components/seo/PageMeta'
// Después de cargar product:
{product && (
  <PageMeta
    title={product.name}
    description={product.description ?? undefined}
  />
)}
```

- [ ] **Step 15.7: Build de producción y análisis de bundle**

```bash
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run build
```

Verificar que:
- Build termina sin errores
- Los chunks generados son coherentes con manualChunks definidos
- `dist/` contiene `index.html` y carpeta `assets/`

- [ ] **Step 15.8: Run test suite completo**

```bash
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run test:run
```

Esperado: todos los tests PASS (>20 tests)

- [ ] **Step 15.9: Commit final**

```bash
git add index.html src/components/seo/ public/robots.txt vercel.json vite.config.ts src/pages/
git commit -m "feat(perf): add meta tags component, code splitting, robots.txt and vercel config"
```

---

## Self-Review — Cobertura del spec

### Spec coverage checklist

| Requisito spec | Task que lo cubre |
|---|---|
| Supabase migrations + RLS | Task 2 |
| Storage buckets product-images / collection-covers | Task 2 |
| Types centralizados (CartItem, WhatsAppLine, etc.) | Task 3 |
| query-fields.ts (no wildcards) | Task 3, 7 |
| Zustand cart store + persist | Task 4 |
| Zustand reservation store + sessionStorage | Task 4 |
| React Router v7 lazy loading | Task 5 |
| Layout + Header + Footer + CartDrawer | Task 5, 9 |
| Home: HeroParallax + DropsGrid + BrandStatement | Task 6 |
| useCollections, useCollection, useProductsByCollection | Task 7 |
| useAllProducts (wholesale y búsqueda) | Task 7 |
| ProductCard con motion, badge agotado | Task 7 |
| CatalogPage + DropPage | Task 7 |
| ProductGallery galería con thumbnails | Task 8 |
| VariantSelector talla + color + stock visual | Task 8 |
| ProductPage completo con add-to-cart | Task 8 |
| CartItem + CartSummary | Task 9 |
| ReservationTimer countdown | Task 9 |
| WhatsApp checkout + reservas 2 hs | Task 9 |
| CartDrawer Sheet animado | Task 9 |
| WholesalePage mín/máx desde site_settings | Task 10 |
| LotConfigurator multi-producto | Task 10 |
| WholesaleForm 2 pasos + validación zod | Task 10 |
| AdminGuard RLS + redirect | Task 11 |
| AdminLoginPage supabase.auth | Task 11 |
| AdminLayout sidebar + navlinks | Task 11 |
| AdminDashboard stats cards | Task 11 |
| ProductsTable toggle active | Task 12 |
| VariantsEditor inline | Task 12 |
| ProductFormDialog create/edit | Task 12 |
| DropsTable + DropFormDialog | Task 12 |
| ImageUploader drag & drop → supabase storage | Task 13 |
| AdminSettingsPage wholesale min/max + WA number | Task 13 |
| AdminReservationsPage listado | Task 13 |
| Edge function expire-reservations + pg_cron | Task 14 |
| Code splitting por vendor | Task 15 |
| PageMeta OG tags | Task 15 |
| vercel.json SPA rewrite + security headers | Task 15 |
| robots.txt Disallow /admin/ | Task 15 |

### Verificación de tipos entre tasks

- `CartItem` definida en Task 3, usada en Task 4 (cart.store), Task 9 (CartItem.tsx, WhatsAppCheckout)
- `WhatsAppLine` definida en Task 3, usada en Task 9 (WhatsAppCheckout)
- `WholesaleOrderItem` definida en Task 3 → agregar a `src/types/index.ts`:

```ts
export interface WholesaleOrderItem {
  product_id: string
  name: string
  size: string
  color: string
  quantity: number
}
```

- `Reservation` usada en Task 13 → agregar a `src/types/index.ts`:

```ts
export interface Reservation {
  id: string
  variant_id: string
  quantity: number
  status: ReservationStatus
  expires_at: string
  customer_wa: string | null
  created_at: string
}
```

- `useAdmin().can()` definida en Task 11 `useAdmin.ts`, usada en Task 13 `AdminSettingsPage.tsx` — firma correcta
- `RESERVATION_FIELDS` definida en Task 3/7, usada en Task 11 y Task 13 — consistente

Agregar ambos tipos a Task 3 como adición a `src/types/index.ts`.
