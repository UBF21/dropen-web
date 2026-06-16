# Checkout Flow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el botón directo de WhatsApp con un wizard de checkout de 3 pasos que recolecta datos del cliente, crea un pedido en BD, muestra una animación de ticket de éxito y provee una página de detalle pública en `/pedido/:id`.

**Architecture:** El wizard recolecta datos en 3 pasos (personal → dirección → confirmar), almacenados en Zustand + sessionStorage. En el paso 3, `createReservations()` + `createOrder()` se llaman secuencialmente; el éxito muestra `CheckoutSuccess` (~3.5s animación ticket) y redirige a `/pedido/:id`. Esta página es pública, muestra todos los datos del pedido con un barcode Code128 escaneable (negro/blanco estándar en contenedor dorado animado). El botón de WhatsApp vive en `/pedido/:id`.

**Tech Stack:** React 19, Vite, Tailwind v4, Zustand, Supabase (PostgreSQL), framer-motion v11, react-hook-form v7 + zod v3 + @hookform/resolvers (ya instalados), jsbarcode v3 (ya instalado), @googlemaps/js-api-loader (instalar), CSS keyframes (animación ticket).

**Spec:** `docs/superpowers/specs/2026-06-15-checkout-flow-design.md`

---

## Prerequisitos antes de empezar

```bash
npm install @googlemaps/js-api-loader
npm install --save-dev @types/google.maps
```

Agregar a `.env.local`:
```
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
```

En Google Cloud Console, habilitar: **Maps JavaScript API** y **Places API**.

---

## File structure

**Nuevos:**
- `supabase/migrations/014_orders.sql`
- `src/lib/orders.ts`
- `src/lib/__tests__/orders.test.ts`
- `src/store/order.store.ts`
- `src/components/checkout/steps/Step1Personal.tsx`
- `src/components/checkout/steps/Step2Address.tsx`
- `src/components/checkout/steps/Step3Confirm.tsx`
- `src/components/checkout/CheckoutProgress.tsx`
- `src/components/checkout/CheckoutSuccess.tsx`
- `src/pages/CheckoutPage.tsx`
- `src/pages/OrderDetailPage.tsx`

**Modificados:**
- `src/types/index.ts`
- `src/lib/whatsapp.ts`
- `src/router.tsx`
- `src/components/checkout/WhatsAppCheckout.tsx`

---

### Task 1: DB Migration — tabla orders

**Files:**
- Create: `supabase/migrations/014_orders.sql`

- [ ] **Step 1: Escribir la migración**

Crear `supabase/migrations/014_orders.sql`:

```sql
-- 014_orders.sql
-- Tabla de pedidos con datos del cliente, snapshot del carrito y links a reservations

CREATE TABLE orders (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  reference       TEXT        NOT NULL UNIQUE,

  -- Datos del cliente
  first_name      TEXT        NOT NULL,
  last_name       TEXT        NOT NULL,
  doc_type        TEXT        NOT NULL CHECK (doc_type IN ('DNI', 'CE', 'Pasaporte')),
  doc_number      TEXT        NOT NULL,

  -- Dirección
  address         TEXT        NOT NULL,
  lat             DECIMAL(10, 7),
  lng             DECIMAL(10, 7),
  department      TEXT,
  province        TEXT,
  district        TEXT,
  country         TEXT        NOT NULL DEFAULT 'PE',

  -- Snapshot del carrito en el momento del pedido
  items           JSONB       NOT NULL DEFAULT '[]',
  total           DECIMAL(10, 2) NOT NULL,
  currency        TEXT        NOT NULL DEFAULT 'PEN',

  -- Estado
  status          TEXT        NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'confirmed', 'cancelled', 'expired')),

  -- Links a reservations
  reservation_ids UUID[]      NOT NULL DEFAULT '{}',

  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger updated_at (usa la función existente de 010_soft_delete.sql)
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer un pedido si conoce su UUID
CREATE POLICY "orders_public_read" ON orders
  FOR SELECT USING (true);

-- Anon puede crear pedidos (el checkout no requiere login)
CREATE POLICY "orders_anon_insert" ON orders
  FOR INSERT WITH CHECK (true);

-- Admin puede hacer todo
CREATE POLICY "orders_admin_all" ON orders
  FOR ALL USING (is_authenticated_admin());
```

- [ ] **Step 2: Aplicar la migración**

Usar la herramienta MCP `mcp__supabase__apply_migration` con el SQL de arriba y nombre `014_orders`.

- [ ] **Step 3: Verificar que la tabla existe**

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;
```

Resultado esperado: 20 columnas incluyendo id, reference, first_name, last_name, doc_type, doc_number, address, lat, lng, department, province, district, country, items, total, currency, status, reservation_ids, created_at, updated_at.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/014_orders.sql
git commit -m "feat(db): add orders table with customer data and RLS"
```

---

### Task 2: TypeScript types

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Agregar tipos Order al final de src/types/index.ts**

Agregar después de `WhatsAppLine`:

```typescript
export type DocType = 'DNI' | 'CE' | 'Pasaporte'
export type OrderStatus = 'pending' | 'confirmed' | 'cancelled' | 'expired'

export interface Order {
  id: string
  reference: string
  first_name: string
  last_name: string
  doc_type: DocType
  doc_number: string
  address: string
  lat: number | null
  lng: number | null
  department: string | null
  province: string | null
  district: string | null
  country: string
  items: CartItem[]
  total: number
  currency: string
  status: OrderStatus
  reservation_ids: string[]
  created_at: string
  updated_at: string
}

export interface CreateOrderInput {
  reference: string
  first_name: string
  last_name: string
  doc_type: DocType
  doc_number: string
  address: string
  lat: number | null
  lng: number | null
  department: string | null
  province: string | null
  district: string | null
  country: string
  items: CartItem[]
  total: number
  currency: string
  reservation_ids: string[]
}
```

- [ ] **Step 2: Verificar que TypeScript compila**

```bash
npx tsc --noEmit
```

Resultado esperado: 0 errores.

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(types): add Order, CreateOrderInput, DocType, OrderStatus"
```

---

### Task 3: src/lib/orders.ts

**Files:**
- Create: `src/lib/orders.ts`
- Create: `src/lib/__tests__/orders.test.ts`

- [ ] **Step 1: Escribir el test fallido**

Crear `src/lib/__tests__/orders.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createOrder, getOrder } from '../orders'

const mockSingle = vi.fn()
const mockSelectChain = vi.fn(() => ({ single: mockSingle }))
const mockInsert = vi.fn(() => ({ select: mockSelectChain }))
const mockEq = vi.fn(() => ({ single: mockSingle }))
const mockSelectFrom = vi.fn(() => ({ eq: mockEq }))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'orders') {
        return { insert: mockInsert, select: mockSelectFrom }
      }
      return {}
    }),
  },
}))

const BASE_INPUT = {
  reference: 'DRP-ABC12345',
  first_name: 'Felipe',
  last_name: 'Montenegro',
  doc_type: 'DNI' as const,
  doc_number: '74521803',
  address: 'Av. Javier Prado 1520, Miraflores',
  lat: -12.0953,
  lng: -77.0278,
  department: 'Lima',
  province: 'Lima',
  district: 'Miraflores',
  country: 'PE',
  items: [],
  total: 359.0,
  currency: 'PEN',
  reservation_ids: ['uuid-1'],
}

describe('createOrder', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns success with order when insert succeeds', async () => {
    const order = { id: 'order-uuid', ...BASE_INPUT }
    mockSingle.mockResolvedValue({ data: order, error: null })

    const result = await createOrder(BASE_INPUT)

    expect(result.success).toBe(true)
    expect(result.order?.reference).toBe('DRP-ABC12345')
  })

  it('returns error when supabase insert fails', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'DB error' } })

    const result = await createOrder(BASE_INPUT)

    expect(result.success).toBe(false)
    expect(result.error).toBe('DB error')
  })
})

describe('getOrder', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns order data when found', async () => {
    const order = { id: 'order-uuid', reference: 'DRP-ABC12345' }
    mockSingle.mockResolvedValue({ data: order, error: null })

    const result = await getOrder('order-uuid')

    expect(result?.reference).toBe('DRP-ABC12345')
  })

  it('returns null when not found', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } })

    const result = await getOrder('missing-id')

    expect(result).toBeNull()
  })
})
```

- [ ] **Step 2: Verificar que el test falla**

```bash
npx vitest run src/lib/__tests__/orders.test.ts
```

Resultado esperado: FAIL — "Cannot find module '../orders'"

- [ ] **Step 3: Crear src/lib/orders.ts**

```typescript
import { supabase } from './supabase'
import type { Order, CreateOrderInput } from '@/types'

export interface CreateOrderResult {
  success: boolean
  order?: Order
  error?: string
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const { data, error } = await supabase
    .from('orders')
    .insert(input)
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, order: data as Order }
}

export async function getOrder(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Order
}
```

- [ ] **Step 4: Verificar que el test pasa**

```bash
npx vitest run src/lib/__tests__/orders.test.ts
```

Resultado esperado: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/orders.ts src/lib/__tests__/orders.test.ts
git commit -m "feat(lib): add orders lib with createOrder and getOrder"
```

---

### Task 4: order.store.ts — estado del wizard

**Files:**
- Create: `src/store/order.store.ts`

- [ ] **Step 1: Crear src/store/order.store.ts**

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { DocType } from '@/types'

interface OrderStore {
  // Paso 1
  firstName: string
  lastName: string
  docType: DocType
  docNumber: string
  // Paso 2
  address: string
  lat: number | null
  lng: number | null
  department: string
  province: string
  district: string
  country: string
  // Wizard
  step: 1 | 2 | 3
  // Resultado
  orderId: string | null

  setStep: (step: 1 | 2 | 3) => void
  setPersonal: (data: { firstName: string; lastName: string; docType: DocType; docNumber: string }) => void
  setAddress: (data: {
    address: string
    lat: number | null
    lng: number | null
    department: string
    province: string
    district: string
    country: string
  }) => void
  setOrderId: (id: string) => void
  reset: () => void
}

const INITIAL_STATE = {
  firstName: '', lastName: '', docType: 'DNI' as DocType, docNumber: '',
  address: '', lat: null, lng: null, department: '', province: '', district: '', country: 'PE',
  step: 1 as const, orderId: null,
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,
      setStep: (step) => set({ step }),
      setPersonal: (data) => set(data),
      setAddress: (data) => set(data),
      setOrderId: (orderId) => set({ orderId }),
      reset: () => set(INITIAL_STATE),
    }),
    {
      name: 'dropen-checkout',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Resultado esperado: 0 errores.

- [ ] **Step 3: Commit**

```bash
git add src/store/order.store.ts
git commit -m "feat(store): add order store for checkout wizard state"
```

---

### Task 5: Actualizar buildWhatsAppMessage

**Files:**
- Modify: `src/lib/whatsapp.ts`

- [ ] **Step 1: Agregar buildOrderWhatsAppMessage a src/lib/whatsapp.ts**

Mantener las funciones existentes intactas. Agregar al final del archivo:

```typescript
interface OrderMessageParams {
  docType: string
  docNumber: string
  firstName: string
  lastName: string
  orderId: string
  reference: string
}

export function buildOrderWhatsAppMessage(params: OrderMessageParams): string {
  const { docNumber, firstName, lastName, orderId } = params
  const baseUrl = window.location.origin
  return `${docNumber} - ${firstName} ${lastName}\n${baseUrl}/pedido/${orderId}`
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Resultado esperado: 0 errores.

- [ ] **Step 3: Commit**

```bash
git add src/lib/whatsapp.ts
git commit -m "feat(lib): add buildOrderWhatsAppMessage with doc+name+url format"
```

---

### Task 6: Step1Personal — datos personales

**Files:**
- Create: `src/components/checkout/steps/Step1Personal.tsx`

- [ ] **Step 1: Crear Step1Personal.tsx**

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useOrderStore } from '@/store/order.store'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { DocType } from '@/types'

const DOC_TYPES: DocType[] = ['DNI', 'CE', 'Pasaporte']

const DOC_PLACEHOLDERS: Record<DocType, string> = {
  DNI: '8 dígitos',
  CE: '9 dígitos',
  Pasaporte: '9–12 caracteres',
}

const schema = z
  .object({
    firstName: z.string().min(2, 'Mínimo 2 caracteres').max(50),
    lastName:  z.string().min(2, 'Mínimo 2 caracteres').max(50),
    docType:   z.enum(['DNI', 'CE', 'Pasaporte'] as const),
    docNumber: z.string().min(1, 'Campo requerido'),
  })
  .superRefine((data, ctx) => {
    const { docType, docNumber } = data
    if (docType === 'DNI') {
      if (!/^\d{8}$/.test(docNumber))
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['docNumber'], message: 'DNI debe tener exactamente 8 dígitos' })
    } else if (docType === 'CE') {
      if (!/^\d{9}$/.test(docNumber))
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['docNumber'], message: 'CE debe tener exactamente 9 dígitos' })
    } else if (docType === 'Pasaporte') {
      if (!/^[A-Za-z0-9]{9,12}$/.test(docNumber))
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['docNumber'], message: 'Pasaporte: 9–12 caracteres alfanuméricos' })
    }
  })

type FormValues = z.infer<typeof schema>

export default function Step1Personal() {
  const { firstName, lastName, docType, docNumber, setPersonal, setStep } = useOrderStore()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName, lastName, docType, docNumber },
  })

  const watchedDocType = form.watch('docType')

  function onSubmit(values: FormValues) {
    setPersonal(values)
    setStep(2)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="firstName" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] uppercase tracking-[3px] text-text-muted">Nombre</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Felipe"
                  className="rounded-none border-border bg-surface text-text-primary focus-visible:ring-0 focus-visible:border-accent" />
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )} />

          <FormField control={form.control} name="lastName" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] uppercase tracking-[3px] text-text-muted">Apellido</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Montenegro"
                  className="rounded-none border-border bg-surface text-text-primary focus-visible:ring-0 focus-visible:border-accent" />
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="docType" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-[10px] uppercase tracking-[3px] text-text-muted block mb-2">
              Tipo de documento
            </FormLabel>
            <FormControl>
              <div className="flex border border-border">
                {DOC_TYPES.map((type) => (
                  <button key={type} type="button"
                    onClick={() => { field.onChange(type); form.setValue('docNumber', '') }}
                    className={`flex-1 py-2.5 text-[10px] tracking-widest uppercase transition-colors
                      ${field.value === type
                        ? 'bg-accent text-background font-semibold'
                        : 'bg-surface text-text-muted hover:text-text-primary'}`}>
                    {type}
                  </button>
                ))}
              </div>
            </FormControl>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )} />

        <FormField control={form.control} name="docNumber" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-[10px] uppercase tracking-[3px] text-text-muted">
              Número de {watchedDocType}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={DOC_PLACEHOLDERS[watchedDocType]}
                inputMode={watchedDocType === 'Pasaporte' ? 'text' : 'numeric'}
                maxLength={watchedDocType === 'DNI' ? 8 : watchedDocType === 'CE' ? 9 : 12}
                className="rounded-none border-border bg-surface text-text-primary focus-visible:ring-0 focus-visible:border-accent"
              />
            </FormControl>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )} />

        <Button type="submit"
          className="w-full rounded-none bg-accent text-background hover:bg-accent/90 py-3 text-[11px] tracking-[3px] uppercase font-semibold">
          Continuar
        </Button>
      </form>
    </Form>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Resultado esperado: 0 errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/checkout/steps/Step1Personal.tsx
git commit -m "feat(checkout): add Step1Personal with doc type validation"
```

---

### Task 7: Step2Address — dirección + Google Maps

**Files:**
- Create: `src/components/checkout/steps/Step2Address.tsx`

**Prerequisito:** `npm install @googlemaps/js-api-loader && npm install --save-dev @types/google.maps`

- [ ] **Step 1: Instalar dependencias**

```bash
npm install @googlemaps/js-api-loader
npm install --save-dev @types/google.maps
```

- [ ] **Step 2: Crear Step2Address.tsx**

```typescript
import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { MapPin, Loader2 } from 'lucide-react'
import { useOrderStore } from '@/store/order.store'
import { Button } from '@/components/ui/button'

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ''

function extractComponent(
  components: google.maps.GeocoderAddressComponent[],
  type: string
): string {
  return components.find((c) => c.types.includes(type))?.long_name ?? ''
}

export default function Step2Address() {
  const { address: savedAddress, setAddress, setStep } = useOrderStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [mapsReady, setMapsReady] = useState(false)
  const [mapsError, setMapsError] = useState(false)
  const [selected, setSelected] = useState({
    address: savedAddress,
    lat: null as number | null,
    lng: null as number | null,
    department: '',
    province: '',
    district: '',
  })
  const [inputValue, setInputValue] = useState(savedAddress)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!MAPS_KEY) { setMapsError(true); return }
    const loader = new Loader({ apiKey: MAPS_KEY, version: 'weekly', libraries: ['places'] })
    loader.load().then(() => setMapsReady(true)).catch(() => setMapsError(true))
  }, [])

  useEffect(() => {
    if (!mapsReady || !inputRef.current) return

    const ac = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'pe' },
      fields: ['formatted_address', 'geometry', 'address_components'],
      types: ['address'],
    })

    ac.addListener('place_changed', () => {
      const place = ac.getPlace()
      if (!place.geometry?.location || !place.address_components) return
      const comps = place.address_components
      setSelected({
        address: place.formatted_address ?? '',
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        department: extractComponent(comps, 'administrative_area_level_1'),
        province:   extractComponent(comps, 'administrative_area_level_2'),
        district:   extractComponent(comps, 'locality') || extractComponent(comps, 'administrative_area_level_3'),
      })
      setError('')
    })
  }, [mapsReady])

  function handleContinue() {
    if (!selected.address) { setError('Seleccioná una dirección del listado'); return }
    if (selected.lat === null) { setError('Seleccioná una dirección de las sugerencias de Google Maps'); return }
    setAddress({ ...selected, country: 'PE' })
    setStep(3)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-[10px] uppercase tracking-[3px] text-text-muted">
          Dirección de entrega
        </label>

        {mapsError ? (
          <input
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); setSelected((s) => ({ ...s, address: e.target.value })) }}
            placeholder="Av. Javier Prado 1520, Miraflores, Lima"
            className="w-full h-10 px-3 border border-border bg-surface text-text-primary text-sm focus:outline-none focus:border-accent"
          />
        ) : (
          <div className="relative">
            <input
              ref={inputRef}
              defaultValue={savedAddress}
              placeholder={mapsReady ? 'Buscar dirección en Perú...' : 'Cargando Maps...'}
              disabled={!mapsReady}
              className="w-full h-10 px-3 border border-border bg-surface text-text-primary text-sm focus:outline-none focus:border-accent disabled:opacity-50"
            />
            {!mapsReady && !mapsError && (
              <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-text-muted" />
            )}
          </div>
        )}

        {error && <p className="text-[10px] text-destructive">{error}</p>}
      </div>

      {selected.lat !== null && (
        <div className="border border-border bg-surface p-3 flex flex-col gap-1.5">
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
            <span className="text-[11px] text-text-primary">{selected.address}</span>
          </div>
          {selected.district && (
            <p className="text-[10px] text-text-muted pl-5">
              {selected.district}{selected.province ? ` · ${selected.province}` : ''}{selected.department ? ` · ${selected.department}` : ''}
            </p>
          )}
          <p className="text-[9px] text-text-muted font-mono pl-5">
            {selected.lat?.toFixed(6)}, {selected.lng?.toFixed(6)}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => setStep(1)}
          className="flex-1 rounded-none border-border text-text-muted text-[11px] tracking-[2px] uppercase">
          Atrás
        </Button>
        <Button type="button" onClick={handleContinue}
          className="flex-1 rounded-none bg-accent text-background hover:bg-accent/90 py-3 text-[11px] tracking-[3px] uppercase font-semibold">
          Continuar
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Resultado esperado: 0 errores.

- [ ] **Step 4: Commit**

```bash
git add src/components/checkout/steps/Step2Address.tsx
git commit -m "feat(checkout): add Step2Address with Google Maps Places autocomplete"
```

---

### Task 8: Step3Confirm — confirmación y creación del pedido

**Files:**
- Create: `src/components/checkout/steps/Step3Confirm.tsx`

- [ ] **Step 1: Crear Step3Confirm.tsx**

```typescript
import { useState } from 'react'
import { Loader2, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { useOrderStore } from '@/store/order.store'
import { useCartStore, useCartTotal } from '@/store/cart.store'
import { useSiteCurrency } from '@/hooks/useSiteCurrency'
import { createReservations } from '@/lib/reservations'
import { createOrder } from '@/lib/orders'
import { Button } from '@/components/ui/button'

interface Props {
  onSuccess: (orderId: string) => void
}

export default function Step3Confirm({ onSuccess }: Props) {
  const store = useOrderStore()
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const total = useCartTotal()
  const currency = useSiteCurrency()
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    if (items.length === 0) return
    setLoading(true)

    const reservationResult = await createReservations(items)
    if (!reservationResult.success) {
      toast.error(`Error al reservar: ${reservationResult.error}`)
      setLoading(false)
      return
    }

    const orderResult = await createOrder({
      reference:       reservationResult.reference,
      first_name:      store.firstName,
      last_name:       store.lastName,
      doc_type:        store.docType,
      doc_number:      store.docNumber,
      address:         store.address,
      lat:             store.lat,
      lng:             store.lng,
      department:      store.department || null,
      province:        store.province || null,
      district:        store.district || null,
      country:         store.country,
      items,
      total,
      currency:        currency.code,
      reservation_ids: reservationResult.reservationIds,
    })

    if (!orderResult.success) {
      toast.error(`Error al crear el pedido: ${orderResult.error}`)
      setLoading(false)
      return
    }

    clearCart()
    store.setOrderId(orderResult.order!.id)
    onSuccess(orderResult.order!.id)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Productos */}
      <div>
        <p className="text-[9px] uppercase tracking-[3px] text-text-muted mb-3">Productos</p>
        <div className="flex flex-col">
          {items.map((item) => (
            <div key={item.variantId}
              className="flex items-center gap-3 py-3 border-b border-border last:border-b-0">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.productName}
                  className="w-10 h-12 object-cover object-top border border-border flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-text-primary truncate">
                  {item.productName}
                </p>
                <p className="text-[10px] text-text-muted">
                  Talla {item.size} · {item.color} · ×{item.quantity}
                </p>
              </div>
              <span className="text-[12px] font-semibold text-text-primary flex-shrink-0">
                {currency.formatShort(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-3 font-bold text-[13px] text-text-primary">
          <span>Total</span>
          <span>{currency.formatShort(total)}</span>
        </div>
      </div>

      {/* Datos del cliente */}
      <div className="border border-border bg-surface p-4 flex flex-col gap-3">
        <p className="text-[9px] uppercase tracking-[3px] text-text-muted">Datos del cliente</p>
        <div className="grid grid-cols-2 gap-3 text-[11px]">
          <div>
            <p className="text-[9px] uppercase tracking-[2px] text-text-muted mb-0.5">Nombre</p>
            <p className="text-text-primary">{store.firstName} {store.lastName}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[2px] text-text-muted mb-0.5">{store.docType}</p>
            <p className="text-text-primary font-mono">{store.docNumber}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 text-[11px]">
          <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-text-primary">{store.address}</p>
            {store.district && (
              <p className="text-[10px] text-text-muted mt-0.5">
                {store.district}{store.province ? ` · ${store.province}` : ''}{store.department ? ` · ${store.department}` : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => store.setStep(2)}
          className="flex-1 rounded-none border-border text-text-muted text-[11px] tracking-[2px] uppercase">
          Atrás
        </Button>
        <Button type="button" onClick={handleConfirm}
          disabled={loading || items.length === 0}
          className="flex-1 rounded-none bg-accent text-background hover:bg-accent/90 py-3 text-[11px] tracking-[3px] uppercase font-semibold gap-2">
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" />Procesando...</>
            : 'Confirmar reserva'}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Resultado esperado: 0 errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/checkout/steps/Step3Confirm.tsx
git commit -m "feat(checkout): add Step3Confirm with createReservations + createOrder"
```

---

### Task 9: CheckoutPage wizard + CheckoutProgress

**Files:**
- Create: `src/components/checkout/CheckoutProgress.tsx`
- Create: `src/pages/CheckoutPage.tsx`

- [ ] **Step 1: Crear CheckoutProgress.tsx**

```typescript
interface Props {
  step: 1 | 2 | 3
}

const STEPS = [
  { n: 1 as const, label: 'Datos' },
  { n: 2 as const, label: 'Dirección' },
  { n: 3 as const, label: 'Confirmar' },
]

export default function CheckoutProgress({ step }: Props) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center flex-1">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold transition-colors
              ${step >= s.n ? 'bg-accent text-background' : 'border border-border text-text-muted'}`}>
              {step > s.n ? '✓' : s.n}
            </div>
            <span className={`text-[9px] uppercase tracking-[2px] whitespace-nowrap
              ${step >= s.n ? 'text-accent' : 'text-text-muted'}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px mb-4 mx-1 transition-colors ${step > s.n ? 'bg-accent' : 'bg-border'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Crear CheckoutPage.tsx**

```typescript
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cart.store'
import { useOrderStore } from '@/store/order.store'
import CheckoutProgress from '@/components/checkout/CheckoutProgress'
import Step1Personal from '@/components/checkout/steps/Step1Personal'
import Step2Address from '@/components/checkout/steps/Step2Address'
import Step3Confirm from '@/components/checkout/steps/Step3Confirm'
import CheckoutSuccess from '@/components/checkout/CheckoutSuccess'

type Phase = 'form' | 'success'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const { step, orderId, reset } = useOrderStore()
  const [phase, setPhase] = useState<Phase>('form')
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (items.length === 0 && phase === 'form' && !orderId) {
      navigate('/', { replace: true })
    }
  }, [items, phase, orderId, navigate])

  function handleSuccess(id: string) {
    setCreatedOrderId(id)
    setPhase('success')
  }

  function handleAnimationEnd() {
    reset()
    navigate(`/pedido/${createdOrderId}`, { replace: true })
  }

  if (phase === 'success' && createdOrderId) {
    return <CheckoutSuccess orderId={createdOrderId} onEnd={handleAnimationEnd} />
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <p className="text-[9px] uppercase tracking-[4px] text-text-muted mb-1">Dropen</p>
          <h1 className="text-xl font-black uppercase tracking-[4px] text-text-primary">Checkout</h1>
        </div>
        <CheckoutProgress step={step} />
        {step === 1 && <Step1Personal />}
        {step === 2 && <Step2Address />}
        {step === 3 && <Step3Confirm onSuccess={handleSuccess} />}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Resultado esperado: 0 errores.

- [ ] **Step 4: Commit**

```bash
git add src/components/checkout/CheckoutProgress.tsx src/pages/CheckoutPage.tsx
git commit -m "feat(checkout): add CheckoutPage wizard with step progress"
```

---

### Task 10: CheckoutSuccess — animación ticket

**Files:**
- Create: `src/components/checkout/CheckoutSuccess.tsx`

La animación dura ~3.8s y llama `onEnd()` automáticamente. Implementada con CSS keyframes (sin framer-motion) para mayor control de timing. Replica el diseño ticket-v5.

- [ ] **Step 1: Crear CheckoutSuccess.tsx**

```typescript
import { useEffect, useRef, useState } from 'react'
import { useCartStore } from '@/store/cart.store'

interface Props {
  orderId: string
  onEnd: () => void
}

const CSS = `
@keyframes t-drop  {0%{opacity:0;transform:translateY(-28px) scaleY(.94)}55%{transform:translateY(5px) scaleY(1.01)}100%{opacity:1;transform:translateY(0) scaleY(1)}}
@keyframes t-head  {0%{top:0;opacity:0}3%{opacity:1}96%{opacity:1}100%{top:100%;opacity:0}}
@keyframes t-in    {from{opacity:0}to{opacity:1}}
@keyframes t-dash  {from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes t-type  {from{width:0}to{width:100%}}
@keyframes t-bars  {from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0% 0 0)}}
@keyframes t-glow  {from{left:-6%;opacity:1}to{left:108%;opacity:0}}
@keyframes t-stamp {
  0%  {opacity:0;transform:translateX(-42%) rotate(-14deg) scale(2.1) translateY(-16px)}
  38% {opacity:1;transform:translateX(-42%) rotate(-14deg) scale(.88) translateY(0)}
  58% {transform:translateX(-42%) rotate(-14deg) scale(1.06)}
  73% {transform:translateX(-42%) rotate(-14deg) scale(.96)}
  100%{opacity:1;transform:translateX(-42%) rotate(-14deg) scale(1) translateY(0)}
}
@keyframes t-flash {0%{opacity:0}20%{opacity:.1}100%{opacity:0}}
`

const BARS = [
  2,1,2,2,2,2, 1,2,2,3,1,1, 3,1,2,1,2,2, 2,2,1,1,3,1,
  2,3,1,2,1,1, 1,2,3,2,2,1, 1,1,2,3,2,1, 2,1,1,2,3,1,
  1,3,2,1,2,1, 2,1,3,1,1,2, 3,2,1,1,1,2, 2,3,1,1,2,1,
]

export default function CheckoutSuccess({ orderId, onEnd }: Props) {
  const items = useCartStore((s) => s.items)
  const item = items[0]
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const [date] = useState(() =>
    new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' })
  )
  const reference = `DRP-${orderId.substring(0, 8).toUpperCase()}`

  useEffect(() => {
    if (!document.getElementById('__t_css')) {
      const s = document.createElement('style')
      s.id = '__t_css'
      s.textContent = CSS
      document.head.appendChild(s)
    }
    timerRef.current = setTimeout(onEnd, 3800)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [onEnd])

  const a = (name: string, dur: string, delay: string, extra = ''): React.CSSProperties => ({
    animation: `${name} ${dur} ease forwards`,
    animationDelay: delay,
    opacity: 0,
    ...Object.fromEntries(extra.split(';').filter(Boolean).map((e) => {
      const [k, v] = e.split(':')
      return [k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v.trim()]
    })),
  })

  const dash: React.CSSProperties = {
    height: 1,
    background: 'repeating-linear-gradient(90deg,#ccc 0,#ccc 4px,transparent 4px,transparent 8px)',
    margin: '11px 0',
    transformOrigin: 'left',
    transform: 'scaleX(0)',
  }

  const total = (item?.price ?? 0) * (item?.quantity ?? 1)

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{
        width: 264, background: '#f4efe6', padding: '20px 20px 34px', position: 'relative',
        animation: 't-drop .5s cubic-bezier(.22,1,.36,1) forwards',
        clipPath: 'polygon(0 0,100% 0,100% calc(100% - 10px),96% 100%,91% calc(100% - 7px),86% 100%,81% calc(100% - 8px),76% 100%,71% calc(100% - 6px),66% 100%,61% calc(100% - 8px),56% 100%,51% calc(100% - 7px),46% 100%,41% calc(100% - 8px),36% 100%,31% calc(100% - 6px),26% 100%,21% calc(100% - 8px),16% 100%,11% calc(100% - 7px),6% 100%,2% calc(100% - 8px),0 100%)',
        boxShadow: '0 28px 80px rgba(0,0,0,.8)',
      }}>
        {/* Printer head */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 2, zIndex: 10,
          background: 'linear-gradient(90deg,transparent,#c8a96e 30%,#ffe4a0 50%,#c8a96e 70%,transparent)',
          boxShadow: '0 0 10px 3px #c8a96e88',
          animation: 't-head 3100ms linear forwards', animationDelay: '0.38s', opacity: 0 }} />

        {/* Flash on stamp impact */}
        <div style={{ position: 'absolute', inset: 0, background: '#b91c1c', opacity: 0, zIndex: 15, pointerEvents: 'none',
          animation: 't-flash .35s ease forwards', animationDelay: '2.05s' }} />

        {/* Stamp RESERVADO */}
        <div style={{ position: 'absolute', top: 90, left: '50%', zIndex: 20, pointerEvents: 'none',
          opacity: 0, animation: 't-stamp .5s cubic-bezier(.22,1,.36,1) forwards', animationDelay: '1.9s' }}>
          <div style={{ border: '3px solid #b91c1c', background: 'rgba(185,28,28,.07)', padding: '7px 18px',
            boxShadow: 'inset 0 0 0 1.5px rgba(185,28,28,.18)' }}>
            <span style={{ fontSize: 15, fontWeight: 900, letterSpacing: 6, textTransform: 'uppercase', color: '#b91c1c' }}>
              Reservado
            </span>
          </div>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16, ...a('t-in', '.18s', '.44s') }}>
          <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: 5, color: '#111', textTransform: 'uppercase' }}>DROPEN</span>
          <span style={{ fontSize: 8, color: '#aaa', fontFamily: 'monospace' }}>{date}</span>
        </div>

        <div style={{ ...dash, animation: 't-dash .28s ease forwards', animationDelay: '.64s' }} />

        {/* Product */}
        <p style={{ fontSize: 7, color: '#bbb', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 9, ...a('t-in', '.14s', '.78s') }}>
          Detalle del pedido
        </p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', ...a('t-in', '.14s', '.8s') }}>
          {item?.imageUrl
            ? <img src={item.imageUrl} alt="" style={{ width: 48, height: 60, objectFit: 'cover', objectPosition: 'top', border: '1px solid #ddd8ce', flexShrink: 0 }} />
            : <div style={{ width: 48, height: 60, background: '#e5dfd4', border: '1px solid #ddd8ce', flexShrink: 0 }} />}
          <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#111', letterSpacing: 1.5, textTransform: 'uppercase',
              overflow: 'hidden', whiteSpace: 'nowrap', width: 0, marginBottom: 5,
              animation: 't-type .42s steps(21,end) forwards', animationDelay: '.92s' }}>
              {item?.productName ?? 'Producto'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, ...a('t-in', '.16s', '1.38s') }}>
              <span style={{ fontSize: 8, color: '#999' }}>Talla {item?.size} · {item?.color} · ×{item?.quantity}</span>
              <span style={{ fontSize: 12, fontWeight: 900, color: '#111', fontFamily: 'Courier New', whiteSpace: 'nowrap' }}>
                S/ {total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div style={{ ...dash, animation: 't-dash .25s ease forwards', animationDelay: '1.56s' }} />

        {/* Totals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8.5, color: '#888', letterSpacing: .5, ...a('t-in', '.12s', '1.7s') }}>
            <span>Subtotal</span><span>S/ {total.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8.5, color: '#888', letterSpacing: .5, ...a('t-in', '.12s', '1.83s') }}>
            <span>Envío</span><span>Por coordinar</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 900, color: '#111',
            letterSpacing: 1, marginTop: 3, paddingTop: 5, borderTop: '1px solid #d0ccc4', ...a('t-in', '.15s', '1.98s') }}>
            <span>TOTAL</span>
            <span style={{ fontFamily: 'Courier New' }}>S/ {total.toFixed(2)}</span>
          </div>
        </div>

        <div style={{ ...dash, animation: 't-dash .25s ease forwards', animationDelay: '2.3s' }} />

        {/* Barcode */}
        <p style={{ fontSize: 7, color: '#bbb', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 9, ...a('t-in', '.12s', '2.44s') }}>
          Código de reserva
        </p>
        <div style={{ background: '#fff', padding: '8px 8px 5px', position: 'relative', overflow: 'hidden', ...a('t-in', '.12s', '2.5s') }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: 48,
            clipPath: 'inset(0 100% 0 0)', animation: 't-bars .85s ease forwards', animationDelay: '2.6s' }}>
            {BARS.map((w, i) => (
              <div key={i} style={{ width: w * 2.2, height: i % 2 === 0 ? 28 + w * 5 + (i % 7) * 1.5 : 0,
                background: i % 2 === 0 ? '#111' : 'transparent', flexShrink: 0, alignSelf: 'flex-end' }} />
            ))}
          </div>
          <div style={{ position: 'absolute', top: 0, bottom: 0, width: 4,
            background: 'linear-gradient(180deg,transparent,#c8a96e 40%,#ffe4a0 50%,#c8a96e 60%,transparent)',
            boxShadow: '0 0 8px 4px #c8a96e66',
            animation: 't-glow .55s ease forwards', animationDelay: '3.0s', opacity: 0, left: '-6%' }} />
        </div>
        <div style={{ fontSize: 8, color: '#555', textAlign: 'center', marginTop: 4, letterSpacing: 2.5, fontFamily: 'Courier New', ...a('t-in', '.18s', '3.2s') }}>
          {reference}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Resultado esperado: 0 errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/checkout/CheckoutSuccess.tsx
git commit -m "feat(checkout): add CheckoutSuccess ticket animation"
```

---

### Task 11: OrderDetailPage — /pedido/:id

**Files:**
- Create: `src/pages/OrderDetailPage.tsx`

Layout split: imagen del producto a la izquierda (full height en desktop), datos a la derecha. Barcode: Code128 negro/blanco estándar (escaneable con láser y cámara) en contenedor dorado con línea scan animada.

- [ ] **Step 1: Crear OrderDetailPage.tsx**

```typescript
import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import JsBarcode from 'jsbarcode'
import { getOrder } from '@/lib/orders'
import { buildOrderWhatsAppMessage, buildWhatsAppUrl } from '@/lib/whatsapp'
import { useSiteCurrency } from '@/hooks/useSiteCurrency'
import type { Order } from '@/types'

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? ''

const SCAN_CSS = `@keyframes scan-order{0%{top:10%;opacity:0}10%{opacity:1}90%{opacity:1}100%{top:90%;opacity:0}}`

function OrderBarcode({ reference }: { reference: string }) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return
    try {
      JsBarcode(svgRef.current, reference, {
        format: 'CODE128', width: 1.6, height: 44,
        displayValue: false, background: '#ffffff', lineColor: '#000000', margin: 4,
      })
    } catch { /* invalid chars — noop */ }
  }, [reference])

  return (
    <div style={{ border: '1px solid #3a2e1a', background: '#0a0a0a', padding: '12px 12px 8px', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 2, pointerEvents: 'none', zIndex: 10,
        background: 'linear-gradient(90deg,transparent,#c8a96e55 20%,#c8a96e 50%,#c8a96e55 80%,transparent)',
        boxShadow: '0 0 6px 2px #c8a96e44',
        animation: 'scan-order 2.5s ease-in-out infinite',
      }} />
      <div style={{ background: '#ffffff', padding: '8px 4px 4px' }}>
        <svg ref={svgRef} style={{ width: '100%', display: 'block' }} aria-label={`Código de reserva: ${reference}`} />
      </div>
      <p style={{ fontFamily: 'Courier New', fontSize: 9, color: '#c8a96e88', textAlign: 'center', marginTop: 6, letterSpacing: 3 }}>
        {reference}
      </p>
    </div>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const currency = useSiteCurrency()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!document.getElementById('__scan_css')) {
      const s = document.createElement('style')
      s.id = '__scan_css'
      s.textContent = SCAN_CSS
      document.head.appendChild(s)
    }
  }, [])

  useEffect(() => {
    if (!id) return
    getOrder(id).then((data) => {
      if (!data) setNotFound(true)
      else setOrder(data)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    )
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-[11px] uppercase tracking-[3px] text-text-muted">Pedido no encontrado</p>
        <button onClick={() => navigate('/')}
          className="text-accent text-[11px] uppercase tracking-[2px]">
          Volver al inicio
        </button>
      </div>
    )
  }

  const firstItem = order.items[0]
  const waMessage = buildOrderWhatsAppMessage({
    docType: order.doc_type, docNumber: order.doc_number,
    firstName: order.first_name, lastName: order.last_name,
    orderId: order.id, reference: order.reference,
  })
  const waUrl = buildWhatsAppUrl(WA_NUMBER, waMessage)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl border border-[#1a1a1a] flex flex-col md:flex-row">

        {/* LEFT — imagen del producto */}
        <div className="md:w-[260px] md:flex-shrink-0 bg-[#0a0a0a] relative overflow-hidden min-h-[200px] md:min-h-0">
          {firstItem?.imageUrl ? (
            <img src={firstItem.imageUrl} alt={firstItem.productName}
              className="w-full h-full object-cover object-top opacity-85 md:absolute md:inset-0" />
          ) : (
            <div className="w-full h-full bg-[#111] flex items-center justify-center min-h-[200px]">
              <span className="text-4xl opacity-20">👟</span>
            </div>
          )}
          <div className="hidden md:block absolute inset-0"
            style={{ background: 'linear-gradient(to right,transparent 60%,#0e0e0e 100%)' }} />
          <p className="absolute top-5 left-5 text-[8px] text-accent tracking-[4px] uppercase hidden md:block"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
            Dropen · Reserva
          </p>
        </div>

        {/* RIGHT — datos */}
        <div className="flex-1 p-6 md:p-8 flex flex-col gap-0 bg-[#0e0e0e]">
          <p className="text-[11px] font-black tracking-[4px] text-accent uppercase font-mono mb-1">
            {order.reference}
          </p>
          <h1 className="text-base font-black tracking-[2px] text-[#f0ece4] uppercase leading-tight mb-2">
            {firstItem?.productName ?? 'Pedido'}
          </h1>

          {/* Status */}
          <div className="flex items-center gap-2 text-[9px] text-[#888] tracking-[2px] uppercase mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0"
              style={{ boxShadow: '0 0 5px #c8a96e' }} />
            Reserva pendiente de confirmación
          </div>

          <p className="text-[26px] font-black text-accent font-mono mb-5">
            {currency.formatShort(order.total)}
          </p>

          <div className="h-px bg-[#1a1a1a] mb-4" />

          {/* Grid datos cliente */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-3 mb-4">
            <div>
              <p className="text-[7px] text-[#444] tracking-[3px] uppercase mb-1">Cliente</p>
              <p className="text-[11px] text-[#999]">{order.first_name} {order.last_name}</p>
            </div>
            <div>
              <p className="text-[7px] text-[#444] tracking-[3px] uppercase mb-1">{order.doc_type}</p>
              <p className="text-[11px] text-[#999] font-mono">{order.doc_number}</p>
            </div>
            <div>
              <p className="text-[7px] text-[#444] tracking-[3px] uppercase mb-1">Talla / Color</p>
              <p className="text-[11px] text-[#999]">{firstItem?.size} · {firstItem?.color}</p>
            </div>
            <div>
              <p className="text-[7px] text-[#444] tracking-[3px] uppercase mb-1">Cantidad</p>
              <p className="text-[11px] text-[#999]">×{firstItem?.quantity}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[7px] text-[#444] tracking-[3px] uppercase mb-1">Dirección</p>
              <p className="text-[11px] text-[#999]">{order.address}</p>
              {order.district && (
                <p className="text-[10px] text-[#555] mt-0.5">
                  {order.district}{order.province ? ` · ${order.province}` : ''}{order.department ? ` · ${order.department}` : ''}
                </p>
              )}
            </div>
          </div>

          <div className="h-px bg-[#1a1a1a] mb-4" />

          <OrderBarcode reference={order.reference} />

          <a href={waUrl} target="_blank" rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 py-3 bg-[#0a1a0f] border border-[#1e3a2a] text-[#3eb863] text-[10px] tracking-[2px] uppercase hover:bg-[#0f2418] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#3eb863" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Confirmar vía WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Resultado esperado: 0 errores.

- [ ] **Step 3: Commit**

```bash
git add src/pages/OrderDetailPage.tsx
git commit -m "feat(pages): add OrderDetailPage with split layout and scannable barcode"
```

---

### Task 12: Router + WhatsAppCheckout → navigate a /checkout

**Files:**
- Modify: `src/router.tsx`
- Modify: `src/components/checkout/WhatsAppCheckout.tsx`

- [ ] **Step 1: Agregar rutas en src/router.tsx**

Agregar los imports lazy después de `WholesalePage`:

```typescript
const CheckoutPage    = lazy(() => import('@/pages/CheckoutPage'))
const OrderDetailPage = lazy(() => import('@/pages/OrderDetailPage'))
```

Agregar en el array `children` del layout público (después de `wholesale`):

```typescript
{ path: 'checkout',   element: withSuspense(CheckoutPage) },
{ path: 'pedido/:id', element: withSuspense(OrderDetailPage) },
```

- [ ] **Step 2: Reemplazar src/components/checkout/WhatsAppCheckout.tsx**

```typescript
import { useNavigate } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore, useCartTotal } from '@/store/cart.store'
import { useOrderStore } from '@/store/order.store'
import { useSiteCurrency } from '@/hooks/useSiteCurrency'

interface Props {
  onSuccess?: () => void
}

export default function WhatsAppCheckout({ onSuccess }: Props) {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const total = useCartTotal()
  const currency = useSiteCurrency()
  const reset = useOrderStore((s) => s.reset)

  function handleCheckout() {
    if (items.length === 0) return
    reset()
    onSuccess?.()
    navigate('/checkout')
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={items.length === 0}
      className="w-full bg-[#25D366] hover:bg-[#20b857] text-white py-4 text-sm tracking-wide rounded-none gap-2"
    >
      <MessageCircle className="w-4 h-4" />
      {`Reservar — ${currency.formatShort(total)}`}
    </Button>
  )
}
```

- [ ] **Step 3: Correr suite de tests completa**

```bash
npx vitest run
```

Resultado esperado: todos los tests pasan (incluyendo los existentes de WhatsAppCheckout.test.tsx — verificar que siguen pasando o actualizar mocks si hay cambios de firma).

- [ ] **Step 4: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Resultado esperado: 0 errores.

- [ ] **Step 5: Commit**

```bash
git add src/router.tsx src/components/checkout/WhatsAppCheckout.tsx
git commit -m "feat(router): add /checkout and /pedido/:id, wire WhatsAppCheckout to navigate"
```

---

## Testing del flujo completo

```bash
npm run dev
```

1. Agregar producto al carrito
2. Abrir CartDrawer → click "Reservar — S/ X.XX"
3. Verificar redirect a `/checkout`, paso 1
4. **Paso 1:** Nombre "Felipe", Apellido "Montenegro", DNI seleccionado
   - Probar DNI con 7 dígitos → debe mostrar error "exactamente 8 dígitos"
   - Escribir "74521803" → click Continuar
5. **Paso 2:** Escribir dirección en campo Maps, seleccionar sugerencia de Perú
   - Verificar que aparece el panel con dirección, distrito y coordenadas
   - Click Continuar
6. **Paso 3:** Verificar resumen de producto + datos del cliente
   - Click "Confirmar reserva" → debe mostrar loader
   - Verificar en Supabase: tabla `reservations` + tabla `orders` con fila nueva
7. Verificar que aparece animación ticket (~3.5s)
   - Ticket cae, printer head baja, producto, totales, sello RESERVADO, barcode
8. Verificar redirect automático a `/pedido/<uuid>`
9. En página de detalle: imagen producto a la izquierda, datos cliente a la derecha
10. Barcode negro/blanco con borde dorado y línea scan animada
11. Click "Confirmar vía WhatsApp" → se abre WhatsApp con mensaje:
    ```
    74521803 - Felipe Montenegro
    http://localhost:5173/pedido/<uuid>
    ```
