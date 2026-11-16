'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { acceptApplication } from './actions'

type Result = Awaited<ReturnType<typeof acceptApplication>>

export function AcceptButton({ applicationId }: { applicationId: string }) {
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<Result | null>(null)
  const [copied, setCopied] = useState(false)

  function onAccept() {
    startTransition(async () => {
      setResult(await acceptApplication(applicationId))
    })
  }

  async function onCopy(link: string) {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (result && 'error' in result) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-destructive text-sm">{result.error}</p>
        <Button size="sm" onClick={onAccept} disabled={pending}>
          Try again
        </Button>
      </div>
    )
  }

  if (result && 'link' in result) {
    return (
      <div className="border-border flex flex-col gap-2 rounded-lg border p-3">
        {!result.emailed && (
          <p className="text-destructive text-sm">
            Could not send the email — copy this link and send it yourself.
          </p>
        )}
        {result.emailed && (
          <p className="text-muted-foreground text-sm">Email sent. The link is also here:</p>
        )}
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={result.link}
            className="border-border w-full rounded border px-2 py-1 text-xs"
            onFocus={(e) => e.currentTarget.select()}
          />
          <Button size="sm" variant="outline" onClick={() => onCopy(result.link)}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button size="sm" onClick={onAccept} disabled={pending}>
      {pending ? 'Accepting…' : 'Accept'}
    </Button>
  )
}
