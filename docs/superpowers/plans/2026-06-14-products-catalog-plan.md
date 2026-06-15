# Products Catalog Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear la página `/productos` que lista todos los productos sin colección (`collection_id IS NULL`) con filtros avanzados server-side, paginación real, skeletons estructurados y animaciones premium.

**Architecture:** Dos funciones RPC en Supabase manejan el filtrado y la metadata. Un hook `useProductsCatalog` consume las RPCs y expone los resultados. `ProductsPage` persiste los filtros en URL search params para navegación shareable. Los componentes de filtro, grid y paginación son independientes entre sí.

**Tech Stack:** React 19 · TypeScript · Vite · Tailwind CSS v4 · framer-motion ^11 · Supabase (RPC) · react-router-dom v7 · radix-ui (Slider) · Vitest + @testing-library/react

---

## Convenciones del proyecto (leer antes de empezar)

- **Skeleton**: siempre `<Skeleton className="... bg-surface" />` (sobrescribe `bg-muted`)
- **Supabase client**: `import { supabase } from '@/lib/supabase'`
- **radix-ui**: import como `import { Slider as SliderPrimitive } from 'radix-ui'` (ver `src/components/ui/sheet.tsx`)
- **Framer-motion mock**: `src/test/mocks/framer-motion.tsx` — importar como primera línea en tests que usen framer-motion
- **Supabase mock**: `src/test/mocks/supabase.ts` — tiene `mockFrom`, `mockRpc` (agregado en Task 2)
- **Build**: `npm run build` | **Tests**: `npm run test:run`
- **Node en Windows**: si `npm` falla, usar `& "C:\Program Files\nodejs\npm.cmd"`
- **Commits**: Conventional Commits (`feat/fix/test/chore`)

## File Structure

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `supabase/migrations/011_products_catalog_rpc.sql` | Crear | 2 funciones SQL: `get_products_catalog` + `get_products_catalog_meta` |
| `src/hooks/useProductsCatalog.ts` | Crear | Tipos + hooks que llaman a las RPCs |
| `src/components/products/ProductsGridSkeleton.tsx` | Crear | 12 cards skeleton estructurado |
| `src/components/products/ProductsPagination.tsx` | Crear | Prev/next + páginas numeradas con ellipsis |
| `src/components/products/ProductsPriceSlider.tsx` | Crear | Slider dual precio con inputs numéricos |
| `src/components/products/ProductsGrid.tsx` | Crear | Grid 3/2 cols con CatalogProductCard + stagger animation |
| `src/components/products/ProductsFilterSheet.tsx` | Crear | Drawer con todos los filtros (talla, color, precio, stock) |
| `src/components/products/ProductsFilterBar.tsx` | Crear | Barra sticky: chips activos, botón filtros, sort, conteo |
| `src/pages/ProductsPage.tsx` | Crear | Página completa — orquesta filtros en URL + todos los componentes |
| `src/router.tsx` | Modificar | Agregar ruta lazy `/productos` → `ProductsPage` |
| `src/components/layout/Header.tsx` | Modificar | Agregar `Productos` entre Colecciones y Wholesale |
| `src/test/mocks/supabase.ts` | Modificar | Agregar `mockRpc` para tests del hook |
| `src/hooks/__tests__/useProductsCatalog.test.ts` | Crear | Tests del hook |
| `src/components/products/__tests__/ProductsGridSkeleton.test.tsx` | Crear | Test: renderiza 12 skeletons |
| `src/components/products/__tests__/ProductsPagination.test.tsx` | Crear | Tests de paginación |
| `src/components/products/__tests__/ProductsFilterBar.test.tsx` | Crear | Tests de la barra de filtros |

---

## Task 1: Migraciones SQL (RPCs de Supabase)

**Files:**
- Create: `supabase/migrations/011_products_catalog_rpc.sql`

- [ ] **Step 1: Crear el archivo de migración con las dos funciones**

Crear `supabase/migrations/011_products_catalog_rpc.sql`:

```sql
-- Función 1: Metadata estática del catálogo (precio min/max, tallas y colores disponibles)
CREATE OR REPLACE FUNCTION get_products_catalog_meta()
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'price_min', COALESCE(MIN(p.price), 0),
    'price_max', COALESCE(MAX(p.price), 9999),
    'available_sizes', COALESCE(
      (SELECT jsonb_agg(DISTINCT pv.size ORDER BY pv.size)
       FROM product_variants pv
       JOIN products pp ON pp.id = pv.product_id
       WHERE pp.collection_id IS NULL
         AND pp.active = true
         AND pp.deleted_at IS NULL
         AND pv.deleted_at IS NULL),
      '[]'::jsonb
    ),
    'available_colors', COALESCE(
      (SELECT jsonb_agg(DISTINCT pv.color ORDER BY pv.color)
       FROM product_variants pv
       JOIN products pp ON pp.id = pv.product_id
       WHERE pp.collection_id IS NULL
         AND pp.active = true
         AND pp.deleted_at IS NULL
         AND pv.deleted_at IS NULL),
      '[]'::jsonb
    )
  )
  FROM products p
  WHERE p.collection_id IS NULL
    AND p.active = true
    AND p.deleted_at IS NULL;
$$;

-- Función 2: Listado paginado y filtrable de productos sin colección
-- Parámetros en p_filters (jsonb):
--   precio_min (numeric), precio_max (numeric),
--   tallas (text[]), colores (text[]),
--   solo_stock (boolean),
--   orden (text): 'recent' | 'price_asc' | 'price_desc' | 'name_asc' | 'popular'
--   pagina (int, base 1), por_pagina (int, default 12)
CREATE OR REPLACE FUNCTION get_products_catalog(p_filters jsonb)
RETURNS TABLE (
  id          uuid,
  name        text,
  slug        text,
  price       numeric,
  moneda_code text,
  primary_image_url text,
  total_stock bigint,
  total_count bigint
)
LANGUAGE sql
STABLE
AS $$
  WITH filtered AS (
    SELECT DISTINCT
      p.id,
      p.name,
      p.slug,
      p.price,
      p.moneda_code,
      p.created_at,
      (
        SELECT pi.url
        FROM product_images pi
        WHERE pi.product_id = p.id
          AND pi.is_primary = true
          AND pi.deleted_at IS NULL
        LIMIT 1
      ) AS primary_image_url,
      COALESCE(
        (SELECT SUM(pv2.stock)
         FROM product_variants pv2
         WHERE pv2.product_id = p.id AND pv2.deleted_at IS NULL),
        0
      ) AS total_stock,
      COALESCE(
        (SELECT COUNT(r.id)
         FROM reservations r
         JOIN product_variants pv3 ON pv3.id = r.variant_id
         WHERE pv3.product_id = p.id AND r.status = 'confirmed'),
        0
      ) AS reservation_count
    FROM products p
    LEFT JOIN product_variants pv
      ON pv.product_id = p.id AND pv.deleted_at IS NULL
    WHERE p.collection_id IS NULL
      AND p.active = true
      AND p.deleted_at IS NULL
      -- Filtro precio
      AND p.price >= COALESCE((p_filters->>'precio_min')::numeric, 0)
      AND p.price <= COALESCE((p_filters->>'precio_max')::numeric, 999999)
      -- Filtro solo con stock
      AND (
        NOT COALESCE((p_filters->>'solo_stock')::boolean, false)
        OR COALESCE(
          (SELECT SUM(pv4.stock) FROM product_variants pv4
           WHERE pv4.product_id = p.id AND pv4.deleted_at IS NULL),
          0
        ) > 0
      )
      -- Filtro tallas (producto debe tener AL MENOS UNA variante con esa talla)
      AND (
        (p_filters->'tallas') IS NULL
        OR jsonb_array_length(p_filters->'tallas') = 0
        OR EXISTS (
          SELECT 1 FROM product_variants pv5
          WHERE pv5.product_id = p.id
            AND pv5.deleted_at IS NULL
            AND pv5.size = ANY(
              ARRAY(SELECT jsonb_array_elements_text(p_filters->'tallas'))
            )
        )
      )
      -- Filtro colores (producto debe tener AL MENOS UNA variante con ese color)
      AND (
        (p_filters->'colores') IS NULL
        OR jsonb_array_length(p_filters->'colores') = 0
        OR EXISTS (
          SELECT 1 FROM product_variants pv6
          WHERE pv6.product_id = p.id
            AND pv6.deleted_at IS NULL
            AND pv6.color = ANY(
              ARRAY(SELECT jsonb_array_elements_text(p_filters->'colores'))
            )
        )
      )
  ),
  counted AS (
    SELECT COUNT(*) AS total_count FROM filtered
  )
  SELECT
    f.id,
    f.name,
    f.slug,
    f.price,
    f.moneda_code,
    f.primary_image_url,
    f.total_stock,
    c.total_count
  FROM filtered f, counted c
  ORDER BY
    CASE WHEN (p_filters->>'orden') = 'recent'     THEN f.created_at        END DESC NULLS LAST,
    CASE WHEN (p_filters->>'orden') = 'price_asc'  THEN f.price             END ASC  NULLS LAST,
    CASE WHEN (p_filters->>'orden') = 'price_desc' THEN f.price             END DESC NULLS LAST,
    CASE WHEN (p_filters->>'orden') = 'name_asc'   THEN f.name              END ASC  NULLS LAST,
    CASE WHEN (p_filters->>'orden') = 'popular'    THEN f.reservation_count END DESC NULLS LAST,
    f.created_at DESC  -- tiebreaker universal
  LIMIT  COALESCE((p_filters->>'por_pagina')::int, 12)
  OFFSET (COALESCE((p_filters->>'pagina')::int, 1) - 1)
         * COALESCE((p_filters->>'por_pagina')::int, 12);
$$;
```

- [ ] **Step 2: Aplicar la migración en Supabase**

Si tenés acceso CLI de Supabase:
```bash
supabase db push
```

Si no, copiar el SQL y ejecutarlo en el SQL Editor del dashboard de Supabase (proyecto dropen-web).

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/011_products_catalog_rpc.sql
git commit -m "feat(db): add get_products_catalog and get_products_catalog_meta RPCs"
```

---

## Task 2: Hook `useProductsCatalog` + extender mock de Supabase + test

**Files:**
- Modify: `src/test/mocks/supabase.ts`
- Create: `src/hooks/useProductsCatalog.ts`
- Create: `src/hooks/__tests__/useProductsCatalog.test.ts`

### Step 1: Extender el mock de Supabase con `mockRpc`

- [ ] **Step 1: Agregar `mockRpc` al mock**

Reemplazar el contenido completo de `src/test/mocks/supabase.ts`:

```typescript
import { vi } from 'vitest'

export const mockFrom = vi.fn()
export const mockSelect = vi.fn()
export const mockInsert = vi.fn()
export const mockUpdate = vi.fn()
export const mockEq = vi.fn()
export const mockIn = vi.fn()
export const mockSingle = vi.fn()
export const mockLte = vi.fn()
export const mockGt = vi.fn()
export const mockRpc = vi.fn()

const chain: Record<string, ReturnType<typeof vi.fn>> = {
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  eq: mockEq,
  in: mockIn,
  single: mockSingle,
  lte: mockLte,
  gt: mockGt,
}

Object.values(chain).forEach((fn) => fn.mockReturnValue(chain))

export const mockSupabase = {
  from: mockFrom.mockReturnValue(chain),
  rpc: mockRpc,
  auth: {
    getSession: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  },
}

vi.mock('@/lib/supabase', () => ({ supabase: mockSupabase }))
```

### Step 2: Escribir los tests que fallan

- [ ] **Step 2: Crear el test del hook**

Crear `src/hooks/__tests__/useProductsCatalog.test.ts`:

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockRpc } from '@/test/mocks/supabase'
import {
  useProductsCatalog,
  useProductsCatalogMeta,
  type CatalogFilters,
} from '../useProductsCatalog'

const DEFAULT_FILTERS: CatalogFilters = {
  precioMin: 0,
  precioMax: 9999,
  tallas: [],
  colores: [],
  soloStock: false,
  orden: 'recent',
  pagina: 1,
  porPagina: 12,
}

const PRODUCT_ROW = {
  id: 'p1',
  name: 'Jean Baggy',
  slug: 'jean-baggy',
  price: 189,
  moneda_code: 'PEN',
  primary_image_url: null,
  total_stock: 5,
  total_count: 1,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useProductsCatalog', () => {
  it('retorna productos cuando la RPC responde correctamente', async () => {
    mockRpc.mockResolvedValue({ data: [PRODUCT_ROW], error: null })
    const { result } = renderHook(() => useProductsCatalog(DEFAULT_FILTERS))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.products).toHaveLength(1)
    expect(result.current.products[0].name).toBe('Jean Baggy')
    expect(result.current.totalCount).toBe(1)
    expect(result.current.totalPages).toBe(1)
  })

  it('retorna lista vacía y totalCount 0 cuando la RPC retorna []', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null })
    const { result } = renderHook(() => useProductsCatalog(DEFAULT_FILTERS))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.products).toHaveLength(0)
    expect(result.current.totalCount).toBe(0)
  })

  it('setea error cuando la RPC falla', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const { result } = renderHook(() => useProductsCatalog(DEFAULT_FILTERS))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('DB error')
    expect(result.current.products).toHaveLength(0)
  })

  it('loading es true al inicio', () => {
    mockRpc.mockResolvedValue({ data: [], error: null })
    const { result } = renderHook(() => useProductsCatalog(DEFAULT_FILTERS))
    expect(result.current.loading).toBe(true)
  })

  it('calcula totalPages correctamente', async () => {
    const rows = Array.from({ length: 5 }, (_, i) => ({ ...PRODUCT_ROW, id: `p${i}`, total_count: 25 }))
    mockRpc.mockResolvedValue({ data: rows, error: null })
    const { result } = renderHook(() => useProductsCatalog({ ...DEFAULT_FILTERS, porPagina: 12 }))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.totalPages).toBe(3) // ceil(25/12) = 3
  })
})

describe('useProductsCatalogMeta', () => {
  it('retorna metadata cuando la RPC responde', async () => {
    mockRpc.mockResolvedValue({
      data: { price_min: 50, price_max: 500, available_sizes: ['32', '34'], available_colors: ['Black'] },
      error: null,
    })
    const { result } = renderHook(() => useProductsCatalogMeta())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.meta?.price_min).toBe(50)
    expect(result.current.meta?.available_sizes).toEqual(['32', '34'])
  })

  it('meta es null si la RPC falla', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'err' } })
    const { result } = renderHook(() => useProductsCatalogMeta())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.meta).toBeNull()
  })
})
```

- [ ] **Step 3: Correr los tests para verlos fallar**

```bash
npm run test:run -- src/hooks/__tests__/useProductsCatalog.test.ts
```

Expected: FAIL — `useProductsCatalog` no existe.

### Step 3: Implementar el hook

- [ ] **Step 4: Crear `src/hooks/useProductsCatalog.ts`**

```typescript
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface CatalogFilters {
  precioMin: number
  precioMax: number
  tallas: string[]
  colores: string[]
  soloStock: boolean
  orden: 'recent' | 'price_asc' | 'price_desc' | 'name_asc' | 'popular'
  pagina: number
  porPagina: number
}

export interface CatalogProduct {
  id: string
  name: string
  slug: string
  price: number
  moneda_code: string
  primary_image_url: string | null
  total_stock: number
}

export interface CatalogMeta {
  price_min: number
  price_max: number
  available_sizes: string[]
  available_colors: string[]
}

interface UseCatalogResult {
  products: CatalogProduct[]
  totalCount: number
  totalPages: number
  loading: boolean
  error: string | null
}

interface UseCatalogMetaResult {
  meta: CatalogMeta | null
  loading: boolean
}

export function useProductsCatalogMeta(): UseCatalogMetaResult {
  const [meta, setMeta] = useState<CatalogMeta | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.rpc('get_products_catalog_meta').then(({ data, error }) => {
      if (!error && data) setMeta(data as CatalogMeta)
      setLoading(false)
    })
  }, [])

  return { meta, loading }
}

export function useProductsCatalog(filters: CatalogFilters): UseCatalogResult {
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Serializar arrays para evitar re-renders infinitos por referencia
  const tallasKey = [...filters.tallas].sort().join(',')
  const coloresKey = [...filters.colores].sort().join(',')

  useEffect(() => {
    setLoading(true)
    setError(null)

    supabase
      .rpc('get_products_catalog', {
        p_filters: {
          precio_min: filters.precioMin,
          precio_max: filters.precioMax,
          tallas: filters.tallas,
          colores: filters.colores,
          solo_stock: filters.soloStock,
          orden: filters.orden,
          pagina: filters.pagina,
          por_pagina: filters.porPagina,
        },
      })
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message)
          setProducts([])
          setTotalCount(0)
        } else {
          type Row = CatalogProduct & { total_count: number }
          const rows = (data as Row[]) ?? []
          setProducts(rows.map(({ total_count: _tc, ...p }) => p))
          setTotalCount(rows[0]?.total_count ?? 0)
        }
        setLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.precioMin,
    filters.precioMax,
    tallasKey,
    coloresKey,
    filters.soloStock,
    filters.orden,
    filters.pagina,
    filters.porPagina,
  ])

  return {
    products,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / filters.porPagina)),
    loading,
    error,
  }
}
```

- [ ] **Step 5: Correr los tests para verlos pasar**

```bash
npm run test:run -- src/hooks/__tests__/useProductsCatalog.test.ts
```

Expected: PASS (7 casos).

- [ ] **Step 6: Verificar build**

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/test/mocks/supabase.ts src/hooks/useProductsCatalog.ts src/hooks/__tests__/useProductsCatalog.test.ts
git commit -m "feat(hooks): add useProductsCatalog and useProductsCatalogMeta"
```

---

## Task 3: `ProductsGridSkeleton`

**Files:**
- Create: `src/components/products/ProductsGridSkeleton.tsx`
- Create: `src/components/products/__tests__/ProductsGridSkeleton.test.tsx`

- [ ] **Step 1: Escribir el test**

Crear `src/components/products/__tests__/ProductsGridSkeleton.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProductsGridSkeleton from '../ProductsGridSkeleton'

describe('ProductsGridSkeleton', () => {
  it('renderiza exactamente 12 skeletons de card', () => {
    render(<ProductsGridSkeleton />)
    // Cada card tiene 3 Skeletons (imagen + nombre + precio)
    // El contenedor tiene 12 elementos con data-testid="skeleton-card"
    const cards = screen.getAllByTestId('skeleton-card')
    expect(cards).toHaveLength(12)
  })
})
```

- [ ] **Step 2: Correr el test para verlo fallar**

```bash
npm run test:run -- src/components/products/__tests__/ProductsGridSkeleton.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implementar el componente**

Crear `src/components/products/ProductsGridSkeleton.tsx`:

```tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} data-testid="skeleton-card" className="flex flex-col gap-3">
          <Skeleton className="aspect-[3/4] w-full bg-surface" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4 bg-surface" />
            <Skeleton className="h-4 w-1/3 bg-surface" />
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Correr el test para verlo pasar**

```bash
npm run test:run -- src/components/products/__tests__/ProductsGridSkeleton.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/products/ProductsGridSkeleton.tsx src/components/products/__tests__/ProductsGridSkeleton.test.tsx
git commit -m "feat(products): add ProductsGridSkeleton with 12 structured cards"
```

---

## Task 4: `ProductsPagination`

**Files:**
- Create: `src/components/products/ProductsPagination.tsx`
- Create: `src/components/products/__tests__/ProductsPagination.test.tsx`

- [ ] **Step 1: Escribir el test**

Crear `src/components/products/__tests__/ProductsPagination.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import ProductsPagination from '../ProductsPagination'

describe('ProductsPagination', () => {
  it('deshabilita el botón Anterior en la primera página', () => {
    render(<ProductsPagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /anterior/i })).toBeDisabled()
  })

  it('deshabilita el botón Siguiente en la última página', () => {
    render(<ProductsPagination currentPage={5} totalPages={5} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeDisabled()
  })

  it('llama onPageChange con página + 1 al hacer click en Siguiente', async () => {
    const onPageChange = vi.fn()
    render(<ProductsPagination currentPage={2} totalPages={5} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: /siguiente/i }))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('llama onPageChange con página - 1 al hacer click en Anterior', async () => {
    const onPageChange = vi.fn()
    render(<ProductsPagination currentPage={3} totalPages={5} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: /anterior/i }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('no renderiza nada cuando totalPages es 1', () => {
    const { container } = render(
      <ProductsPagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('llama onPageChange al hacer click en un número de página', async () => {
    const onPageChange = vi.fn()
    render(<ProductsPagination currentPage={1} totalPages={3} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: '3' }))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })
})
```

- [ ] **Step 2: Correr el test para verlo fallar**

```bash
npm run test:run -- src/components/products/__tests__/ProductsPagination.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implementar el componente**

Crear `src/components/products/ProductsPagination.tsx`:

```tsx
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
}

export default function ProductsPagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null

  const pages = getPageNumbers(currentPage, totalPages)

  return (
    <nav className="flex items-center justify-center gap-1 mt-12" aria-label="Paginación">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Anterior"
        className="flex items-center gap-1 px-3 py-2 text-sm text-text-muted hover:text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
        Anterior
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-text-muted text-sm">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              aria-label={String(p)}
              aria-current={p === currentPage ? 'page' : undefined}
              className={`w-8 h-8 text-sm transition-colors ${
                p === currentPage
                  ? 'bg-accent text-background font-medium'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface'
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Siguiente"
        className="flex items-center gap-1 px-3 py-2 text-sm text-text-muted hover:text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Siguiente
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  )
}
```

- [ ] **Step 4: Correr los tests para verlos pasar**

```bash
npm run test:run -- src/components/products/__tests__/ProductsPagination.test.tsx
```

Expected: PASS (6 casos).

- [ ] **Step 5: Commit**

```bash
git add src/components/products/ProductsPagination.tsx src/components/products/__tests__/ProductsPagination.test.tsx
git commit -m "feat(products): add ProductsPagination with ellipsis and aria labels"
```

---

## Task 5: `ProductsPriceSlider`

**Files:**
- Create: `src/components/products/ProductsPriceSlider.tsx`

> Sin test unitario — el Slider de Radix no es testeable en jsdom sin polyfills de touch/pointer. Verificación: build + visual.

- [ ] **Step 1: Crear el componente**

Crear `src/components/products/ProductsPriceSlider.tsx`:

```tsx
import * as React from 'react'
import { Slider as SliderPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

interface Props {
  min: number
  max: number
  value: [number, number]
  onValueChange: (value: [number, number]) => void
  formatValue?: (v: number) => string
  className?: string
}

export default function ProductsPriceSlider({
  min,
  max,
  value,
  onValueChange,
  formatValue,
  className,
}: Props) {
  const fmt = formatValue ?? ((v: number) => String(v))

  function handleMinInput(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Math.min(Number(e.target.value), value[1])
    onValueChange([Math.max(min, v), value[1]])
  }

  function handleMaxInput(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Math.max(Number(e.target.value), value[0])
    onValueChange([value[0], Math.min(max, v)])
  }

  return (
    <div className={cn('space-y-4', className)}>
      <SliderPrimitive.Root
        min={min}
        max={max}
        step={1}
        value={value}
        onValueChange={(v) => onValueChange(v as [number, number])}
        className="relative flex w-full touch-none select-none items-center"
      >
        <SliderPrimitive.Track className="relative h-px w-full grow bg-border">
          <SliderPrimitive.Range className="absolute h-full bg-accent" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className="block h-3.5 w-3.5 rounded-full border border-accent bg-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          aria-label="Precio mínimo"
        />
        <SliderPrimitive.Thumb
          className="block h-3.5 w-3.5 rounded-full border border-accent bg-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          aria-label="Precio máximo"
        />
      </SliderPrimitive.Root>

      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value[0]}
          min={min}
          max={value[1]}
          onChange={handleMinInput}
          aria-label="Precio mínimo"
          className="w-20 bg-surface border border-border text-text-primary text-xs px-2 py-1 text-center focus:outline-none focus:border-accent"
        />
        <span className="text-text-muted text-xs flex-1 text-center">—</span>
        <input
          type="number"
          value={value[1]}
          min={value[0]}
          max={max}
          onChange={handleMaxInput}
          aria-label="Precio máximo"
          className="w-20 bg-surface border border-border text-text-primary text-xs px-2 py-1 text-center focus:outline-none focus:border-accent"
        />
      </div>

      <div className="flex justify-between text-[10px] text-text-muted">
        <span>{fmt(min)}</span>
        <span>{fmt(max)}</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/products/ProductsPriceSlider.tsx
git commit -m "feat(products): add ProductsPriceSlider dual range component"
```

---

## Task 6: `ProductsGrid`

**Files:**
- Create: `src/components/products/ProductsGrid.tsx`

> Sin test unitario — el stagger de framer-motion no es significativamente testeable con jsdom. El mock descarta las props de animación. Verificación: build + visual.

- [ ] **Step 1: Crear el componente**

Crear `src/components/products/ProductsGrid.tsx`:

```tsx
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import type { CatalogProduct } from '@/hooks/useProductsCatalog'
import { formatCurrency } from '@/lib/currency'

// Animaciones stagger — se re-ejecutan al cambiar `animationKey`
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

interface CatalogCardProps {
  product: CatalogProduct
}

function CatalogProductCard({ product }: CatalogCardProps) {
  const outOfStock = product.total_stock === 0

  return (
    <motion.div variants={item}>
      <Link
        to={`/productos/${product.slug}`}
        className="group block"
        aria-label={product.name}
      >
        <div className="relative overflow-hidden aspect-[3/4] bg-surface mb-3">
          {product.primary_image_url ? (
            <img
              src={`${product.primary_image_url}?width=600&quality=80`}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-text-muted text-sm">
              Sin imagen
            </div>
          )}
          {product.primary_image_url && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <span className="text-text-primary text-xs tracking-[0.2em] uppercase font-medium">
                Ver producto
              </span>
            </div>
          )}
          {outOfStock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <Badge variant="secondary">Agotado</Badge>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="font-body font-medium text-text-primary group-hover:text-accent transition-colors text-sm">
            {product.name}
          </h3>
          <p className="font-body text-accent font-medium text-sm">
            {formatCurrency(product.price, product.moneda_code)}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}

interface Props {
  products: CatalogProduct[]
  animationKey: string
}

export default function ProductsGrid({ products, animationKey }: Props) {
  return (
    <motion.div
      key={animationKey}
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
    >
      {products.map((p) => (
        <CatalogProductCard key={p.id} product={p} />
      ))}
    </motion.div>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/products/ProductsGrid.tsx
git commit -m "feat(products): add ProductsGrid with stagger animation"
```

---

## Task 7: `ProductsFilterSheet`

**Files:**
- Create: `src/components/products/ProductsFilterSheet.tsx`

> Sin test unitario — depende de Radix Sheet que requiere portal; la cobertura se da vía el test de ProductsFilterBar que verifica la apertura del sheet. Verificación: build + visual.

- [ ] **Step 1: Crear el componente**

Crear `src/components/products/ProductsFilterSheet.tsx`:

```tsx
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import ProductsPriceSlider from './ProductsPriceSlider'
import type { CatalogFilters, CatalogMeta } from '@/hooks/useProductsCatalog'
import { formatCurrency } from '@/lib/currency'

const COLOR_HEX: Record<string, string> = {
  Black:  '#1a1a1a',
  Stone:  '#c8b89a',
  Indigo: '#4a4e8c',
  White:  '#f0ede8',
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: CatalogFilters
  meta: CatalogMeta
  onFiltersChange: (partial: Partial<CatalogFilters>) => void
  onClear: () => void
}

export default function ProductsFilterSheet({
  open,
  onOpenChange,
  filters,
  meta,
  onFiltersChange,
  onClear,
}: Props) {
  function toggleTalla(size: string) {
    const next = filters.tallas.includes(size)
      ? filters.tallas.filter((s) => s !== size)
      : [...filters.tallas, size]
    onFiltersChange({ tallas: next })
  }

  function toggleColor(color: string) {
    const next = filters.colores.includes(color)
      ? filters.colores.filter((c) => c !== color)
      : [...filters.colores, color]
    onFiltersChange({ colores: next })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="bg-surface border-r border-border flex flex-col w-80">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="text-text-primary text-sm tracking-widest uppercase">
            Filtros
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
          {/* Precio */}
          <div>
            <p className="text-xs text-text-muted uppercase tracking-widest mb-4">Precio</p>
            <ProductsPriceSlider
              min={meta.price_min}
              max={meta.price_max}
              value={[filters.precioMin, filters.precioMax]}
              onValueChange={([min, max]) => onFiltersChange({ precioMin: min, precioMax: max })}
              formatValue={(v) => formatCurrency(v, 'PEN')}
            />
          </div>

          {/* Tallas */}
          {meta.available_sizes.length > 0 && (
            <div>
              <p className="text-xs text-text-muted uppercase tracking-widest mb-3">Talla</p>
              <div className="flex flex-wrap gap-2">
                {meta.available_sizes.map((size) => {
                  const selected = filters.tallas.includes(size)
                  return (
                    <button
                      key={size}
                      onClick={() => toggleTalla(size)}
                      aria-pressed={selected}
                      className={`w-10 h-10 text-xs border transition-colors ${
                        selected
                          ? 'border-accent text-accent'
                          : 'border-border text-text-muted hover:border-text-muted'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Colores */}
          {meta.available_colors.length > 0 && (
            <div>
              <p className="text-xs text-text-muted uppercase tracking-widest mb-3">Color</p>
              <div className="flex flex-wrap gap-3">
                {meta.available_colors.map((color) => {
                  const selected = filters.colores.includes(color)
                  const hex = COLOR_HEX[color] ?? '#888888'
                  return (
                    <button
                      key={color}
                      onClick={() => toggleColor(color)}
                      aria-pressed={selected}
                      aria-label={color}
                      style={{ backgroundColor: hex }}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        selected ? 'border-accent scale-110' : 'border-border hover:border-text-muted'
                      }`}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Solo con stock */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted uppercase tracking-widest">Solo con stock</p>
            <button
              role="switch"
              aria-checked={filters.soloStock}
              onClick={() => onFiltersChange({ soloStock: !filters.soloStock })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                filters.soloStock ? 'bg-accent' : 'bg-border'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background transition-transform ${
                  filters.soloStock ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-4 flex gap-3">
          <button
            onClick={onClear}
            className="flex-1 py-2 text-xs text-text-muted border border-border hover:border-text-muted transition-colors uppercase tracking-widest"
          >
            Limpiar
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 py-2 text-xs bg-accent text-background hover:bg-accent/90 transition-colors uppercase tracking-widest"
          >
            Aplicar
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/products/ProductsFilterSheet.tsx
git commit -m "feat(products): add ProductsFilterSheet with price, size, color, stock filters"
```

---

## Task 8: `ProductsFilterBar`

**Files:**
- Create: `src/components/products/ProductsFilterBar.tsx`
- Create: `src/components/products/__tests__/ProductsFilterBar.test.tsx`

- [ ] **Step 1: Escribir el test**

Crear `src/components/products/__tests__/ProductsFilterBar.test.tsx`:

```tsx
import '@/test/mocks/framer-motion'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import ProductsFilterBar from '../ProductsFilterBar'
import type { CatalogFilters } from '@/hooks/useProductsCatalog'

const BASE_FILTERS: CatalogFilters = {
  precioMin: 0,
  precioMax: 9999,
  tallas: [],
  colores: [],
  soloStock: false,
  orden: 'recent',
  pagina: 1,
  porPagina: 12,
}

describe('ProductsFilterBar', () => {
  it('muestra el conteo de resultados', () => {
    render(
      <ProductsFilterBar
        filters={BASE_FILTERS}
        totalCount={24}
        onFiltersChange={vi.fn()}
        onClear={vi.fn()}
        onOpenFilters={vi.fn()}
      />
    )
    expect(screen.getByText(/24 producto/i)).toBeInTheDocument()
  })

  it('muestra chips para filtros de talla activos', () => {
    render(
      <ProductsFilterBar
        filters={{ ...BASE_FILTERS, tallas: ['32', '34'] }}
        totalCount={10}
        onFiltersChange={vi.fn()}
        onClear={vi.fn()}
        onOpenFilters={vi.fn()}
      />
    )
    expect(screen.getByText('32')).toBeInTheDocument()
    expect(screen.getByText('34')).toBeInTheDocument()
  })

  it('llama onFiltersChange al quitar chip de talla', async () => {
    const onFiltersChange = vi.fn()
    render(
      <ProductsFilterBar
        filters={{ ...BASE_FILTERS, tallas: ['32'] }}
        totalCount={5}
        onFiltersChange={onFiltersChange}
        onClear={vi.fn()}
        onOpenFilters={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /quitar talla 32/i }))
    expect(onFiltersChange).toHaveBeenCalledWith({ tallas: [] })
  })

  it('llama onClear al hacer click en Limpiar', async () => {
    const onClear = vi.fn()
    render(
      <ProductsFilterBar
        filters={{ ...BASE_FILTERS, tallas: ['32'] }}
        totalCount={5}
        onFiltersChange={vi.fn()}
        onClear={onClear}
        onOpenFilters={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /limpiar/i }))
    expect(onClear).toHaveBeenCalled()
  })

  it('llama onOpenFilters al hacer click en el botón Filtros', async () => {
    const onOpenFilters = vi.fn()
    render(
      <ProductsFilterBar
        filters={BASE_FILTERS}
        totalCount={0}
        onFiltersChange={vi.fn()}
        onClear={vi.fn()}
        onOpenFilters={onOpenFilters}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /filtros/i }))
    expect(onOpenFilters).toHaveBeenCalled()
  })

  it('llama onFiltersChange con el nuevo orden al cambiar el select', async () => {
    const onFiltersChange = vi.fn()
    render(
      <ProductsFilterBar
        filters={BASE_FILTERS}
        totalCount={0}
        onFiltersChange={onFiltersChange}
        onClear={vi.fn()}
        onOpenFilters={vi.fn()}
      />
    )
    await userEvent.selectOptions(screen.getByRole('combobox'), 'price_asc')
    expect(onFiltersChange).toHaveBeenCalledWith({ orden: 'price_asc' })
  })
})
```

- [ ] **Step 2: Correr el test para verlo fallar**

```bash
npm run test:run -- src/components/products/__tests__/ProductsFilterBar.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implementar el componente**

Crear `src/components/products/ProductsFilterBar.tsx`:

```tsx
import { AnimatePresence, motion } from 'framer-motion'
import { SlidersHorizontal, X } from 'lucide-react'
import type { CatalogFilters } from '@/hooks/useProductsCatalog'

interface Props {
  filters: CatalogFilters
  totalCount: number
  onFiltersChange: (partial: Partial<CatalogFilters>) => void
  onClear: () => void
  onOpenFilters: () => void
}

const COLOR_HEX: Record<string, string> = {
  Black:  '#1a1a1a',
  Stone:  '#c8b89a',
  Indigo: '#4a4e8c',
  White:  '#f0ede8',
}

const SORT_OPTIONS = [
  { value: 'recent',     label: 'Más recientes' },
  { value: 'price_asc',  label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'name_asc',   label: 'Nombre A-Z' },
  { value: 'popular',    label: 'Más populares' },
] as const

const activeFilterCount =
  (filters: CatalogFilters, defaultMin: number, defaultMax: number) =>
    filters.tallas.length +
    filters.colores.length +
    (filters.soloStock ? 1 : 0) +
    (filters.precioMin !== defaultMin || filters.precioMax !== defaultMax ? 1 : 0)

export default function ProductsFilterBar({
  filters,
  totalCount,
  onFiltersChange,
  onClear,
  onOpenFilters,
}: Props) {
  const hasActiveFilters =
    filters.tallas.length > 0 ||
    filters.colores.length > 0 ||
    filters.soloStock

  return (
    <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-2">
        {/* Fila principal */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onOpenFilters}
            aria-label="Filtros"
            className="flex items-center gap-2 px-3 py-1.5 border border-border text-text-muted hover:border-accent hover:text-text-primary text-xs uppercase tracking-widest transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtros
          </button>

          <select
            value={filters.orden}
            onChange={(e) =>
              onFiltersChange({ orden: e.target.value as CatalogFilters['orden'] })
            }
            className="bg-transparent border border-border text-text-muted text-xs px-2 py-1.5 focus:outline-none focus:border-accent hover:border-text-muted transition-colors uppercase tracking-widest cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-surface text-text-primary normal-case tracking-normal">
                {o.label}
              </option>
            ))}
          </select>

          <span className="ml-auto text-xs text-text-muted">
            {totalCount} {totalCount === 1 ? 'producto' : 'productos'}
          </span>

          {hasActiveFilters && (
            <button
              onClick={onClear}
              aria-label="Limpiar filtros"
              className="text-xs text-text-muted hover:text-error transition-colors uppercase tracking-widest"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Chips de filtros activos */}
        <AnimatePresence>
          {(filters.tallas.length > 0 || filters.colores.length > 0 || filters.soloStock) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 overflow-hidden"
            >
              {filters.tallas.map((size) => (
                <motion.span
                  key={`talla-${size}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1 px-2 py-0.5 bg-surface border border-border text-xs text-text-primary"
                >
                  {size}
                  <button
                    onClick={() =>
                      onFiltersChange({ tallas: filters.tallas.filter((s) => s !== size) })
                    }
                    aria-label={`Quitar talla ${size}`}
                    className="text-text-muted hover:text-text-primary"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              ))}

              {filters.colores.map((color) => (
                <motion.span
                  key={`color-${color}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1.5 px-2 py-0.5 bg-surface border border-border text-xs text-text-primary"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block border border-border/50"
                    style={{ backgroundColor: COLOR_HEX[color] ?? '#888' }}
                  />
                  {color}
                  <button
                    onClick={() =>
                      onFiltersChange({ colores: filters.colores.filter((c) => c !== color) })
                    }
                    aria-label={`Quitar color ${color}`}
                    className="text-text-muted hover:text-text-primary"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              ))}

              {filters.soloStock && (
                <motion.span
                  key="solo-stock"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1 px-2 py-0.5 bg-surface border border-border text-xs text-text-primary"
                >
                  Con stock
                  <button
                    onClick={() => onFiltersChange({ soloStock: false })}
                    aria-label="Quitar filtro con stock"
                    className="text-text-muted hover:text-text-primary"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Correr los tests para verlos pasar**

```bash
npm run test:run -- src/components/products/__tests__/ProductsFilterBar.test.tsx
```

Expected: PASS (6 casos).

- [ ] **Step 5: Verificar build**

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/products/ProductsFilterBar.tsx src/components/products/__tests__/ProductsFilterBar.test.tsx
git commit -m "feat(products): add ProductsFilterBar with active filter chips and sort"
```

---

## Task 9: `ProductsPage`

**Files:**
- Create: `src/pages/ProductsPage.tsx`

> Sin test unitario propio — orquesta componentes ya testeados con hooks de URL. Verificación: build + test:run completo + visual.

- [ ] **Step 1: Crear la página**

Crear `src/pages/ProductsPage.tsx`:

```tsx
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import {
  useProductsCatalog,
  useProductsCatalogMeta,
  type CatalogFilters,
} from '@/hooks/useProductsCatalog'
import ProductsFilterBar from '@/components/products/ProductsFilterBar'
import ProductsFilterSheet from '@/components/products/ProductsFilterSheet'
import ProductsGrid from '@/components/products/ProductsGrid'
import ProductsGridSkeleton from '@/components/products/ProductsGridSkeleton'
import ProductsPagination from '@/components/products/ProductsPagination'
import PageMeta from '@/components/seo/PageMeta'

const POR_PAGINA = 12

function parseSearchParams(
  params: URLSearchParams,
  priceMin: number,
  priceMax: number,
): CatalogFilters {
  return {
    precioMin: Number(params.get('precioMin') ?? priceMin),
    precioMax: Number(params.get('precioMax') ?? priceMax),
    tallas: params.get('tallas') ? params.get('tallas')!.split(',').filter(Boolean) : [],
    colores: params.get('colores') ? params.get('colores')!.split(',').filter(Boolean) : [],
    soloStock: params.get('soloStock') === 'true',
    orden: (params.get('orden') as CatalogFilters['orden']) ?? 'recent',
    pagina: Math.max(1, Number(params.get('page') ?? 1)),
    porPagina: POR_PAGINA,
  }
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const { meta, loading: metaLoading } = useProductsCatalogMeta()

  const priceMin = meta?.price_min ?? 0
  const priceMax = meta?.price_max ?? 9999

  const filters = useMemo(
    () => parseSearchParams(searchParams, priceMin, priceMax),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams.toString(), priceMin, priceMax],
  )

  const { products, totalCount, totalPages, loading } = useProductsCatalog(filters)

  // Scroll al top en cada cambio de página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [filters.pagina])

  function updateFilters(partial: Partial<CatalogFilters>) {
    const next = { ...filters, ...partial, pagina: 1 }
    const params: Record<string, string> = {}
    if (next.tallas.length) params.tallas = next.tallas.join(',')
    if (next.colores.length) params.colores = next.colores.join(',')
    if (next.soloStock) params.soloStock = 'true'
    if (next.precioMin !== priceMin) params.precioMin = String(next.precioMin)
    if (next.precioMax !== priceMax) params.precioMax = String(next.precioMax)
    if (next.orden !== 'recent') params.orden = next.orden
    setSearchParams(params, { replace: true })
  }

  function setPage(page: number) {
    const params = new URLSearchParams(searchParams)
    if (page === 1) params.delete('page')
    else params.set('page', String(page))
    setSearchParams(params, { replace: true })
  }

  function clearFilters() {
    setSearchParams({}, { replace: true })
  }

  // Key para forzar re-mount del grid y re-ejecutar stagger animation
  const gridKey = `${filters.pagina}-${filters.tallas.join(',')}-${filters.colores.join(',')}-${filters.orden}-${filters.soloStock}`

  if (metaLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 pt-24 pb-4">
          <div className="h-10 w-48 bg-surface animate-pulse" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <ProductsGridSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <PageMeta title="Productos" description="Catálogo completo de productos DROPEN" />

      {/* Header de sección */}
      <div className="pt-24 pb-4 px-4 max-w-7xl mx-auto">
        <h1 className="font-display font-bold text-4xl tracking-[0.2em] uppercase text-text-primary">
          Productos
        </h1>
      </div>

      {/* Barra de filtros sticky */}
      <ProductsFilterBar
        filters={filters}
        totalCount={totalCount}
        onFiltersChange={updateFilters}
        onClear={clearFilters}
        onOpenFilters={() => setFilterSheetOpen(true)}
      />

      {/* Sheet de filtros (se abre desde la barra) */}
      {meta && (
        <ProductsFilterSheet
          open={filterSheetOpen}
          onOpenChange={setFilterSheetOpen}
          filters={filters}
          meta={meta}
          onFiltersChange={updateFilters}
          onClear={clearFilters}
        />
      )}

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <ProductsGridSkeleton />
        ) : products.length === 0 ? (
          // Estado vacío
          <div className="py-24 flex flex-col items-center justify-center gap-4 text-center">
            <ShoppingBag className="w-12 h-12 text-text-muted opacity-20" />
            <p className="text-text-muted text-sm">No encontramos productos con esos filtros</p>
            <button
              onClick={clearFilters}
              className="text-accent text-xs hover:underline uppercase tracking-widest"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            <ProductsGrid products={products} animationKey={gridKey} />
            <ProductsPagination
              currentPage={filters.pagina}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Expected: PASS, sin errores de tipos.

- [ ] **Step 3: Commit**

```bash
git add src/pages/ProductsPage.tsx
git commit -m "feat(products): add ProductsPage with URL-persisted filters and pagination"
```

---

## Task 10: Router y Header

**Files:**
- Modify: `src/router.tsx`
- Modify: `src/components/layout/Header.tsx`

- [ ] **Step 1: Agregar la ruta en `src/router.tsx`**

En `src/router.tsx`, agregar la importación lazy después de `WholesalePage`:

```typescript
const ProductsPage = lazy(() => import('@/pages/ProductsPage'))
```

Y en el array `children` de la ruta `/`, agregar la ruta **antes** de `wholesale`:

```typescript
{ path: 'productos',          element: withSuspense(ProductsPage) },
```

El bloque `children` completo queda así:

```typescript
children: [
  { index: true,               element: withSuspense(HomePage) },
  { path: 'colecciones',       element: withSuspense(CatalogPage) },
  { path: 'colecciones/:slug', element: withSuspense(DropPage) },
  { path: 'productos',         element: withSuspense(ProductsPage) },
  { path: 'productos/:slug',   element: withSuspense(ProductPage) },
  { path: 'wholesale',         element: withSuspense(WholesalePage) },
  { path: '*',                 element: withSuspense(NotFoundPage) },
],
```

> Nota: `productos` (listado) debe ir antes que `productos/:slug` (detalle) para que el router resuelva correctamente.

- [ ] **Step 2: Agregar "Productos" al Header**

En `src/components/layout/Header.tsx`, reemplazar el array `NAV_LINKS`:

```typescript
const NAV_LINKS = [
  { to: '/colecciones', label: 'Colecciones' },
  { to: '/productos',   label: 'Productos' },
  { to: '/wholesale',   label: 'Wholesale' },
]
```

- [ ] **Step 3: Verificar build**

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 4: Verificar que los tests existentes del Header no se rompen**

```bash
npm run test:run -- src/components/layout/__tests__/Header.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/router.tsx src/components/layout/Header.tsx
git commit -m "feat(nav): add Productos route and header nav item"
```

---

## Task 11: Verificación final

**Files:** ninguno nuevo

- [ ] **Step 1: Suite completa de tests**

```bash
npm run test:run
```

Expected: PASS — todos los tests existentes (60) + los nuevos (useProductsCatalog ×7, ProductsGridSkeleton ×1, ProductsPagination ×6, ProductsFilterBar ×6) = al menos 80 tests.

- [ ] **Step 2: Build + gate de tipos**

```bash
npm run build
```

Expected: PASS — `tsc -b` sin errores, `vite build` exitoso.

- [ ] **Step 3: Criterios de aceptación visual (requiere servidor local)**

```bash
npm run dev
```

Verificar manualmente:

- [ ] "Productos" aparece entre Colecciones y Wholesale en el header, con NavLink activo en `/productos`
- [ ] El skeleton aparece durante el primer load (si hay latencia de red) — probar con throttle en DevTools
- [ ] Los filtros de talla, color, precio y stock funcionan combinados en el Sheet
- [ ] Los chips de talla y color aparecen y desaparecen con animación en la barra
- [ ] Cambiar página → las cards entran con stagger animation
- [ ] Los filtros activos se reflejan en la URL y persisten al recargar
- [ ] Estado vacío muestra ícono + texto + CTA "Limpiar filtros"
- [ ] En mobile: el Sheet de filtros desliza desde la izquierda
- [ ] Solo muestra productos sin colección (verificar en los datos de la BD)

---

## Self-Review del plan

**Cobertura del spec:**
- Ruta `/productos` → Task 10 ✓
- Nav item "Productos" → Task 10 ✓
- Solo `collection_id IS NULL` → SQL en Task 1 + hook en Task 2 ✓
- Filtros talla/color/precio/stock → Task 7 (Sheet) + Task 8 (Bar) ✓
- Filtros en URL → Task 9 (useSearchParams) ✓
- 12 por página, paginación → Task 4 + Task 9 ✓
- Skeleton → Task 3 ✓
- Stagger animation → Task 6 + Task 9 (animationKey) ✓
- Estado vacío → Task 9 ✓
- Build + tests → Task 11 ✓

**Dependencias de orden:**
1. Task 1 (SQL) → puede correr en paralelo con Tasks 3-5 que son pure UI
2. Task 2 (hook) → requiere Task 1 aplicada en Supabase
3. Tasks 3, 4, 5 → independientes entre sí y de Task 2
4. Task 6 (Grid) → requiere tipos de Task 2 (`CatalogProduct`)
5. Task 7 (Sheet) → requiere tipos de Task 2 + componente de Task 5
6. Task 8 (FilterBar) → requiere tipos de Task 2
7. Task 9 (Page) → requiere Tasks 2-8
8. Task 10 (Router/Header) → puede correr en paralelo con Task 9
9. Task 11 → requiere todos

**Orden seguro de ejecución:** 1 → 2 → (3, 4, 5 en paralelo) → (6, 7, 8 en paralelo) → 9 → 10 → 11
