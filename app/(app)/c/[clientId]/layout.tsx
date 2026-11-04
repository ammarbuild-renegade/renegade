import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const supabase = await createClient()

  const { data: client } = await supabase
    .from('clients')
    .select('id, name, company')
    .eq('id', clientId)
    .single()

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
