-- 009_fix_seed_prices.sql
-- Corrige los precios del seed (estaban en ARS) a valores reales en PEN

BEGIN;

UPDATE public.products SET price = 359.00 WHERE id = 'b0000001-0000-0000-0000-000000000000'; -- Jordan Brand Cargo
UPDATE public.products SET price = 149.00 WHERE id = 'b0000002-0000-0000-0000-000000000000'; -- Nike SB Dunk Heritage Tee
UPDATE public.products SET price = 459.00 WHERE id = 'b0000003-0000-0000-0000-000000000000'; -- New Balance 574 Core
UPDATE public.products SET price = 279.00 WHERE id = 'b0000004-0000-0000-0000-000000000000'; -- Adidas Originals Hoodie
UPDATE public.products SET price =  89.00 WHERE id = 'b0000005-0000-0000-0000-000000000000'; -- Carhartt WIP Beanie
UPDATE public.products SET price = 399.00 WHERE id = 'b0000006-0000-0000-0000-000000000000'; -- Vans Old Skool Platform
UPDATE public.products SET price = 329.00 WHERE id = 'b0000007-0000-0000-0000-000000000000'; -- Stussy 8-Ball Fleece
UPDATE public.products SET price = 129.00 WHERE id = 'b0000008-0000-0000-0000-000000000000'; -- Palace Tri-Ferg Cap

COMMIT;
