import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

export default async function ClientsPage() {
  const supabase = await createClient()

  const { data: clients, error } = await supabase
    .from('clients')
    .select('id, name, company, status, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="border-destructive/30 bg-destructive/5 rounded-lg border p-6">
        <h2 className="mb-1 font-semibold">Could not load clients</h2>
        <p className="text-muted-foreground text-sm">{error.message}</p>
      </div>
    )
  }

  if (!clients || clients.length === 0) {
    return (
      <div className="border-border rounded-lg border border-dashed p-12 text-center">
        <h2 className="font-display mb-2 text-xl font-semibold">No clients yet</h2>

        <p className="text-muted-foreground mx-auto mb-6 max-w-sm text-sm">
          A client is a founder whose LinkedIn presence you manage. Everything else in Renegade
          hangs off one.
        </p>

        <Button asChild>
          <Link href="/clients/new">Add your first client</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Clients</h1>

        <Button asChild>
          <Link href="/clients/new">Add client</Link>
        </Button>
      </div>

      <ul className="flex flex-col">
        {clients.map((c) => (
          <li key={c.id} className="border-border border-t">
            <Link href={`/c/${c.id}`} className="hover:bg-muted/50 block px-2 py-4">
              <div className="font-medium">{c.name}</div>
              <div className="text-muted-foreground text-sm">{c.company ?? '—'}</div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
