import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params // params is a Promise in Next 15+
  const supabase = await createClient()

  const { data: client } = await supabase
    .from('clients')
    .select('id, name, company')
    .eq('id', clientId)
    .single()

  // If this id belongs to another operator the security rule returns nothing,
  // so the visitor gets a 404 - the same answer as an id that does not exist.
  // That is deliberate: a 403 would confirm the client is real.
  if (!client) notFound()

  return (
    <>
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold">{client.name}</h1>
        {client.company && <p className="text-muted-foreground text-sm">{client.company}</p>}
      </header>
      {children}
    </>
  )
}
