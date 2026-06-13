-- Cron job: expirar reservas vencidas cada 5 minutos
-- Ejecutar en Supabase SQL Editor (requiere extensión pg_cron habilitada)
select cron.schedule(
  'expire-reservations',
  '*/5 * * * *',
  $$
    select net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/expire-reservations',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key'),
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    )
  $$
);
