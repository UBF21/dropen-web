import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useCollections } from '@/hooks/useProducts'
import { Button } from '@/components/ui/button'
import DropsTable from '@/components/admin/drops/DropsTable'
import DropFormSheet from '@/components/admin/drops/DropFormSheet'
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
    const { error } = await supabase.from('collections').delete().eq('id', colId)
    if (error) { toast.error('Error al eliminar'); return }
    toast.success('Drop eliminado')
    forceRefresh((n) => n + 1)
  }

  async function handleToggleActive(colId: string, active: boolean) {
    const { error } = await supabase.from('collections').update({ active }).eq('id', colId)
    if (error) { toast.error('Error al actualizar'); return }
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
      <DropFormSheet
        open={dialogOpen} collection={editingCol}
        onClose={() => setDialogOpen(false)} onSaved={() => forceRefresh((n) => n + 1)}
      />
    </div>
  )
}
