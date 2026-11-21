'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { acceptApplication, type AcceptResult } from './actions'
import { Button } from '@/components/ui/button'

/**
 * Accepts an application and then shows the onboarding link on screen.
 *
 * The link is displayed rather than only emailed, deliberately. Resend's test
 * sender only reaches the account holder's own address until a domain is
 * verified, so in development the email reaches nobody else - and a client
 * whose email silently failed would otherwise have no way to continue.
 */
export function AcceptButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<AcceptResult | null>(null)
  const [copied, setCopied] = useState(false)

  function onAccept() {
    startTransition(async () => {
      const r = await acceptApplication(id)
      setResult(r)

      // Go to the new client's page, where the onboarding link lives
      // permanently. Showing it here instead would not survive: Next refreshes
      // the route after any server action, the accepted row drops out of the
      // status = 'new' query, and the panel unmounts with the link still on it.
      if (r.ok) router.push(`/c/${r.clientId}`)
    })
  }

  async function copy(link: string) {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access can be refused; the link is on screen to select by hand.
    }
  }

  if (result?.ok) {
    return (
      <div className="border-border bg-muted/40 mt-1 w-full rounded-lg border p-3">
        <p className="text-sm font-medium">{name} is now a client.</p>

        <p className="text-muted-foreground mt-1 text-sm">
          {result.emailed
            ? 'The onboarding link has been emailed. You can also send it yourself:'
            : 'The email could not be sent — copy this link and send it yourself:'}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <code className="border-border bg-background min-w-0 flex-1 truncate rounded border px-2 py-1.5 font-mono text-xs">
            {result.link}
          </code>
          <Button type="button" size="sm" variant="outline" onClick={() => copy(result.link)}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button type="button" size="sm" onClick={onAccept} disabled={pending}>
        {pending ? 'Accepting…' : 'Accept'}
      </Button>
      {result && !result.ok && <span className="text-destructive text-sm">{result.error}</span>}
    </div>
  )
}
