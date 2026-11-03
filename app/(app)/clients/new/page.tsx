'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createClientAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function NewClientPage() {
  // useActionState keeps the error the action returns without a client-side
  // fetch. On success the action redirects, so nothing comes back here.
  const [state, formAction, pending] = useActionState(createClientAction, null)

  return (
    <div className="max-w-md">
      <h1 className="font-display mb-1 text-2xl font-semibold">Add a client</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        A founder whose LinkedIn presence you manage.
      </p>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required maxLength={120} autoComplete="off" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="company">
            Company <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input id="company" name="company" maxLength={120} autoComplete="off" />
        </div>

        {state?.error && <p className="text-destructive text-sm">{state.error}</p>}

        <div className="mt-2 flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? 'Adding…' : 'Add client'}
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/clients">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
