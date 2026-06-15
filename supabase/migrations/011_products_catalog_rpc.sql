-- Función 1: Metadata estática del catálogo (precio min/max, tallas y colores disponibles)
CREATE OR REPLACE FUNCTION get_products_catalog_meta()
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'price_min', COALESCE(MIN(p.price), 0),
    'price_max', COALESCE(MAX(p.price), 9999),
    'available_sizes', COALESCE(
      (SELECT jsonb_agg(DISTINCT pv.size ORDER BY pv.size)
       FROM product_variants pv
       JOIN products pp ON pp.id = pv.product_id
       WHERE pp.collection_id IS NULL
         AND pp.active = true
         AND pp.deleted_at IS NULL
         AND pv.deleted_at IS NULL),
      '[]'::jsonb
    ),
    'available_colors', COALESCE(
      (SELECT jsonb_agg(DISTINCT pv.color ORDER BY pv.color)
       FROM product_variants pv
       JOIN products pp ON pp.id = pv.product_id
       WHERE pp.collection_id IS NULL
         AND pp.active = true
         AND pp.deleted_at IS NULL
         AND pv.deleted_at IS NULL),
      '[]'::jsonb
    )
  )
  FROM products p
  WHERE p.collection_id IS NULL
    AND p.active = true
    AND p.deleted_at IS NULL;
$$;

-- Función 2: Listado paginado y filtrable de productos sin colección
-- Parámetros en p_filters (jsonb):
--   precio_min (numeric), precio_max (numeric),
--   tallas (text[]), colores (text[]),
--   solo_stock (boolean),
--   orden (text): 'recent' | 'price_asc' | 'price_desc' | 'name_asc' | 'popular'
--   pagina (int, base 1), por_pagina (int, default 12)
CREATE OR REPLACE FUNCTION get_products_catalog(p_filters jsonb)
RETURNS TABLE (
  id          uuid,
  name        text,
  slug        text,
  price       numeric,
  moneda_code text,
  primary_image_url text,
  total_stock bigint,
  total_count bigint
)
LANGUAGE sql
STABLE
AS $$
  WITH filtered AS (
    SELECT DISTINCT
      p.id,
      p.name,
      p.slug,
      p.price,
      p.moneda_code,
      p.created_at,
      (
        SELECT pi.url
        FROM product_images pi
        WHERE pi.product_id = p.id
          AND pi.is_primary = true
          AND pi.deleted_at IS NULL
        LIMIT 1
      ) AS primary_image_url,
      COALESCE(
        (SELECT SUM(pv2.stock)
         FROM product_variants pv2
         WHERE pv2.product_id = p.id AND pv2.deleted_at IS NULL),
        0
      ) AS total_stock,
      COALESCE(
        (SELECT COUNT(r.id)
         FROM reservations r
         JOIN product_variants pv3 ON pv3.id = r.variant_id
         WHERE pv3.product_id = p.id AND r.status = 'confirmed'),
        0
      ) AS reservation_count
    FROM products p
    LEFT JOIN product_variants pv
      ON pv.product_id = p.id AND pv.deleted_at IS NULL
    WHERE p.collection_id IS NULL
      AND p.active = true
      AND p.deleted_at IS NULL
      AND p.price >= COALESCE((p_filters->>'precio_min')::numeric, 0)
      AND p.price <= COALESCE((p_filters->>'precio_max')::numeric, 999999)
      AND (
        NOT COALESCE((p_filters->>'solo_stock')::boolean, false)
        OR COALESCE(
          (SELECT SUM(pv4.stock) FROM product_variants pv4
           WHERE pv4.product_id = p.id AND pv4.deleted_at IS NULL),
          0
        ) > 0
      )
      AND (
        (p_filters->'tallas') IS NULL
        OR jsonb_array_length(p_filters->'tallas') = 0
        OR EXISTS (
          SELECT 1 FROM product_variants pv5
          WHERE pv5.product_id = p.id
            AND pv5.deleted_at IS NULL
            AND pv5.size = ANY(
              ARRAY(SELECT jsonb_array_elements_text(p_filters->'tallas'))
            )
        )
      )
      AND (
        (p_filters->'colores') IS NULL
        OR jsonb_array_length(p_filters->'colores') = 0
        OR EXISTS (
          SELECT 1 FROM product_variants pv6
          WHERE pv6.product_id = p.id
            AND pv6.deleted_at IS NULL
            AND pv6.color = ANY(
              ARRAY(SELECT jsonb_array_elements_text(p_filters->'colores'))
            )
        )
      )
  ),
  counted AS (
    SELECT COUNT(*) AS total_count FROM filtered
  )
  SELECT
    f.id,
    f.name,
    f.slug,
    f.price,
    f.moneda_code,
    f.primary_image_url,
    f.total_stock,
    c.total_count
  FROM filtered f, counted c
  ORDER BY
    CASE WHEN (p_filters->>'orden') = 'recent'     THEN f.created_at        END DESC NULLS LAST,
    CASE WHEN (p_filters->>'orden') = 'price_asc'  THEN f.price             END ASC  NULLS LAST,
    CASE WHEN (p_filters->>'orden') = 'price_desc' THEN f.price             END DESC NULLS LAST,
    CASE WHEN (p_filters->>'orden') = 'name_asc'   THEN f.name              END ASC  NULLS LAST,
    CASE WHEN (p_filters->>'orden') = 'popular'    THEN f.reservation_count END DESC NULLS LAST,
    f.created_at DESC
  LIMIT  COALESCE((p_filters->>'por_pagina')::int, 12)
  OFFSET (COALESCE((p_filters->>'pagina')::int, 1) - 1)
         * COALESCE((p_filters->>'por_pagina')::int, 12);
$$;
