'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

/** A read-only URL with a copy button. Used wherever a link must be handed over by hand. */
export function CopyLink({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access can be refused. The value is on screen to select by hand.
    }
  }

  return (
    <div className="flex items-center gap-2">
      <code className="border-border bg-background min-w-0 flex-1 truncate rounded border px-2 py-1.5 font-mono text-xs">
        {value}
      </code>
      <Button type="button" size="sm" variant="outline" onClick={copy}>
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  )
}
