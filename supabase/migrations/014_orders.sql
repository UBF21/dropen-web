-- 014_orders.sql
-- Tabla de pedidos con datos del cliente, snapshot del carrito y links a reservations

CREATE TABLE orders (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  reference       TEXT        NOT NULL UNIQUE,

  -- Datos del cliente
  first_name      TEXT        NOT NULL,
  last_name       TEXT        NOT NULL,
  doc_type        TEXT        NOT NULL CHECK (doc_type IN ('DNI', 'CE', 'Pasaporte')),
  doc_number      TEXT        NOT NULL,

  -- Dirección
  address         TEXT        NOT NULL,
  lat             DECIMAL(10, 7),
  lng             DECIMAL(10, 7),
  department      TEXT,
  province        TEXT,
  district        TEXT,
  country         TEXT        NOT NULL DEFAULT 'PE',

  -- Snapshot del carrito en el momento del pedido
  items           JSONB       NOT NULL DEFAULT '[]',
  total           DECIMAL(10, 2) NOT NULL,
  currency        TEXT        NOT NULL DEFAULT 'PEN',

  -- Estado
  status          TEXT        NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'confirmed', 'cancelled', 'expired')),

  -- Links a reservations
  reservation_ids UUID[]      NOT NULL DEFAULT '{}',

  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger updated_at (usa la función existente de 010_soft_delete.sql)
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer un pedido si conoce su UUID
CREATE POLICY "orders_public_read" ON orders
  FOR SELECT USING (true);

-- Anon puede crear pedidos (el checkout no requiere login)
CREATE POLICY "orders_anon_insert" ON orders
  FOR INSERT WITH CHECK (true);

-- Admin puede hacer todo
CREATE POLICY "orders_admin_all" ON orders
  FOR ALL USING (is_authenticated_admin());
