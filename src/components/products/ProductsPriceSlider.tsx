import * as React from 'react'
import { Slider as SliderPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

interface Props {
  min: number
  max: number
  value: [number, number]
  onValueChange: (value: [number, number]) => void
  formatValue?: (v: number) => string
  className?: string
}

export default function ProductsPriceSlider({
  min,
  max,
  value,
  onValueChange,
  formatValue,
  className,
}: Props) {
  const fmt = formatValue ?? ((v: number) => String(v))

  function handleMinInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value === '' || isNaN(Number(e.target.value))) return
    const v = Math.min(Number(e.target.value), value[1])
    onValueChange([Math.max(min, v), value[1]])
  }

  function handleMaxInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value === '' || isNaN(Number(e.target.value))) return
    const v = Math.max(Number(e.target.value), value[0])
    onValueChange([value[0], Math.min(max, v)])
  }

  return (
    <div className={cn('space-y-4', className)}>
      <SliderPrimitive.Root
        min={min}
        max={max}
        step={1}
        value={value}
        onValueChange={(v) => onValueChange(v as [number, number])}
        className="relative flex w-full touch-none select-none items-center"
      >
        <SliderPrimitive.Track className="relative h-px w-full grow bg-border">
          <SliderPrimitive.Range className="absolute h-full bg-accent" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className="block h-3.5 w-3.5 rounded-full border border-accent bg-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          aria-label="Precio mínimo"
        />
        <SliderPrimitive.Thumb
          className="block h-3.5 w-3.5 rounded-full border border-accent bg-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          aria-label="Precio máximo"
        />
      </SliderPrimitive.Root>

      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value[0]}
          min={min}
          max={value[1]}
          onChange={handleMinInput}
          aria-label="Precio mínimo"
          className="w-20 bg-surface border border-border text-text-primary text-xs px-2 py-1 text-center focus:outline-none focus:border-accent"
        />
        <span className="text-text-muted text-xs flex-1 text-center">—</span>
        <input
          type="number"
          value={value[1]}
          min={value[0]}
          max={max}
          onChange={handleMaxInput}
          aria-label="Precio máximo"
          className="w-20 bg-surface border border-border text-text-primary text-xs px-2 py-1 text-center focus:outline-none focus:border-accent"
        />
      </div>

      <div className="flex justify-between text-[10px] text-text-muted">
        <span>{fmt(min)}</span>
        <span>{fmt(max)}</span>
      </div>
    </div>
  )
}
