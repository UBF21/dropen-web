-- 015_add_phone_to_orders.sql
-- Agrega teléfono del cliente (con prefijo de país) a la tabla orders
-- Formato guardado: "+51999888777" (prefijo + número concatenados)

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT '';
