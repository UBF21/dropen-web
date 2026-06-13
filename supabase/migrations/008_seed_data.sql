-- 008_seed_data.sql
-- Seed realista para dropen-web

BEGIN;

-- ─── Colecciones ─────────────────────────────────────────────────────────────

INSERT INTO public.collections (id, name, slug, description, active)
VALUES
  ('a0000001-0000-0000-0000-000000000000', 'Urban Essentials', 'urban-essentials', 'Básicos urbanos para el día a día', true),
  ('a0000002-0000-0000-0000-000000000000', 'Street Heritage', 'street-heritage', 'Inspirado en la cultura de la calle', true),
  ('a0000003-0000-0000-0000-000000000000', 'Monochrome Series', 'monochrome-series', 'Paleta reducida, máximo impacto', true)
ON CONFLICT (id) DO NOTHING;

-- ─── Productos ───────────────────────────────────────────────────────────────

INSERT INTO public.products (id, name, slug, description, price, collection_id, active)
VALUES
  ('b0000001-0000-0000-0000-000000000000', 'Jordan Brand Cargo', 'jordan-brand-cargo', 'Cargo pants de corte recto con múltiples bolsillos', 89990, 'a0000001-0000-0000-0000-000000000000', true),
  ('b0000002-0000-0000-0000-000000000000', 'Nike SB Dunk Heritage Tee', 'nike-sb-dunk-heritage-tee', 'Remera de algodón pesado con gráfica heritage', 34990, 'a0000002-0000-0000-0000-000000000000', true),
  ('b0000003-0000-0000-0000-000000000000', 'New Balance 574 Core', 'nb-574-core', 'Zapatillas clásicas con suela acanalada', 119990, 'a0000001-0000-0000-0000-000000000000', true),
  ('b0000004-0000-0000-0000-000000000000', 'Adidas Originals Hoodie', 'adidas-originals-hoodie', 'Buzo con capucha en fleece francés', 69990, 'a0000003-0000-0000-0000-000000000000', true),
  ('b0000005-0000-0000-0000-000000000000', 'Carhartt WIP Beanie', 'carhartt-wip-beanie', 'Gorro ribbed de lana acrílica', 19990, 'a0000002-0000-0000-0000-000000000000', true),
  ('b0000006-0000-0000-0000-000000000000', 'Vans Old Skool Platform', 'vans-old-skool-platform', 'Zapatillas con plataforma vulcanizada', 94990, 'a0000001-0000-0000-0000-000000000000', true),
  ('b0000007-0000-0000-0000-000000000000', 'Stussy 8-Ball Fleece', 'stussy-8ball-fleece', 'Fleece pesado con grafica 8-ball bordada', 79990, 'a0000002-0000-0000-0000-000000000000', true),
  ('b0000008-0000-0000-0000-000000000000', 'Palace Tri-Ferg Cap', 'palace-tri-ferg-cap', 'Gorra 6-panel con logo bordado', 29990, 'a0000003-0000-0000-0000-000000000000', true)
ON CONFLICT (id) DO NOTHING;

-- ─── Variantes ───────────────────────────────────────────────────────────────

INSERT INTO public.product_variants (id, product_id, sku, size, color, stock)
VALUES
  -- Jordan Brand Cargo
  ('c0000001-0000-0000-0000-000000000000', 'b0000001-0000-0000-0000-000000000000', 'DRP-JBC-30-BLK', '30', 'Black', 12),
  ('c0000002-0000-0000-0000-000000000000', 'b0000001-0000-0000-0000-000000000000', 'DRP-JBC-32-BLK', '32', 'Black', 8),
  ('c0000003-0000-0000-0000-000000000000', 'b0000001-0000-0000-0000-000000000000', 'DRP-JBC-34-BLK', '34', 'Black', 5),
  ('c0000004-0000-0000-0000-000000000000', 'b0000001-0000-0000-0000-000000000000', 'DRP-JBC-30-KHK', '30', 'Khaki', 7),
  ('c0000005-0000-0000-0000-000000000000', 'b0000001-0000-0000-0000-000000000000', 'DRP-JBC-32-KHK', '32', 'Khaki', 4),
  -- Nike SB Dunk Heritage Tee
  ('c0000006-0000-0000-0000-000000000000', 'b0000002-0000-0000-0000-000000000000', 'DRP-NSB-S-WHT', 'S', 'White', 20),
  ('c0000007-0000-0000-0000-000000000000', 'b0000002-0000-0000-0000-000000000000', 'DRP-NSB-M-WHT', 'M', 'White', 18),
  ('c0000008-0000-0000-0000-000000000000', 'b0000002-0000-0000-0000-000000000000', 'DRP-NSB-L-WHT', 'L', 'White', 15),
  ('c0000009-0000-0000-0000-000000000000', 'b0000002-0000-0000-0000-000000000000', 'DRP-NSB-XL-WHT', 'XL', 'White', 6),
  ('c0000010-0000-0000-0000-000000000000', 'b0000002-0000-0000-0000-000000000000', 'DRP-NSB-S-BLK', 'S', 'Black', 14),
  ('c0000011-0000-0000-0000-000000000000', 'b0000002-0000-0000-0000-000000000000', 'DRP-NSB-M-BLK', 'M', 'Black', 11),
  -- New Balance 574 Core
  ('c0000012-0000-0000-0000-000000000000', 'b0000003-0000-0000-0000-000000000000', 'DRP-NB5-39-GRY', '39', 'Grey', 3),
  ('c0000013-0000-0000-0000-000000000000', 'b0000003-0000-0000-0000-000000000000', 'DRP-NB5-40-GRY', '40', 'Grey', 5),
  ('c0000014-0000-0000-0000-000000000000', 'b0000003-0000-0000-0000-000000000000', 'DRP-NB5-41-GRY', '41', 'Grey', 7),
  ('c0000015-0000-0000-0000-000000000000', 'b0000003-0000-0000-0000-000000000000', 'DRP-NB5-42-GRY', '42', 'Grey', 6),
  ('c0000016-0000-0000-0000-000000000000', 'b0000003-0000-0000-0000-000000000000', 'DRP-NB5-43-GRY', '43', 'Grey', 4),
  ('c0000017-0000-0000-0000-000000000000', 'b0000003-0000-0000-0000-000000000000', 'DRP-NB5-40-NVY', '40', 'Navy', 3),
  ('c0000018-0000-0000-0000-000000000000', 'b0000003-0000-0000-0000-000000000000', 'DRP-NB5-42-NVY', '42', 'Navy', 4),
  -- Adidas Originals Hoodie
  ('c0000019-0000-0000-0000-000000000000', 'b0000004-0000-0000-0000-000000000000', 'DRP-AOH-S-BLK', 'S', 'Black', 8),
  ('c0000020-0000-0000-0000-000000000000', 'b0000004-0000-0000-0000-000000000000', 'DRP-AOH-M-BLK', 'M', 'Black', 10),
  ('c0000021-0000-0000-0000-000000000000', 'b0000004-0000-0000-0000-000000000000', 'DRP-AOH-L-BLK', 'L', 'Black', 9),
  ('c0000022-0000-0000-0000-000000000000', 'b0000004-0000-0000-0000-000000000000', 'DRP-AOH-XL-BLK', 'XL', 'Black', 4),
  ('c0000023-0000-0000-0000-000000000000', 'b0000004-0000-0000-0000-000000000000', 'DRP-AOH-M-GRY', 'M', 'Grey', 6),
  -- Carhartt WIP Beanie
  ('c0000024-0000-0000-0000-000000000000', 'b0000005-0000-0000-0000-000000000000', 'DRP-CWB-ONE-BLK', 'ONE', 'Black', 25),
  ('c0000025-0000-0000-0000-000000000000', 'b0000005-0000-0000-0000-000000000000', 'DRP-CWB-ONE-BRN', 'ONE', 'Brown', 15),
  ('c0000026-0000-0000-0000-000000000000', 'b0000005-0000-0000-0000-000000000000', 'DRP-CWB-ONE-GRN', 'ONE', 'Green', 10),
  -- Vans Old Skool Platform
  ('c0000027-0000-0000-0000-000000000000', 'b0000006-0000-0000-0000-000000000000', 'DRP-VOP-37-BLK', '37', 'Black', 4),
  ('c0000028-0000-0000-0000-000000000000', 'b0000006-0000-0000-0000-000000000000', 'DRP-VOP-38-BLK', '38', 'Black', 6),
  ('c0000029-0000-0000-0000-000000000000', 'b0000006-0000-0000-0000-000000000000', 'DRP-VOP-39-BLK', '39', 'Black', 5),
  ('c0000030-0000-0000-0000-000000000000', 'b0000006-0000-0000-0000-000000000000', 'DRP-VOP-38-WHT', '38', 'White', 3),
  ('c0000031-0000-0000-0000-000000000000', 'b0000006-0000-0000-0000-000000000000', 'DRP-VOP-39-WHT', '39', 'White', 4),
  -- Stussy 8-Ball Fleece
  ('c0000032-0000-0000-0000-000000000000', 'b0000007-0000-0000-0000-000000000000', 'DRP-S8F-S-BLK', 'S', 'Black', 5),
  ('c0000033-0000-0000-0000-000000000000', 'b0000007-0000-0000-0000-000000000000', 'DRP-S8F-M-BLK', 'M', 'Black', 7),
  ('c0000034-0000-0000-0000-000000000000', 'b0000007-0000-0000-0000-000000000000', 'DRP-S8F-L-BLK', 'L', 'Black', 6),
  ('c0000035-0000-0000-0000-000000000000', 'b0000007-0000-0000-0000-000000000000', 'DRP-S8F-XL-BLK', 'XL', 'Black', 3),
  -- Palace Tri-Ferg Cap
  ('c0000036-0000-0000-0000-000000000000', 'b0000008-0000-0000-0000-000000000000', 'DRP-PTC-ONE-BLK', 'ONE', 'Black', 20),
  ('c0000037-0000-0000-0000-000000000000', 'b0000008-0000-0000-0000-000000000000', 'DRP-PTC-ONE-WHT', 'ONE', 'White', 12),
  ('c0000038-0000-0000-0000-000000000000', 'b0000008-0000-0000-0000-000000000000', 'DRP-PTC-ONE-GRN', 'ONE', 'Green', 8)
ON CONFLICT (id) DO NOTHING;

-- ─── Imágenes placeholder ────────────────────────────────────────────────────

INSERT INTO public.product_images (id, product_id, url, storage_path, is_primary, "order")
VALUES
  ('d0000001-0000-0000-0000-000000000000', 'b0000001-0000-0000-0000-000000000000', 'https://placehold.co/800x800/1a1a1a/ffffff?text=JBC', '', true, 0),
  ('d0000002-0000-0000-0000-000000000000', 'b0000002-0000-0000-0000-000000000000', 'https://placehold.co/800x800/1a1a1a/ffffff?text=NSB', '', true, 0),
  ('d0000003-0000-0000-0000-000000000000', 'b0000003-0000-0000-0000-000000000000', 'https://placehold.co/800x800/1a1a1a/ffffff?text=NB5', '', true, 0),
  ('d0000004-0000-0000-0000-000000000000', 'b0000004-0000-0000-0000-000000000000', 'https://placehold.co/800x800/1a1a1a/ffffff?text=AOH', '', true, 0),
  ('d0000005-0000-0000-0000-000000000000', 'b0000005-0000-0000-0000-000000000000', 'https://placehold.co/800x800/1a1a1a/ffffff?text=CWB', '', true, 0),
  ('d0000006-0000-0000-0000-000000000000', 'b0000006-0000-0000-0000-000000000000', 'https://placehold.co/800x800/1a1a1a/ffffff?text=VOP', '', true, 0),
  ('d0000007-0000-0000-0000-000000000000', 'b0000007-0000-0000-0000-000000000000', 'https://placehold.co/800x800/1a1a1a/ffffff?text=S8F', '', true, 0),
  ('d0000008-0000-0000-0000-000000000000', 'b0000008-0000-0000-0000-000000000000', 'https://placehold.co/800x800/1a1a1a/ffffff?text=PTC', '', true, 0)
ON CONFLICT (id) DO NOTHING;

-- ─── Movimientos de inventario (~60, solo si no existen aún) ─────────────────

INSERT INTO public.inventory_movements (variant_id, type, quantity, created_at)
SELECT
  v.id,
  CASE WHEN random() < 0.65 THEN 'in' ELSE 'out' END,
  1,
  NOW() - (random() * INTERVAL '30 days')
FROM (
  SELECT id FROM public.product_variants
  WHERE id BETWEEN 'c0000001-0000-0000-0000-000000000000' AND 'c0000038-0000-0000-0000-000000000000'
  ORDER BY random()
) v
CROSS JOIN generate_series(1, 2)
WHERE NOT EXISTS (
  SELECT 1 FROM public.inventory_movements
  WHERE variant_id BETWEEN 'c0000001-0000-0000-0000-000000000000' AND 'c0000038-0000-0000-0000-000000000000'
  LIMIT 1
)
LIMIT 60;

COMMIT;
