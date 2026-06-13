import { describe, it, expect } from 'vitest'
import { buildWhatsAppMessage, buildWhatsAppUrl } from '../whatsapp'
import type { WhatsAppLine } from '@/types'

const lines: WhatsAppLine[] = [
  { productName: 'Jean Baggy Cargo', size: '32', color: 'Black', quantity: 1, price: 189 },
  { productName: 'Jean Baggy Slim', size: '30', color: 'Stone', quantity: 2, price: 199 },
]

describe('buildWhatsAppMessage', () => {
  it('incluye nombre, talla y color de cada item', () => {
    const msg = buildWhatsAppMessage(lines, 'DRP-ABC12345')
    expect(msg).toContain('Jean Baggy Cargo')
    expect(msg).toContain('Talla: 32 | Black')
    expect(msg).toContain('Jean Baggy Slim')
    expect(msg).toContain('Talla: 30 | Stone')
  })

  it('calcula el total correctamente', () => {
    const msg = buildWhatsAppMessage(lines, 'DRP-ABC12345')
    expect(msg).toContain('Total: S/ 587.00')
  })

  it('incluye la referencia', () => {
    const msg = buildWhatsAppMessage(lines, 'DRP-ABC12345')
    expect(msg).toContain('Ref: DRP-ABC12345')
  })

  it('incluye aviso de reserva 2 horas', () => {
    const msg = buildWhatsAppMessage(lines, 'DRP-ABC12345')
    expect(msg).toContain('Reservado por 2 horas')
  })
})

describe('buildWhatsAppUrl', () => {
  it('retorna URL wa.me con teléfono correcto', () => {
    const url = buildWhatsAppUrl('51991941252', 'hola')
    expect(url).toMatch(/^https:\/\/wa\.me\/51991941252\?text=/)
  })

  it('encodifica el mensaje', () => {
    const url = buildWhatsAppUrl('51991941252', 'test message')
    expect(url).toContain(encodeURIComponent('test message'))
  })
})
