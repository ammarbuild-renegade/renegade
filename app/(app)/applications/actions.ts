'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { scoreApplication } from '@/lib/scoring/fit'

const ApplicationId = z.string().uuid()

async function requireOperator() {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()

  if (!claims?.claims?.sub) {
    return null
  }

  return supabase
}

export async function rejectApplication(id: string) {
  const parsed = ApplicationId.safeParse(id)

  if (!parsed.success) {
    return
  }

  const supabase = await requireOperator()

  if (!supabase) {
    return
  }

  const { error } = await supabase
    .from('applications')
    .update({ status: 'rejected' })
    .eq('id', parsed.data)

  if (error) {
    return
  }

  revalidatePath('/applications')
}

export async function rescoreApplication(id: string) {
  const parsed = ApplicationId.safeParse(id)

  if (!parsed.success) {
    return
  }

  const supabase = await requireOperator()

  if (!supabase) {
    return
  }

  await scoreApplication(parsed.data)

  revalidatePath('/applications')
}
