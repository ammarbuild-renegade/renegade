'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createClientAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function NewClientPage() {
  const [state, formAction, pending] = useActionState(createClientAction, {
    error: '',
  })

  return (
    <main className="mx-auto w-full max-w-2xl p-6">
      <div className="mb-8">
        <Link href="/clients" className="text-muted-foreground text-sm hover:underline">
          ← Back to clients
        </Link>

        <h1 className="mt-4 text-2xl font-semibold">Add a client</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Add a founder whose LinkedIn presence you manage.
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Client name</Label>
          <Input id="name" name="name" placeholder="e.g. Shaun Brown" required maxLength={120} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company name</Label>
          <Input id="company" name="company" placeholder="e.g. Brown Marketing" maxLength={120} />
        </div>

        {state?.error && <p className="text-destructive text-sm">{state.error}</p>}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? 'Creating...' : 'Create client'}
          </Button>

          <Button asChild variant="outline">
            <Link href="/clients">Cancel</Link>
          </Button>
        </div>
      </form>
    </main>
  )
}
