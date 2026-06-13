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
