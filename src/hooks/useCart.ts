import { useCartStore, useCartTotal, useCartItemCount } from '@/store/cart.store'
import type { Product, ProductVariant } from '@/types'

export function useCart() {
  const { items, addItem, removeItem, updateQty, clearCart } = useCartStore()
  const total = useCartTotal()
  const itemCount = useCartItemCount()

  function addProductVariant(product: Product, variant: ProductVariant, quantity = 1) {
    const primaryImageUrl =
      product.images?.find((i) => i.is_primary)?.url ??
      [...(product.images ?? [])].sort((a, b) => a.order - b.order)[0]?.url ??
      ''

    addItem({
      variantId: variant.id,
      productId: product.id,
      productName: product.name,
      size: variant.size,
      color: variant.color,
      price: product.price,
      quantity,
      imageUrl: primaryImageUrl,
    })
  }

  return { items, total, itemCount, addProductVariant, removeItem, updateQty, clearCart }
}
