import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const { data: expired, error: fetchError } = await supabase
    .from('reservations')
    .select('id, variant_id, quantity')
    .eq('status', 'pending')
    .lt('expires_at', new Date().toISOString())

  if (fetchError) {
    return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 })
  }

  if (!expired || expired.length === 0) {
    return new Response(JSON.stringify({ expired: 0 }), { status: 200 })
  }

  const ids = expired.map((r) => r.id)
  const { error: updateError } = await supabase
    .from('reservations')
    .update({ status: 'expired' })
    .in('id', ids)

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), { status: 500 })
  }

  for (const res of expired) {
    await supabase.rpc('release_reservation_stock', {
      p_variant_id: res.variant_id,
      p_quantity: res.quantity,
    })
  }

  return new Response(JSON.stringify({ expired: ids.length }), { status: 200 })
})
