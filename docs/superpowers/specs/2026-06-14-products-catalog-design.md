# Products Catalog Page — Design Spec

**Fecha:** 2026-06-14  
**Feature:** Página `/productos` con listado, filtros avanzados y paginación  
**Stack:** React 19 · TypeScript · Vite · Tailwind CSS v4 · framer-motion ^11 · Supabase · Zustand  

---

## 1. Objetivo

Agregar un ítem "Productos" al header de navegación y crear una página `/productos` que liste todos los productos activos sin colección (`collection_id IS NULL`) con filtros avanzados server-side, paginación real, skeletons estructurados y animaciones de nivel premium.

Los productos con `collection_id IS NOT NULL` son exclusivos de sus drops y no aparecen aquí.

---

## 2. Cambios de navegación

### `src/router.tsx`
- Nueva ruta pública: `/productos` → `ProductsPage`

### `src/components/layout/Header.tsx`
- Agregar `{ to: '/productos', label: 'Productos' }` al array `NAV_LINKS` entre "Colecciones" y "Wholesale"

---

## 3. Arquitectura de datos

### 3.1 Función RPC en Supabase

**Archivo:** `supabase/migrations/011_products_catalog_rpc.sql`

Función `get_products_catalog(p_filters jsonb)` que:
- Filtra `products WHERE collection_id IS NULL AND deleted_at IS NULL AND active = true`
- Join con `product_variants WHERE deleted_at IS NULL` para filtros de talla/color/stock
- Join con `product_images` para imagen primaria
- Aplica filtros dinámicos: precio min/max, tallas (array), colores (array), solo con stock
- Aplica ordenamiento: `recent` (created_at DESC), `price_asc`, `price_desc`, `name_asc`, `popular` (conteo de reservas activas)
- Paginación con `LIMIT` / `OFFSET`
- Retorna filas + total count en un campo `total_count` en cada fila (window function)

Parámetros del jsonb de entrada:
```json
{
  "precio_min": 0,
  "precio_max": 9999,
  "tallas": ["32", "34"],
  "colores": ["Black", "Stone"],
  "solo_stock": true,
  "orden": "recent",
  "pagina": 1,
  "por_pagina": 12
}
```

Retorna rows con shape: `id, name, slug, price, moneda_code, primary_image_url, total_stock, total_count`  
`primary_image_url` se obtiene con `(SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true AND deleted_at IS NULL LIMIT 1)`.  
`total_stock` es la suma de `stock` de todas las variantes activas del producto.

### 3.2 Hook `useProductsCatalog`

**Archivo:** `src/hooks/useProductsCatalog.ts`

```typescript
interface CatalogFilters {
  precioMin: number
  precioMax: number
  tallas: string[]
  colores: string[]
  soloStock: boolean
  orden: 'recent' | 'price_asc' | 'price_desc' | 'name_asc' | 'popular'
  pagina: number
}

interface CatalogProduct {
  id: string
  name: string
  slug: string
  price: number
  moneda_code: string
  primary_image_url: string | null
  total_stock: number
}

interface UseCatalogResult {
  products: CatalogProduct[]
  totalCount: number
  totalPages: number
  loading: boolean
  error: string | null
}

export function useProductsCatalog(filters: CatalogFilters): UseCatalogResult
```

Llama a `supabase.rpc('get_products_catalog', { p_filters: filters })`.  
Re-fetcha en cada cambio de `filters` (dependencia de `useEffect`).  
`loading` se activa en cada cambio de filtros (no solo en el primer render).

### 3.3 Filtros en URL

Los filtros se persisten como search params para que el link sea shareable y el back button funcione:

```
/productos?tallas=32,34&colores=Black&soloStock=true&precioMin=50&precioMax=300&orden=recent&page=2
```

`ProductsPage` lee los params con `useSearchParams`, los sincroniza con el estado local y los escribe en cada cambio de filtro.

### 3.4 Valores iniciales de filtros (fetch de metadata)

Al montar `ProductsPage` se hace un único fetch de metadata con una función RPC separada `get_products_catalog_meta()` que retorna:
- `price_min`, `price_max` — para inicializar el slider
- `available_sizes` — array de strings únicos para los chips de talla
- `available_colors` — array de strings únicos para los círculos de color

Este fetch es independiente de los filtros y no se repite al paginar o filtrar.

---

## 4. Componentes

### 4.1 `ProductsPage.tsx`
**Ruta:** `src/pages/ProductsPage.tsx`

Responsabilidades:
- Lee/escribe search params (filtros + página)
- Instancia `useProductsCatalog(filters)`
- Renderiza título, `ProductsFilterBar`, `ProductsGrid` o `ProductsGridSkeleton`, `ProductsPagination`
- Maneja estado vacío (0 resultados)
- Scroll al top en cada cambio de página

### 4.2 `ProductsFilterBar.tsx`
**Ruta:** `src/components/products/ProductsFilterBar.tsx`

Barra sticky bajo el header (`top-16`, mismo offset que el header fijo).  
Contenido:
- Chips de filtros activos con `AnimatePresence` (botón × por chip)
- Botón "Filtros" que abre `ProductsFilterSheet` (muestra badge con conteo de filtros activos)
- Dropdown de ordenamiento (`<select>` nativo o Radix DropdownMenu)
- Conteo de resultados: "24 productos"
- Botón "Limpiar" visible solo cuando hay filtros activos

### 4.3 `ProductsFilterSheet.tsx`
**Ruta:** `src/components/products/ProductsFilterSheet.tsx`

Sheet (Radix) que se abre desde el botón "Filtros".  
Secciones dentro del sheet:
1. **Precio** — `ProductsPriceSlider` (dual range, inputs numéricos sincronizados)
2. **Talla** — chips seleccionables (multi-select), valores únicos de los productos actuales
3. **Color** — círculos de color igual que `VariantSelector`, multi-select
4. **Disponibilidad** — toggle "Solo productos con stock"
5. Footer fijo: botón "Aplicar" + botón "Limpiar todo"

Los valores de talla/color disponibles se obtienen de un fetch separado al montar la página (query de todos los `size`/`color` únicos en variantes de productos con `collection_id IS NULL`). Esto garantiza que los filtros no cambien al paginar.

### 4.4 `ProductsPriceSlider.tsx`
**Ruta:** `src/components/products/ProductsPriceSlider.tsx`

Slider dual (dos thumbs: min y max) implementado con Radix `@radix-ui/react-slider` (ya disponible en el proyecto vía shadcn).  
Inputs numéricos debajo del slider, sincronizados bidireccional.  
Muestra el rango formateado con `useSiteCurrency`.

### 4.5 `ProductsGrid.tsx`
**Ruta:** `src/components/products/ProductsGrid.tsx`

```
Grid: grid-cols-2 md:grid-cols-3 gap-4 md:gap-6
```

Recibe `products: CatalogProduct[]` y los renderiza como `ProductCard`.  
`ProductCard` ya existe — se usa sin modificar.  
Animación de entrada: `motion.div` con `variants` stagger en el contenedor:

```typescript
container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }
```

La key del contenedor incluye `pagina` + hash de filtros para forzar re-mount y re-ejecutar la animación en cada cambio.

### 4.6 `ProductsGridSkeleton.tsx`
**Ruta:** `src/components/products/ProductsGridSkeleton.tsx`

12 cards skeleton con exactamente las mismas dimensiones que las cards reales:
- `aspect-[3/4]` para la imagen
- `h-4 w-3/4` para el nombre
- `h-4 w-1/3` para el precio

Usa `<Skeleton className="bg-surface" />` (convención del proyecto).  
No usa animación de entrada — aparece instantáneamente para feedback inmediato.

### 4.7 `ProductsPagination.tsx`
**Ruta:** `src/components/products/ProductsPagination.tsx`

Recibe `currentPage`, `totalPages`, `onPageChange`.  
Muestra: `← Anterior  1  2  [3]  4  5  Siguiente →`  
Máximo 5 páginas visibles con ellipsis (`...`) para catálogos grandes.  
Deshabilita "Anterior" en página 1, "Siguiente" en última página.

---

## 5. Animaciones

| Elemento | Animación |
|---|---|
| Cards al entrar | stagger 0.05s, opacity 0→1, y 20→0, duration 0.3s |
| Chips de filtro | AnimatePresence, scale + opacity, spring |
| Cambio de página | contenedor re-mount → stagger se re-ejecuta automáticamente |
| Estado vacío | fade in con delay 0.1s |
| Filter Sheet | Radix Sheet con slide from right (ya built-in) |

No se agrega `useReducedMotion` aquí — el proyecto ya lo maneja a nivel global.

---

## 6. Estados de la página

| Estado | Render |
|---|---|
| Cargando (primer load o cambio de filtro) | `ProductsGridSkeleton` (12 cards) |
| Con resultados | `ProductsGrid` + `ProductsPagination` |
| Sin resultados (0 productos) | Ícono vacío + texto + botón "Limpiar filtros" |
| Error de red | Texto de error + botón "Reintentar" |

---

## 7. Archivos nuevos / modificados

| Acción | Archivo |
|---|---|
| Crear | `supabase/migrations/011_products_catalog_rpc.sql` |
| Crear | `src/hooks/useProductsCatalog.ts` |
| Crear | `src/pages/ProductsPage.tsx` |
| Crear | `src/components/products/ProductsFilterBar.tsx` |
| Crear | `src/components/products/ProductsFilterSheet.tsx` |
| Crear | `src/components/products/ProductsPriceSlider.tsx` |
| Crear | `src/components/products/ProductsGrid.tsx` |
| Crear | `src/components/products/ProductsGridSkeleton.tsx` |
| Crear | `src/components/products/ProductsPagination.tsx` |
| Modificar | `src/router.tsx` — agregar ruta `/productos` |
| Modificar | `src/components/layout/Header.tsx` — agregar nav item |

---

## 8. Tests

| Archivo | Casos |
|---|---|
| `src/hooks/__tests__/useProductsCatalog.test.ts` | retorna productos, maneja error, loading true durante fetch |
| `src/components/products/__tests__/ProductsFilterBar.test.tsx` | renderiza chips de filtros activos, click × limpia filtro, conteo de resultados |
| `src/components/products/__tests__/ProductsPagination.test.tsx` | renderiza páginas correctas, deshabilita Anterior en p.1, llama onPageChange |
| `src/components/products/__tests__/ProductsGridSkeleton.test.tsx` | renderiza 12 skeletons |

---

## 9. Criterios de aceptación

- [ ] "Productos" aparece en el header entre Colecciones y Wholesale, con NavLink activo
- [ ] La página solo muestra productos con `collection_id IS NULL`
- [ ] Los filtros de talla, color, precio y stock funcionan en combinación
- [ ] Los filtros activos se reflejan en la URL y persisten al recargar
- [ ] La paginación muestra 12 productos por página con navegación correcta
- [ ] El skeleton se muestra durante cada fetch (inicial y cambios de filtro)
- [ ] Las cards entran con animación stagger en cada cambio de página
- [ ] El estado vacío aparece con CTA para limpiar filtros
- [ ] `npm run build` pasa sin errores de tipos
- [ ] `npm run test:run` pasa todos los tests nuevos y existentes

---

## 10. Dependencias y restricciones

- No se agregan dependencias npm nuevas (Radix Slider ya disponible vía shadcn)
- `ProductCard` se reutiliza sin modificar
- La RPC de Supabase debe crearse antes de que el hook funcione en producción
- El sort "popular" requiere que `reservations` tenga datos; si está vacío, todos los productos tienen igual popularidad (orden por `created_at` como tiebreaker)
