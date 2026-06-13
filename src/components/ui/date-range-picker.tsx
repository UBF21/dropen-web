import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { type DateRange } from 'react-day-picker'
import { CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DateRangePickerProps {
  value: DateRange | undefined
  onChange: (range: DateRange | undefined) => void
  className?: string
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)

  const label = value?.from
    ? value.to
      ? `${format(value.from, 'dd MMM', { locale: es })} – ${format(value.to, 'dd MMM yyyy', { locale: es })}`
      : format(value.from, 'dd MMM yyyy', { locale: es })
    : 'Seleccioná rango'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={`h-9 gap-2 text-sm ${className ?? ''}`}>
          <CalendarDays className="w-4 h-4 text-text-muted" />
          <span className={value ? 'text-text-primary' : 'text-text-muted'}>{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-surface border-border" align="end">
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          locale={es}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}
