import type { WhatsAppLine } from '@/types'

export function buildWhatsAppMessage(lines: WhatsAppLine[], reference: string): string {
  const itemLines = lines
    .map(
      (l) =>
        `${l.productName}\nTalla: ${l.size} | ${l.color}\nCant: ${l.quantity} — S/ ${l.price.toFixed(2)}`
    )
    .join('\n\n')

  const total = lines.reduce((sum, l) => sum + l.price * l.quantity, 0)

  return [
    '🛍 Nuevo pedido DROPEN',
    '─────────────────────',
    itemLines,
    '',
    `Total: S/ ${total.toFixed(2)}`,
    `Ref: ${reference}`,
    '─────────────────────',
    '*Reservado por 2 horas*',
  ].join('\n')
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}
