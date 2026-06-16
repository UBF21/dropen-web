-- 013_seed_stock_catalog.sql
-- Actualiza stock de productos del catálogo (sin colección) para previsualizar
-- los estados de bajo stock y agotado en /productos.

BEGIN;

-- Jean Baggy Core (b0000009) → bajo stock: 3 unidades totales (1 por talla principal)
UPDATE product_variants SET stock = 0
WHERE product_id = 'b0000009-0000-0000-0000-000000000000';

UPDATE product_variants SET stock = 1
WHERE id IN (
  'c0000039-0000-0000-0000-000000000000',  -- 30 Black
  'c0000040-0000-0000-0000-000000000000',  -- 32 Black
  'c0000041-0000-0000-0000-000000000000'   -- 34 Black
);

-- Beanie DROPEN Logo (b0000016) → agotado
UPDATE product_variants SET stock = 0
WHERE product_id = 'b0000016-0000-0000-0000-000000000000';

COMMIT;
