interface Props {
  step: 1 | 2 | 3
}

const STEPS = [
  { n: 1 as const, label: 'Datos' },
  { n: 2 as const, label: 'Dirección' },
  { n: 3 as const, label: 'Confirmar' },
]

export default function CheckoutProgress({ step }: Props) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center flex-1">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold transition-colors
              ${step >= s.n ? 'bg-accent text-background' : 'border border-border text-text-muted'}`}>
              {step > s.n ? '✓' : s.n}
            </div>
            <span className={`text-[9px] uppercase tracking-[2px] whitespace-nowrap
              ${step >= s.n ? 'text-accent' : 'text-text-muted'}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px mb-4 mx-1 transition-colors ${step > s.n ? 'bg-accent' : 'bg-border'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
