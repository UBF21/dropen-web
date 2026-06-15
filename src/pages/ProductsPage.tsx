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

      <div className="pt-24 pb-4 px-4 max-w-7xl mx-auto">
        <h1 className="font-display font-bold text-4xl tracking-[0.2em] uppercase text-text-primary">
          Productos
        </h1>
      </div>

      <ProductsFilterBar
        filters={filters}
        totalCount={totalCount}
        onFiltersChange={updateFilters}
        onClear={clearFilters}
        onOpenFilters={() => setFilterSheetOpen(true)}
      />

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

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <ProductsGridSkeleton />
        ) : products.length === 0 ? (
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
