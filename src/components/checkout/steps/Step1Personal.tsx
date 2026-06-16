import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useOrderStore } from '@/store/order.store'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { DocType } from '@/types'

// ─── Constantes ───────────────────────────────────────────────────────────────

const DOC_TYPES: DocType[] = ['DNI', 'CE', 'Pasaporte']

const DOC_PLACEHOLDERS: Record<DocType, string> = {
  DNI: '8 dígitos',
  CE: '9 dígitos',
  Pasaporte: '9–12 caracteres',
}

const PHONE_PREFIXES = [
  { code: '+51',  label: '+51 · Perú'              },
  { code: '+1',   label: '+1  · EE.UU. / Canadá'   },
  { code: '+52',  label: '+52 · México'             },
  { code: '+54',  label: '+54 · Argentina'          },
  { code: '+55',  label: '+55 · Brasil'             },
  { code: '+56',  label: '+56 · Chile'              },
  { code: '+57',  label: '+57 · Colombia'           },
  { code: '+58',  label: '+58 · Venezuela'          },
  { code: '+34',  label: '+34 · España'             },
  { code: '+591', label: '+591 · Bolivia'           },
  { code: '+593', label: '+593 · Ecuador'           },
  { code: '+595', label: '+595 · Paraguay'          },
  { code: '+598', label: '+598 · Uruguay'           },
  { code: '+44',  label: '+44 · Reino Unido'        },
]

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z
  .object({
    firstName:   z.string().min(2, 'Mínimo 2 caracteres').max(50),
    lastName:    z.string().min(2, 'Mínimo 2 caracteres').max(50),
    docType:     z.enum(['DNI', 'CE', 'Pasaporte'] as const),
    docNumber:   z.string().min(1, 'Campo requerido'),
    phonePrefix: z.string().min(1, 'Seleccioná un prefijo'),
    phone:       z
      .string()
      .min(7, 'Mínimo 7 dígitos')
      .max(15, 'Máximo 15 dígitos')
      .regex(/^\d+$/, 'Solo números, sin espacios ni guiones'),
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

// Clases compartidas para consistencia visual
const FIELD_CLS = 'rounded-none border-border bg-surface text-text-primary focus-visible:ring-0 focus-visible:border-accent'

// ─── Componente ───────────────────────────────────────────────────────────────

export default function Step1Personal() {
  const { firstName, lastName, docType, docNumber, phonePrefix, phone, setPersonal, setStep } = useOrderStore()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName, lastName, docType, docNumber, phonePrefix, phone },
  })

  const watchedDocType = form.watch('docType')

  function onSubmit(values: FormValues) {
    setPersonal(values)
    setStep(2)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">

        {/* Nombre / Apellido */}
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="firstName" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] uppercase tracking-[3px] text-text-muted">Nombre</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Felipe" className={FIELD_CLS} />
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )} />

          <FormField control={form.control} name="lastName" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] uppercase tracking-[3px] text-text-muted">Apellido</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Montenegro" className={FIELD_CLS} />
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )} />
        </div>

        {/* Tipo de documento */}
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

        {/* Número de documento */}
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
                className={FIELD_CLS}
              />
            </FormControl>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )} />

        {/* Teléfono con prefijo */}
        <FormItem>
          <FormLabel className="text-[10px] uppercase tracking-[3px] text-text-muted block mb-2">
            Teléfono
          </FormLabel>
          <div className="flex gap-0">
            {/* Prefijo */}
            <FormField control={form.control} name="phonePrefix" render={({ field }) => (
              <div className="flex-shrink-0 w-[140px]">
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="rounded-none border-border bg-surface text-text-primary text-sm h-10 focus-visible:ring-0 focus-visible:border-accent border-r-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-border bg-surface z-50 max-h-64">
                      {PHONE_PREFIXES.map((p) => (
                        <SelectItem
                          key={p.code} value={p.code}
                          className="rounded-none text-text-primary text-sm font-mono focus:bg-accent/10 focus:text-text-primary cursor-pointer"
                        >
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-[10px] mt-1">
                  {form.formState.errors.phonePrefix?.message}
                </FormMessage>
              </div>
            )} />

            {/* Número */}
            <FormField control={form.control} name="phone" render={({ field }) => (
              <div className="flex-1">
                <FormControl>
                  <Input
                    {...field}
                    inputMode="numeric"
                    placeholder="999 888 777"
                    maxLength={15}
                    className={`${FIELD_CLS} h-10`}
                  />
                </FormControl>
                <FormMessage className="text-[10px] mt-1">
                  {form.formState.errors.phone?.message}
                </FormMessage>
              </div>
            )} />
          </div>
        </FormItem>

        <Button type="submit"
          className="w-full rounded-none bg-accent text-background hover:bg-accent/90 py-3 text-[11px] tracking-[3px] uppercase font-semibold">
          Continuar
        </Button>
      </form>
    </Form>
  )
}
