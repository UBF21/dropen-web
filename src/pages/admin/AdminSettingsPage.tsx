import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAdmin } from '@/hooks/useAdmin'

// SiteSettings es un DTO de presentación — los valores se guardan como strings en la tabla site_settings
interface SiteSettings {
  wholesale_min_units: string
  wholesale_max_units: string
  whatsapp_number: string
  site_name: string
}

export default function AdminSettingsPage() {
  const { can } = useAdmin()
  const isAdmin = can(['admin'])
  const [settings, setSettings] = useState<SiteSettings>({
    wholesale_min_units: '6',
    wholesale_max_units: '60',
    whatsapp_number: '51991941252',
    site_name: 'DROPEN',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('key, value')
      .then(({ data }) => {
        if (!data) return
        const map = Object.fromEntries(data.map(({ key, value }: { key: string; value: string }) => [key, value]))
        setSettings((prev) => ({ ...prev, ...map }))
      })
  }, [])

  async function handleSave() {
    setSaving(true)
    const entries = Object.entries(settings).map(([key, value]) => ({ key, value }))
    for (const entry of entries) {
      const { error } = await supabase.from('site_settings').upsert(entry, { onConflict: 'key' })
      if (error) {
        toast.error(`Error al guardar "${entry.key}"`)
        setSaving(false)
        return
      }
    }
    toast.success('Ajustes guardados')
    setSaving(false)
  }

  const fields: { key: keyof SiteSettings; label: string; type?: string }[] = [
    { key: 'site_name', label: 'Nombre del sitio' },
    { key: 'whatsapp_number', label: 'Número WhatsApp', type: 'tel' },
    { key: 'wholesale_min_units', label: 'Mínimo unidades wholesale', type: 'number' },
    { key: 'wholesale_max_units', label: 'Máximo unidades wholesale', type: 'number' },
  ]

  return (
    <div className="p-8 max-w-lg">
      <h1 className="font-display font-bold text-2xl text-text-primary mb-8 tracking-wide">Ajustes</h1>
      <div className="space-y-5">
        {fields.map(({ key, label, type }) => (
          <div key={key}>
            <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">{label}</label>
            <Input
              type={type ?? 'text'}
              value={settings[key]}
              disabled={!isAdmin}
              onChange={(e) => setSettings((prev) => ({ ...prev, [key]: e.target.value }))}
              className="bg-surface border-border text-text-primary rounded-none focus:border-accent disabled:opacity-50"
            />
          </div>
        ))}
      </div>
      {isAdmin && (
        <Button
          onClick={handleSave} disabled={saving}
          className="mt-8 bg-accent hover:bg-accent-hover text-background text-xs tracking-wider rounded-none"
        >
          {saving ? 'Guardando...' : 'Guardar ajustes'}
        </Button>
      )}
      {!isAdmin && (
        <p className="mt-4 text-xs text-text-muted">Solo administradores pueden cambiar estos ajustes.</p>
      )}
    </div>
  )
}
