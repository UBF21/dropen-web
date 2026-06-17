import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronDown, Check } from 'lucide-react'
import { useOrderStore } from '@/store/order.store'
import { usePhonePrefixes } from '@/hooks/usePhonePrefixes'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
  const phonePrefixes = usePhonePrefixes()
  const [prefixOpen, setPrefixOpen] = useState(false)
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
                  <Popover open={prefixOpen} onOpenChange={setPrefixOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex items-center gap-1 h-10 w-full px-3 border border-border border-r-0 bg-surface text-sm text-text-primary hover:border-accent focus-visible:outline-none transition-colors font-mono"
                      >
                        <span className="flex-1 text-left truncate">{field.value}</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-text-muted flex-shrink-0 transition-transform ${prefixOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      sideOffset={0}
                      className="w-[220px] p-0 rounded-none border border-border bg-surface shadow-xl"
                    >
                      <div className="max-h-60 overflow-y-auto dropdown-scroll">
                      {phonePrefixes.map((p) => {
                        const isSelected = field.value === p.code
                        return (
                          <button
                            key={p.code}
                            type="button"
                            onClick={() => { field.onChange(p.code); setPrefixOpen(false) }}
                            className={`w-full text-left flex items-center justify-between px-3 py-2.5 text-[11px] font-mono tracking-wide transition-colors hover:bg-background ${
                              isSelected ? 'text-accent font-semibold' : 'text-text-muted'
                            }`}
                          >
                            {p.label}
                            {isSelected && <Check className="w-3 h-3 shrink-0" />}
                          </button>
                        )
                      })}
                      </div>
                    </PopoverContent>
                  </Popover>
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
