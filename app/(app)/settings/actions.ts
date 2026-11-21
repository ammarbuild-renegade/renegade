'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

/**
 * Empty clears the link. Otherwise it must be a real https URL - a client is
 * going to click this, and a typo here is a dead end at the exact moment they
 * are ready to book.
 */
const BookingUrl = z.union([
  z.literal(''),
  z
    .url()
    .max(500)
    .refine((u) => u.startsWith('https://'), {
      message: 'The link must start with https://',
    }),
])

export async function saveBookingUrl(_prev: unknown, formData: FormData) {
  const parsed = BookingUrl.safeParse(formData.get('booking_url') ?? '')

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const operatorId = claims?.claims?.sub
  if (!operatorId) return { error: 'You are not signed in.' }

  const { error } = await supabase
    .from('operators')
    .update({ booking_url: parsed.data === '' ? null : parsed.data })
    .eq('id', operatorId)

  if (error) return { error: error.message }

  // The onboarding confirmation screen reads this, so clients waiting on a
  // booking link see the button as soon as it is set.
  revalidatePath('/settings')
  revalidatePath('/onboarding', 'layout')

  return { saved: true }
}
