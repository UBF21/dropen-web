import { useCallback, useState } from 'react'
import { Upload } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

interface Props {
  productId: string
  onUploaded: (url: string, storagePath: string) => void
}

export default function ImageUploader({ productId, onUploaded }: Props) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  const upload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Solo se aceptan imágenes.'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Máximo 5 MB por imagen.'); return }

    setUploading(true)
    const ext = file.name.split('.').pop()
    const storagePath = `products/${productId}/${Date.now()}.${ext}`

    const { error } = await supabase.storage.from('product-images').upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
    })
    if (error) { toast.error('Error al subir imagen'); setUploading(false); return }

    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(storagePath)
    onUploaded(urlData.publicUrl, storagePath)
    setUploading(false)
    toast.success('Imagen subida')
  }, [productId, onUploaded])

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) upload(file)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed transition-colors rounded-none p-8 text-center ${
        dragging ? 'border-accent bg-accent/5' : 'border-border hover:border-text-muted'
      }`}
    >
      <Upload className="w-6 h-6 text-text-muted mx-auto mb-2" />
      {uploading ? (
        <p className="text-sm text-text-muted">Subiendo...</p>
      ) : (
        <>
          <p className="text-sm text-text-muted mb-2">
            Arrastrá una imagen o hacé click para seleccionar
          </p>
          <label className="cursor-pointer">
            <span className="text-xs text-accent underline underline-offset-2">Seleccionar archivo</span>
            <input type="file" accept="image/*" onChange={handleFileInput} className="sr-only" />
          </label>
          <p className="text-xs text-text-muted mt-2">PNG, JPG, WebP — máximo 5 MB</p>
        </>
      )}
    </div>
  )
}
