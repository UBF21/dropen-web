import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import type { Collection } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  slug: z.string().min(2, 'Slug requerido').regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  description: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  collection: Collection | null
  onClose: () => void
  onSaved: () => void
}

export default function DropFormDialog({ open, collection, onClose, onSaved }: Props) {
  const isEdit = !!collection
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '', description: '' },
  })

  useEffect(() => {
    if (collection) {
      form.reset({ name: collection.name, slug: collection.slug, description: collection.description ?? '' })
    } else {
      form.reset({ name: '', slug: '', description: '' })
    }
  }, [collection, form])

  async function handleSave(data: FormData) {
    if (isEdit && collection) {
      const { error } = await supabase.from('collections').update({
        name: data.name, slug: data.slug, description: data.description ?? null,
      }).eq('id', collection.id)
      if (error) { toast.error('Error al actualizar'); return }
      toast.success('Drop actualizado')
    } else {
      const { error } = await supabase.from('collections').insert({
        name: data.name, slug: data.slug, description: data.description ?? null, active: true,
      })
      if (error) { toast.error('Error al crear'); return }
      toast.success('Drop creado')
    }
    onSaved()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-surface border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wide text-text-primary">
            {isEdit ? 'Editar drop' : 'Nuevo drop'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-text-muted uppercase tracking-wider">Nombre</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-background border-border text-text-primary rounded-none focus:border-accent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="slug" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-text-muted uppercase tracking-wider">Slug</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-background border-border text-text-primary rounded-none focus:border-accent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-text-muted uppercase tracking-wider">Descripción</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} className="bg-background border-border text-text-primary rounded-none focus:border-accent resize-none" />
                </FormControl>
              </FormItem>
            )} />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose}
                className="border-border text-text-muted rounded-none">Cancelar</Button>
              <Button type="submit"
                className="bg-accent hover:bg-accent-hover text-background text-xs tracking-wider rounded-none">
                {isEdit ? 'Actualizar' : 'Crear drop'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
