'use client'

import { useRouter, useParams, usePathname } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type ClientOption = { id: string; name: string; company: string | null }

export function ClientSwitcher({ clients }: { clients: ClientOption[] }) {
  const router = useRouter()
  const params = useParams<{ clientId?: string }>()
  const pathname = usePathname()

  function onChange(nextId: string) {
    // Stay on the same screen, just under a different client:
    //   /c/<old>/posts  ->  /c/<new>/posts
    const rest = pathname.split('/').slice(3).join('/')
    router.push(`/c/${nextId}${rest ? '/' + rest : ''}`)
  }

  if (clients.length === 0) {
    return <p className="text-muted-foreground px-2 text-sm">No clients yet</p>
  }

  return (
    <Select value={params.clientId} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Choose a client" />
      </SelectTrigger>
      <SelectContent>
        {clients.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name}
            {c.company ? ` — ${c.company}` : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
