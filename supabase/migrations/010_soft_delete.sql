-- ============================================================
-- 010_soft_delete.sql
-- Soft delete + audit timestamps para todas las tablas
-- Idempotente: usa IF NOT EXISTS / DROP ... IF EXISTS / CREATE OR REPLACE
-- ============================================================

-- ============================================================
-- 1. Función trigger_set_updated_at()
--    (distinta de update_updated_at() que ya usa admin_profiles)
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 2. updated_at + triggers en 7 tablas
--    (admin_profiles ya tiene updated_at + su propio trigger → no se toca)
-- ============================================================

-- products
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
DROP TRIGGER IF EXISTS set_updated_at ON products;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- product_variants
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
DROP TRIGGER IF EXISTS set_updated_at ON product_variants;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- collections
ALTER TABLE collections ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
DROP TRIGGER IF EXISTS set_updated_at ON collections;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- product_images
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
DROP TRIGGER IF EXISTS set_updated_at ON product_images;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON product_images
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- wholesale_orders
ALTER TABLE wholesale_orders ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
DROP TRIGGER IF EXISTS set_updated_at ON wholesale_orders;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON wholesale_orders
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- reservations
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
DROP TRIGGER IF EXISTS set_updated_at ON reservations;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- inventory_movements (puede no existir aún — IF NOT EXISTS protege el ALTER)
ALTER TABLE inventory_movements ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
DROP TRIGGER IF EXISTS set_updated_at ON inventory_movements;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON inventory_movements
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- site_settings: ya tiene updated_at → solo agregar trigger para consistencia
DROP TRIGGER IF EXISTS set_updated_at ON site_settings;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ============================================================
-- 3. site_settings: agregar created_at (única tabla sin él)
-- ============================================================
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();


-- ============================================================
-- 4. deleted_at en las 9 tablas
-- ============================================================
ALTER TABLE products            ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE product_variants    ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE collections         ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE product_images      ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE wholesale_orders    ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE admin_profiles      ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE reservations        ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE inventory_movements ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE site_settings       ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;


-- ============================================================
-- 5. Índices parciales (solo registros activos, WHERE deleted_at IS NULL)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_active
  ON products (id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_product_variants_active
  ON product_variants (product_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_collections_active
  ON collections (id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_product_images_active
  ON product_images (product_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_wholesale_orders_active
  ON wholesale_orders (id) WHERE deleted_at IS NULL;


-- ============================================================
-- 6. Actualización de políticas RLS públicas
--    Las policies de admin (admin_all_*, admin_read_*, etc.) NO se modifican:
--    los admins pueden ver registros soft-deleted.
-- ============================================================

-- collections: filtrar active = true AND deleted_at IS NULL
DROP POLICY IF EXISTS "public_read_collections" ON collections;
CREATE POLICY "public_read_collections" ON collections
  FOR SELECT USING (active = true AND deleted_at IS NULL);

-- products: filtrar active = true AND deleted_at IS NULL
DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products
  FOR SELECT USING (active = true AND deleted_at IS NULL);

-- product_images: antes USING (true) → filtrar deleted_at IS NULL
DROP POLICY IF EXISTS "public_read_product_images" ON product_images;
CREATE POLICY "public_read_product_images" ON product_images
  FOR SELECT USING (deleted_at IS NULL);

-- product_variants: antes USING (true) → filtrar deleted_at IS NULL
DROP POLICY IF EXISTS "public_read_product_variants" ON product_variants;
CREATE POLICY "public_read_product_variants" ON product_variants
  FOR SELECT USING (deleted_at IS NULL);

-- site_settings: agregar filtro deleted_at IS NULL
DROP POLICY IF EXISTS "public_read_site_settings" ON site_settings;
CREATE POLICY "public_read_site_settings" ON site_settings
  FOR SELECT USING (deleted_at IS NULL);
