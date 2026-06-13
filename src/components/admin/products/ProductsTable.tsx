import { ArrowUpDown, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import type { FilterField } from '@/components/ui/data-table'
import type { Product } from '@/types'

const arsFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

interface Props {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
  onToggleActive: (productId: string, active: boolean) => void
}

const filterFields: FilterField[] = [
  {
    id: 'active',
    label: 'Estado',
    type: 'select',
    options: [
      { label: 'Activo', value: 'true' },
      { label: 'Inactivo', value: 'false' },
    ],
  },
]

export default function ProductsTable({ products, onEdit, onDelete, onToggleActive }: Props) {
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 font-medium hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nombre
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm font-medium text-text-primary">{row.original.name}</span>
      ),
    },
    {
      accessorKey: 'price',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 font-medium hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Precio
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-text-muted">{arsFormatter.format(row.original.price)}</span>
      ),
    },
    {
      id: 'collection',
      accessorFn: (row) => row.collection?.name ?? '',
      header: 'Colección',
      cell: ({ row }) => (
        <span className="text-sm text-text-muted">{row.original.collection?.name ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'active',
      header: 'Estado',
      filterFn: (row, _id, value) => value === '' || String(row.original.active) === value,
      cell: ({ row }) => (
        row.original.active
          ? <Badge variant="default" className="text-xs">Activo</Badge>
          : <Badge variant="secondary" className="text-xs">Inactivo</Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="flex items-center gap-2 justify-end">
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
              variant="ghost"
              size="icon"
              onClick={() => onEdit(product)}
              className="text-text-muted hover:text-text-primary"
              aria-label="Editar"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(product.id)}
              className="text-text-muted hover:text-error"
              aria-label="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={products}
      searchColumn="name"
      searchPlaceholder="Buscar producto..."
      filterFields={filterFields}
    />
  )
}
