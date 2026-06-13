import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña requerida'),
})
type FormData = z.infer<typeof schema>

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  async function handleLogin(data: FormData) {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error) {
      toast.error('Credenciales inválidas')
      setLoading(false)
      return
    }
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="font-display font-bold text-3xl tracking-[0.3em] text-text-primary">DROPEN</h1>
          <p className="text-text-muted text-sm mt-2 tracking-widest uppercase">Admin</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-text-muted text-xs uppercase tracking-wider">Email</FormLabel>
                <FormControl>
                  <Input
                    {...field} type="email" autoComplete="email"
                    className="bg-surface border-border text-text-primary focus:border-accent rounded-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-text-muted text-xs uppercase tracking-wider">Contraseña</FormLabel>
                <FormControl>
                  <Input
                    {...field} type="password" autoComplete="current-password"
                    className="bg-surface border-border text-text-primary focus:border-accent rounded-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button
              type="submit" disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover text-background text-xs tracking-wider rounded-none py-4"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
