export type AdminRole = 'admin' | 'editor' | 'viewer'
export type ReservationStatus = 'pending' | 'confirmed' | 'expired'
export type WholesaleOrderStatus = 'pending' | 'contacted' | 'confirmed'

export interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  cover_url: string | null
  active: boolean
  created_at: string
  updated_at?: string
  deleted_at?: string | null
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  storage_path: string
  alt_text: string | null
  order: number
  is_primary: boolean
  created_at: string
  updated_at?: string
  deleted_at?: string | null
}

export interface ProductVariant {
  id: string
  product_id: string
  size: string
  color: string
  stock: number
  sku: string
  available_stock?: number
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface Product {
  id: string
  collection_id: string | null
  name: string
  slug: string
  description: string | null
  price: number
  moneda_code: string
  active: boolean
  created_at: string
  updated_at?: string
  deleted_at?: string | null
  collection?: Collection
  images?: ProductImage[]
  variants?: ProductVariant[]
}

export interface Reservation {
  id: string
  variant_id: string
  quantity: number
  status: ReservationStatus
  expires_at: string
  customer_wa: string | null
  created_at: string
  updated_at?: string
  deleted_at?: string | null
}

export interface SiteSetting {
  key: string
  value: string
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface WholesaleOrderItem {
  product_id: string
  name: string
  size: string
  color: string
  quantity: number
}

export interface WholesaleOrder {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  tipo_documento_id: string | null
  numero_documento: string | null
  pais_code: string | null
  ciudad_code: string | null
  items: WholesaleOrderItem[]
  total_units: number
  notes: string | null
  status: WholesaleOrderStatus
  created_at: string
  updated_at?: string
  deleted_at?: string | null
}

export interface AdminProfile {
  id: string
  email: string
  full_name: string | null
  role: AdminRole
  active: boolean
  created_at: string
  updated_at?: string
  deleted_at?: string | null
}

export interface CartItem {
  variantId: string
  productId: string
  productName: string
  size: string
  color: string
  price: number
  quantity: number
  imageUrl: string
}

export interface WhatsAppLine {
  productName: string
  size: string
  color: string
  quantity: number
  price: number
}

export type DocType = 'DNI' | 'CE' | 'Pasaporte'
export type OrderStatus = 'pending' | 'confirmed' | 'cancelled' | 'expired'

export interface Order {
  id: string
  reference: string
  first_name: string
  last_name: string
  doc_type: DocType
  doc_number: string
  address: string
  lat: number | null
  lng: number | null
  department: string | null
  province: string | null
  district: string | null
  country: string
  items: CartItem[]
  total: number
  currency: string
  status: OrderStatus
  reservation_ids: string[]
  created_at: string
  updated_at: string
}

export interface CreateOrderInput {
  reference: string
  first_name: string
  last_name: string
  doc_type: DocType
  doc_number: string
  address: string
  lat: number | null
  lng: number | null
  department: string | null
  province: string | null
  district: string | null
  country: string
  items: CartItem[]
  total: number
  currency: string
  reservation_ids: string[]
}
