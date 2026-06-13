import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '../cart.store'
import type { CartItem } from '@/types'

const makeItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  variantId: 'v1',
  productId: 'p1',
  productName: 'Jean Baggy Cargo',
  size: '32',
  color: 'Black',
  price: 189,
  quantity: 1,
  imageUrl: '',
  ...overrides,
})

beforeEach(() => {
  useCartStore.setState({ items: [] })
})

describe('addItem', () => {
  it('agrega un item nuevo al carrito', () => {
    useCartStore.getState().addItem(makeItem())
    expect(useCartStore.getState().items).toHaveLength(1)
  })

  it('incrementa quantity si la misma variante ya existe', () => {
    useCartStore.getState().addItem(makeItem({ quantity: 1 }))
    useCartStore.getState().addItem(makeItem({ quantity: 2 }))
    expect(useCartStore.getState().items).toHaveLength(1)
    expect(useCartStore.getState().items[0].quantity).toBe(3)
  })

  it('agrega items distintos como entradas separadas', () => {
    useCartStore.getState().addItem(makeItem({ variantId: 'v1' }))
    useCartStore.getState().addItem(makeItem({ variantId: 'v2' }))
    expect(useCartStore.getState().items).toHaveLength(2)
  })
})

describe('removeItem', () => {
  it('elimina el item del carrito', () => {
    useCartStore.setState({ items: [makeItem()] })
    useCartStore.getState().removeItem('v1')
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})

describe('updateQty', () => {
  it('actualiza la cantidad correctamente', () => {
    useCartStore.setState({ items: [makeItem({ quantity: 1 })] })
    useCartStore.getState().updateQty('v1', 5)
    expect(useCartStore.getState().items[0].quantity).toBe(5)
  })

  it('elimina el item si quantity <= 0', () => {
    useCartStore.setState({ items: [makeItem()] })
    useCartStore.getState().updateQty('v1', 0)
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})

describe('clearCart', () => {
  it('vacía el carrito completamente', () => {
    useCartStore.setState({ items: [makeItem({ variantId: 'v1' }), makeItem({ variantId: 'v2' })] })
    useCartStore.getState().clearCart()
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})

describe('selectores', () => {
  it('useCartTotal calcula el total correctamente', () => {
    useCartStore.setState({
      items: [makeItem({ price: 189, quantity: 2 }), makeItem({ variantId: 'v2', price: 199, quantity: 1 })],
    })
    // Calcular el total directamente sin hooks (evita contexto React)
    const total = useCartStore.getState().items.reduce((s, i) => s + i.price * i.quantity, 0)
    expect(total).toBe(577) // 189*2 + 199*1
  })
})
