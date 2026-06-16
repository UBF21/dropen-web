const LOCALE_MAP: Record<string, string> = {
  PEN: 'es-PE',
  USD: 'en-US',
  ARS: 'es-AR',
}

export function formatCurrency(value: number, code: string): string {
  const locale = LOCALE_MAP[code] ?? 'es-PE'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
    maximumFractionDigits: 2,
  }).format(value)
}

export function getCurrencySymbol(code: string): string {
  const locale = LOCALE_MAP[code] ?? 'es-PE'
  return (
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 0,
    })
      .formatToParts(0)
      .find((p) => p.type === 'currency')?.value ?? code
  )
}
