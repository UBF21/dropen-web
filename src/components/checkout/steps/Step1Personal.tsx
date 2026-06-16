import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useOrderStore } from '@/store/order.store'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { DocType } from '@/types'

const DOC_TYPES: DocType[] = ['DNI', 'CE', 'Pasaporte']

const DOC_PLACEHOLDERS: Record<DocType, string> = {
  DNI: '8 dígitos',
  CE: '9 dígitos',
  Pasaporte: '9–12 caracteres',
}

const schema = z
  .object({
    firstName: z.string().min(2, 'Mínimo 2 caracteres').max(50),
    lastName:  z.string().min(2, 'Mínimo 2 caracteres').max(50),
    docType:   z.enum(['DNI', 'CE', 'Pasaporte'] as const),
    docNumber: z.string().min(1, 'Campo requerido'),
  })
  .superRefine((data, ctx) => {
    const { docType, docNumber } = data
    if (docType === 'DNI') {
      if (!/^\d{8}$/.test(docNumber))
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['docNumber'], message: 'DNI debe tener exactamente 8 dígitos' })
    } else if (docType === 'CE') {
      if (!/^\d{9}$/.test(docNumber))
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['docNumber'], message: 'CE debe tener exactamente 9 dígitos' })
    } else if (docType === 'Pasaporte') {
      if (!/^[A-Za-z0-9]{9,12}$/.test(docNumber))
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['docNumber'], message: 'Pasaporte: 9–12 caracteres alfanuméricos' })
    }
  })

type FormValues = z.infer<typeof schema>

export default function Step1Personal() {
  const { firstName, lastName, docType, docNumber, setPersonal, setStep } = useOrderStore()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName, lastName, docType, docNumber },
  })

  const watchedDocType = form.watch('docType')

  function onSubmit(values: FormValues) {
    setPersonal(values)
    setStep(2)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="firstName" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] uppercase tracking-[3px] text-text-muted">Nombre</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Felipe"
                  className="rounded-none border-border bg-surface text-text-primary focus-visible:ring-0 focus-visible:border-accent" />
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )} />

          <FormField control={form.control} name="lastName" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] uppercase tracking-[3px] text-text-muted">Apellido</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Montenegro"
                  className="rounded-none border-border bg-surface text-text-primary focus-visible:ring-0 focus-visible:border-accent" />
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="docType" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-[10px] uppercase tracking-[3px] text-text-muted block mb-2">
              Tipo de documento
            </FormLabel>
            <FormControl>
              <div className="flex border border-border">
                {DOC_TYPES.map((type) => (
                  <button key={type} type="button"
                    onClick={() => { field.onChange(type); form.setValue('docNumber', '') }}
                    className={`flex-1 py-2.5 text-[10px] tracking-widest uppercase transition-colors
                      ${field.value === type
                        ? 'bg-accent text-background font-semibold'
                        : 'bg-surface text-text-muted hover:text-text-primary'}`}>
                    {type}
                  </button>
                ))}
              </div>
            </FormControl>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )} />

        <FormField control={form.control} name="docNumber" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-[10px] uppercase tracking-[3px] text-text-muted">
              Número de {watchedDocType}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={DOC_PLACEHOLDERS[watchedDocType]}
                inputMode={watchedDocType === 'Pasaporte' ? 'text' : 'numeric'}
                maxLength={watchedDocType === 'DNI' ? 8 : watchedDocType === 'CE' ? 9 : 12}
                className="rounded-none border-border bg-surface text-text-primary focus-visible:ring-0 focus-visible:border-accent"
              />
            </FormControl>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )} />

        <Button type="submit"
          className="w-full rounded-none bg-accent text-background hover:bg-accent/90 py-3 text-[11px] tracking-[3px] uppercase font-semibold">
          Continuar
        </Button>
      </form>
    </Form>
  )
}
