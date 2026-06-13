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
