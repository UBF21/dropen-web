-- 012_low_stock_config.sql
-- Agrega umbral de bajo stock a site_settings y ajusta datos seed para previsualización del diseño.

BEGIN;

-- Configuración: umbral de bajo stock
INSERT INTO site_settings (key, value)
VALUES ('low_stock_threshold', '3')
ON CONFLICT (key) DO NOTHING;

-- Carhartt WIP Beanie (b0000005) → agotado
UPDATE product_variants
SET stock = 0
WHERE product_id = 'b0000005-0000-0000-0000-000000000000';

-- Stussy 8-Ball Fleece (b0000007) → bajo stock (total = 3)
UPDATE product_variants
SET stock = CASE
  WHEN id = 'c0000032-0000-0000-0000-000000000000' THEN 1
  WHEN id = 'c0000033-0000-0000-0000-000000000000' THEN 1
  WHEN id = 'c0000034-0000-0000-0000-000000000000' THEN 1
  WHEN id = 'c0000035-0000-0000-0000-000000000000' THEN 0
  ELSE stock
END
WHERE product_id = 'b0000007-0000-0000-0000-000000000000';

-- Adelantar created_at para que aparezcan primero en "Destacados" (orden DESC)
UPDATE products SET created_at = NOW() + INTERVAL '1 hour'
WHERE id = 'b0000005-0000-0000-0000-000000000000';

UPDATE products SET created_at = NOW() + INTERVAL '2 hours'
WHERE id = 'b0000007-0000-0000-0000-000000000000';

COMMIT;
