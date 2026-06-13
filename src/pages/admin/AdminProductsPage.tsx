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
