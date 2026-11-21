'use client'

import { useActionState } from 'react'
import { saveBookingUrl } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function BookingUrlForm({ current }: { current: string }) {
  const [state, formAction, pending] = useActionState(saveBookingUrl, null)

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="booking_url">Scheduling link</Label>
        <Input
          id="booking_url"
          name="booking_url"
          type="url"
          defaultValue={current}
          placeholder="https://cal.com/you/intro-call"
          maxLength={500}
        />
        <p className="text-muted-foreground text-xs">
          Paste the booking page from whichever scheduling tool you use. Leave it empty to remove
          the button from the client&rsquo;s confirmation screen.
        </p>
      </div>

      {state && 'error' in state && state.error && (
        <p className="text-destructive text-sm">{state.error}</p>
      )}
      {state && 'saved' in state && state.saved && (
        <p className="text-sm text-green-700">
          Saved. Clients will see this at the end of onboarding.
        </p>
      )}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
