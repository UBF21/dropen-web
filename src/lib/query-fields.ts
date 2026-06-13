export const COLLECTION_FIELDS =
  'id, name, slug, description, cover_url, active, created_at'

export const PRODUCT_IMAGE_FIELDS =
  'id, product_id, url, storage_path, alt_text, "order", is_primary, created_at'

export const PRODUCT_VARIANT_FIELDS =
  'id, size, color, stock, sku'

export const PRODUCT_BASE_FIELDS =
  'id, collection_id, name, slug, description, price, moneda_code, active, created_at'

export const PRODUCT_FIELDS =
  `${PRODUCT_BASE_FIELDS}, images:product_images(${PRODUCT_IMAGE_FIELDS}), variants:product_variants(${PRODUCT_VARIANT_FIELDS})`

export const PRODUCT_WITH_COLLECTION =
  `${PRODUCT_FIELDS}, collection:collections(${COLLECTION_FIELDS})`

export const RESERVATION_FIELDS =
  'id, variant_id, quantity, status, expires_at, customer_wa, created_at'
