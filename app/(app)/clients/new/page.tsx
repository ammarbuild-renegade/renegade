'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building2, UserRound, Sparkles } from 'lucide-react'
import { createClientAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function NewClientPage() {
  const [state, formAction, pending] = useActionState(createClientAction, {
    error: '',
  })

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <Link
        href="/clients"
        className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm transition"
      >
        <ArrowLeft size={16} />
        Back to clients
      </Link>

      <div className="mb-8">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#A82B45]/10 text-[#A82B45]">
          <UserRound size={21} />
        </div>

        <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-[#A82B45] uppercase">
          Client management
        </p>

        <h1 className="text-3xl font-semibold tracking-tight">Add a new client</h1>

        <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-6">
          Start building a founder&apos;s personal brand. Add their basic details to create their
          workspace in Renegade.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <section className="bg-card rounded-2xl border p-6 shadow-sm sm:p-8">
          <div className="mb-7">
            <h2 className="text-lg font-semibold">Founder information</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Enter the basic information to get started.
            </p>
          </div>

          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Client&apos;s full name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Shaun Brown"
                required
                maxLength={120}
                className="h-11"
              />
              <p className="text-muted-foreground text-xs">
                The founder whose personal brand you manage.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company name</Label>
              <Input
                id="company"
                name="company"
                placeholder="e.g. Brown Marketing"
                maxLength={120}
                className="h-11"
              />
              <p className="text-muted-foreground text-xs">
                Leave blank if the founder works independently.
              </p>
            </div>

            {state?.error && (
              <p className="border-destructive/20 bg-destructive/5 text-destructive rounded-lg border p-3 text-sm">
                {state.error}
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
              <Button asChild variant="outline">
                <Link href="/clients">Cancel</Link>
              </Button>

              <Button
                type="submit"
                disabled={pending}
                className="bg-[#A82B45] text-white hover:bg-[#8F2038]"
              >
                {pending ? 'Creating workspace...' : 'Create client'}
              </Button>
            </div>
          </form>
        </section>

        <aside className="bg-muted/30 h-fit rounded-2xl border p-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#A82B45]/10 text-[#A82B45]">
            <Sparkles size={19} />
          </div>

          <h3 className="font-semibold">What happens next?</h3>

          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Once the client is created, you can open their workspace and continue with the
            onboarding process.
          </p>

          <div className="mt-5 space-y-4">
            <div className="flex gap-3">
              <UserRound size={17} className="mt-0.5 shrink-0 text-[#A82B45]" />
              <div>
                <p className="text-sm font-medium">Client workspace</p>
                <p className="text-muted-foreground text-xs leading-5">
                  A dedicated space for the founder.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Building2 size={17} className="mt-0.5 shrink-0 text-[#A82B45]" />
              <div>
                <p className="text-sm font-medium">Brand onboarding</p>
                <p className="text-muted-foreground text-xs leading-5">
                  Gather the information needed to build their brand.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
