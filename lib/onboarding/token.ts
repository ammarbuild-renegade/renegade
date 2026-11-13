import { createAdminClient } from '@/lib/supabase/admin'

export type TokenCheck =
  { ok: true; clientId: string } | { ok: false; reason: 'unknown' | 'expired' | 'used' }

export async function checkToken(token: string): Promise<TokenCheck> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('onboarding_tokens')
    .select('client_id, expires_at, used_at')
    .eq('token', token)
    .single()

  if (!data) return { ok: false, reason: 'unknown' }
  if (data.used_at) return { ok: false, reason: 'used' }
  if (new Date(data.expires_at) < new Date()) return { ok: false, reason: 'expired' }

  return { ok: true, clientId: data.client_id }
}
