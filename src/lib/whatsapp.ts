import type { WhatsAppLine } from '@/types'
import { getCurrencySymbol } from '@/lib/currency'

export function buildWhatsAppMessage(
  lines: WhatsAppLine[],
  reference: string,
  currencyCode = 'PEN'
): string {
  const symbol = getCurrencySymbol(currencyCode)
  const itemLines = lines
    .map(
      (l) =>
        `${l.productName}\nTalla: ${l.size} | ${l.color}\nCant: ${l.quantity} — ${symbol} ${l.price.toFixed(2)}`
    )
    .join('\n\n')

  const total = lines.reduce((sum, l) => sum + l.price * l.quantity, 0)

  return [
    '🛍 Nuevo pedido DROPEN',
    '─────────────────────',
    itemLines,
    '',
    `Total: ${symbol} ${total.toFixed(2)}`,
    `Ref: ${reference}`,
    '─────────────────────',
    '*Reservado por 2 horas*',
  ].join('\n')
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

interface OrderMessageParams {
  docType: string
  docNumber: string
  firstName: string
  lastName: string
  orderId: string
  reference: string
}

export function buildOrderWhatsAppMessage(params: OrderMessageParams): string {
  const { docNumber, firstName, lastName, orderId } = params
  const baseUrl = window.location.origin
  return `${docNumber} - ${firstName} ${lastName}\n${baseUrl}/pedido/${orderId}`
}
