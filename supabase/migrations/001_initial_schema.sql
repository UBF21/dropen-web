-- Colecciones / Drops
CREATE TABLE collections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text UNIQUE NOT NULL,
  description text,
  cover_url   text,
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Productos
CREATE TABLE products (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES collections(id) ON DELETE SET NULL,
  name          text NOT NULL,
  slug          text UNIQUE NOT NULL,
  description   text,
  price         numeric(10,2) NOT NULL,
  moneda_code   char(3) NOT NULL DEFAULT 'PEN',
  active        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Imágenes de producto
CREATE TABLE product_images (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url          text NOT NULL,
  storage_path text NOT NULL,
  alt_text     text,
  "order"      integer NOT NULL DEFAULT 0,
  is_primary   boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Variantes (talla + color)
CREATE TABLE product_variants (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size       text NOT NULL,
  color      text NOT NULL,
  stock      integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sku        text UNIQUE NOT NULL,
  UNIQUE(product_id, size, color)
);

-- Reservas WhatsApp
CREATE TABLE reservations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id  uuid NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
  quantity    integer NOT NULL,
  status      text NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending','confirmed','expired')),
  expires_at  timestamptz NOT NULL,
  customer_wa text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Configuración global
CREATE TABLE site_settings (
  key        text PRIMARY KEY,
  value      text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO site_settings (key, value) VALUES
  ('wholesale_min_units', '6'),
  ('wholesale_max_units', '60'),
  ('whatsapp_number', '51991941252'),
  ('store_currency', 'PEN');

-- Pedidos wholesale
CREATE TABLE wholesale_orders (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name     text NOT NULL,
  customer_email    text NOT NULL,
  customer_phone    text NOT NULL,
  tipo_documento_id uuid,
  numero_documento  text,
  pais_code         char(2),
  ciudad_code       text,
  items             jsonb NOT NULL DEFAULT '[]',
  total_units       integer NOT NULL,
  notes             text,
  status            text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','contacted','confirmed')),
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- RLS en todas las tablas
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wholesale_orders ENABLE ROW LEVEL SECURITY;

-- Lectura pública (storefront)
CREATE POLICY "public_read_collections"      ON collections      FOR SELECT USING (active = true);
CREATE POLICY "public_read_products"         ON products         FOR SELECT USING (active = true);
CREATE POLICY "public_read_product_images"   ON product_images   FOR SELECT USING (true);
CREATE POLICY "public_read_product_variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "public_read_site_settings"    ON site_settings    FOR SELECT USING (true);

-- Clientes pueden insertar reservas y wholesale
CREATE POLICY "anyone_insert_reservations"      ON reservations      FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone_insert_wholesale_orders"  ON wholesale_orders  FOR INSERT WITH CHECK (true);

-- Admins — reservas
CREATE POLICY "admin_read_reservations"   ON reservations FOR SELECT USING (is_authenticated_admin());
CREATE POLICY "admin_update_reservations" ON reservations FOR UPDATE USING (is_authenticated_admin());

-- Admins — wholesale
CREATE POLICY "admin_read_wholesale"   ON wholesale_orders FOR SELECT USING (is_authenticated_admin());
CREATE POLICY "admin_update_wholesale" ON wholesale_orders FOR UPDATE USING (is_authenticated_admin());

-- Admins — colecciones y productos (CRUD)
CREATE POLICY "admin_all_collections"     ON collections      FOR ALL USING (is_admin_or_editor()) WITH CHECK (is_admin_or_editor());
CREATE POLICY "admin_all_products"        ON products         FOR ALL USING (is_admin_or_editor()) WITH CHECK (is_admin_or_editor());
CREATE POLICY "admin_all_product_images"  ON product_images   FOR ALL USING (is_admin_or_editor()) WITH CHECK (is_admin_or_editor());
CREATE POLICY "admin_all_variants"        ON product_variants FOR ALL USING (is_admin_or_editor()) WITH CHECK (is_admin_or_editor());

-- Admins — configuración
CREATE POLICY "admin_update_settings" ON site_settings FOR UPDATE USING (is_admin());
CREATE POLICY "admin_insert_settings" ON site_settings FOR INSERT WITH CHECK (is_admin());

