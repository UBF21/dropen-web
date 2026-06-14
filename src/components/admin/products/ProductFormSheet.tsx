import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import VariantsEditor, { type VariantDraft } from './VariantsEditor'
import ImageUploader from './ImageUploader'
import type { Product, Collection } from '@/types'
import { useSiteCurrency } from '@/hooks/useSiteCurrency'

const schema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  slug: z.string().min(2, 'Slug requerido').regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  collection_id: z.string().min(1, 'Colección requerida'),
  price: z.coerce.number().positive('Precio inválido'),
  description: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  product: Product | null
  collections: Collection[]
  onClose: () => void
  onSaved: () => void
}

async function saveVariants(productId: string, variants: VariantDraft[]): Promise<boolean> {
  // NO convertir a soft delete: patrón replace-all de variantes; soft delete colisionaría con UNIQUE constraints (ver plan soft-delete Tarea F3)
  const { error: deleteError } = await supabase.from('product_variants').delete().eq('product_id', productId)
  if (deleteError) { toast.error('Error al actualizar variantes'); return false }
  if (variants.length > 0) {
    const { error: insertError } = await supabase
      .from('product_variants')
      .insert(variants.map((v) => ({ product_id: productId, ...v })))
    if (insertError) { toast.error('Error al insertar variantes'); return false }
  }
  return true
}

export default function ProductFormSheet({ open, product, collections, onClose, onSaved }: Props) {
  const isEdit = !!product
  const [variants, setVariants] = useState<VariantDraft[]>([])
  const [saving, setSaving] = useState(false)
  const currency = useSiteCurrency()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '', collection_id: '', price: 0, description: '' },
  })

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        slug: product.slug,
        collection_id: product.collection_id ?? '',
        price: product.price,
        description: product.description ?? '',
      })
      setVariants(
        product.variants?.map((v) => ({
          size: v.size,
          color: v.color,
          stock: v.stock,
          sku: v.sku,
        })) ?? []
      )
    } else {
      form.reset({ name: '', slug: '', collection_id: '', price: 0, description: '' })
      setVariants([])
    }
  }, [product, form])

  async function handleImageUploaded(url: string, storagePath: string) {
    if (!product) return
    const { error } = await supabase.from('product_images').insert({
      product_id: product.id,
      url,
      storage_path: storagePath,
      order: 0,
      is_primary: (product.images?.length ?? 0) === 0,
    })
    if (error) { toast.error('Error al registrar imagen'); return }
    toast.success('Imagen agregada')
    onSaved()
  }

  async function handleSave(data: FormData) {
    setSaving(true)
    try {
      if (isEdit && product) {
        const { error: updateError } = await supabase
          .from('products')
          .update({
            name: data.name,
            slug: data.slug,
            collection_id: data.collection_id,
            price: data.price,
            description: data.description ?? null,
          })
          .eq('id', product.id)
        if (updateError) { toast.error('Error al actualizar producto'); return }
        const variantsSaved = await saveVariants(product.id, variants)
        if (!variantsSaved) return
        toast.success('Producto actualizado')
        onSaved(); onClose()
      } else {
        const { data: inserted, error } = await supabase
          .from('products')
          .insert({
            name: data.name,
            slug: data.slug,
            collection_id: data.collection_id,
            price: data.price,
            moneda_code: currency.code,
            description: data.description ?? null,
            active: true,
          })
          .select('id')
          .single()
        if (error || !inserted) { toast.error('Error al crear producto'); return }
        await saveVariants(inserted.id, variants)
        toast.success('Producto creado')
        onSaved(); onClose()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="sm:max-w-xl w-full bg-surface border-border overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display tracking-wide text-text-primary">
            {isEdit ? 'Editar producto' : 'Nuevo producto'}
          </SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-5 mt-6">
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="collection_id" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-text-muted uppercase tracking-wider">Drop</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="bg-background border-border text-text-primary rounded-none">
                        <SelectValue placeholder="Seleccionar drop" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-surface border-border">
                      {collections.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-text-muted uppercase tracking-wider">
                    Precio ({currency.code})
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.01" min="0"
                      className="bg-background border-border text-text-primary rounded-none focus:border-accent" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-text-muted uppercase tracking-wider">Descripción</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3}
                    className="bg-background border-border text-text-primary rounded-none focus:border-accent resize-none" />
                </FormControl>
              </FormItem>
            )} />
            {isEdit && product && (
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Imágenes</p>
                <ImageUploader productId={product.id} onUploaded={handleImageUploaded} />
              </div>
            )}
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Variantes</p>
              <VariantsEditor variants={variants} onChange={setVariants} />
            </div>
            <div className="flex justify-end gap-3 pt-2 pb-6">
              <Button type="button" variant="outline" onClick={onClose}
                className="border-border text-text-muted rounded-none">
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}
                className="bg-accent hover:bg-accent-hover text-background text-xs tracking-wider rounded-none">
                {saving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear producto'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
