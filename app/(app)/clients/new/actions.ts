'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const NewClient = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  company: z.string().trim().max(120).optional(),
})

export async function createClientAction(_prev: unknown, formData: FormData) {
  const parsed = NewClient.safeParse({
    name: formData.get('name'),
    company: formData.get('company') || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const operatorId = claims?.claims?.sub
  if (!operatorId) return { error: 'You are not signed in.' }

  const { data, error } = await supabase
    .from('clients')
    .insert({ ...parsed.data, operator_id: operatorId })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/clients')
  redirect(`/c/${data.id}`)
}
