import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClientSwitcher } from '@/components/workspace/client-switcher'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  // getClaims(), not getSession(). getSession() trusts the cookie without
  // revalidating it.
  //
  // proxy.ts already redirects a signed-out visitor, so this looks redundant.
  // It is not: Next's own documentation describes Proxy as an optimistic check
  // and explicitly not an authorisation layer. This is the check that actually
  // guards the data.
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims) redirect('/login')

  // No .eq('operator_id', ...) here on purpose. The security rule in the
  // database already restricts this to the signed-in operator's clients.
  // Filtering again in the query would hide a broken policy rather than
  // expose it.
  const { data: clients } = await supabase.from('clients').select('id, name, company').order('name')

  return (
    <div className="flex min-h-screen">
      <aside className="border-border flex w-64 shrink-0 flex-col border-r p-4">
        <Link href="/clients" className="font-display mb-6 text-lg font-semibold">
          Renegade
        </Link>

        {/* The operator's two top-level destinations. Without these the only
            way out of a client workspace is editing the URL by hand. */}
        <nav className="mb-6 flex flex-col gap-0.5">
          <Link
            href="/clients"
            className="hover:bg-muted text-foreground rounded-md px-2 py-1.5 text-sm transition-colors"
          >
            Clients
          </Link>
          <Link
            href="/applications"
            className="hover:bg-muted text-foreground rounded-md px-2 py-1.5 text-sm transition-colors"
          >
            Applications
          </Link>
          <Link
            href="/settings"
            className="hover:bg-muted text-foreground rounded-md px-2 py-1.5 text-sm transition-colors"
          >
            Settings
          </Link>
        </nav>

        <div className="text-muted-foreground mb-2 px-2 font-mono text-[10px] tracking-[0.15em] uppercase">
          Client
        </div>
        <ClientSwitcher clients={clients ?? []} />
      </aside>
      <div className="min-w-0 flex-1 p-8">{children}</div>
    </div>
  )
}
