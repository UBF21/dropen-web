import { useMemo } from 'react'
import { Pencil, Trash2, ToggleLeft, ToggleRight, ArrowUpDown } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable, type FilterField } from '@/components/ui/data-table'
import type { Collection } from '@/types'

interface Props {
  collections: Collection[]
  onEdit: (collection: Collection) => void
  onDelete: (collectionId: string) => void
  onToggleActive: (collectionId: string, active: boolean) => void
}

export default function DropsTable({ collections, onEdit, onDelete, onToggleActive }: Props) {
  const columns = useMemo<ColumnDef<Collection>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-3 text-xs uppercase tracking-wide text-text-muted hover:text-text-primary"
          >
            Nombre <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <p className="text-text-primary text-sm font-medium">{row.original.name}</p>
            <p className="text-xs text-text-muted mt-0.5">{row.original.slug}</p>
          </div>
        ),
      },
      {
        accessorKey: 'active',
        id: 'active',
        header: 'Estado',
        cell: ({ row }) =>
          row.original.active ? (
            <Badge className="bg-accent/10 text-accent border-accent/20">Activo</Badge>
          ) : (
            <Badge variant="outline" className="text-text-muted">Inactivo</Badge>
          ),
        filterFn: (row, _id, value) => !value || String(row.original.active) === value,
      },
      {
        accessorKey: 'created_at',
        header: 'Creado',
        cell: ({ row }) => {
          const date = row.original.created_at
          if (!date) return <span className="text-text-muted text-sm">—</span>
          return (
            <span className="text-sm text-text-muted">
              {format(new Date(date), 'dd MMM yyyy', { locale: es })}
            </span>
          )
        },
      },
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
          const col = row.original
          return (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onToggleActive(col.id, !col.active)}
                aria-label={col.active ? 'Desactivar' : 'Activar'}
                className="text-text-muted hover:text-accent transition-colors p-1"
              >
                {col.active
                  ? <ToggleRight className="w-5 h-5 text-accent" />
                  : <ToggleLeft className="w-5 h-5" />
                }
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(col)}
                className="text-text-muted hover:text-text-primary"
                aria-label="Editar"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(col.id)}
                className="text-text-muted hover:text-error"
                aria-label="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )
        },
      },
    ],
    [onEdit, onDelete, onToggleActive],
  )

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        id: 'active',
        label: 'Estado',
        type: 'select',
        options: [
          { label: 'Activo', value: 'true' },
          { label: 'Inactivo', value: 'false' },
        ],
      },
    ],
    [],
  )

  return (
    <DataTable
      columns={columns}
      data={collections}
      searchColumn="name"
      searchPlaceholder="Buscar drop..."
      filterFields={filterFields}
    />
  )
}
