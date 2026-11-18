import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, Plus, UsersRound } from 'lucide-react'

export default async function ClientsPage() {
  const supabase = await createClient()

  const { data: clients, error } = await supabase
    .from('clients')
    .select('id, name, company, status, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="mb-1 font-semibold text-red-800">Could not load clients</h2>
        <p className="text-sm text-red-700">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-[#A82B45] uppercase">
            Workspace / Relationships
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#252326]">
            Clients
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#89817E]">
            Manage your founders, understand their businesses, and build meaningful personal brands.
          </p>
        </div>

        <Button asChild className="h-10 rounded-lg bg-[#A82B45] px-4 text-white hover:bg-[#90243B]">
          <Link href="/clients/new">
            <Plus size={16} />
            Add client
          </Link>
        </Button>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#E8E4E0] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#89817E]">Total clients</p>
            <UsersRound size={18} className="text-[#A82B45]" />
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#252326]">
            {clients?.length ?? 0}
          </p>
          <p className="mt-1 text-xs text-[#A39B98]">Founder relationships in your workspace</p>
        </div>

        <div className="rounded-xl border border-[#E8E4E0] bg-white p-5">
          <p className="text-sm text-[#89817E]">Your focus</p>
          <p className="font-display mt-3 text-xl font-semibold text-[#252326]">
            Founder-first branding
          </p>
          <p className="mt-1 text-xs text-[#A39B98]">Human conversations. Meaningful content.</p>
        </div>
      </div>

      {/* Client list */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#252326]">All clients</h2>
            <p className="mt-1 text-xs text-[#89817E]">Your founder accounts and workspaces</p>
          </div>
          <span className="text-xs text-[#89817E]">{clients?.length ?? 0} total</span>
        </div>

        {!clients || clients.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#DCD5D0] bg-white px-6 py-14 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FBEFF1] text-[#A82B45]">
              <UsersRound size={22} />
            </div>
            <h3 className="font-display text-xl font-semibold text-[#252326]">No clients yet</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#89817E]">
              A client is a founder whose LinkedIn presence you manage. Start by adding your first
              founder to Renegade.
            </p>
            <Button asChild className="mt-6 rounded-lg bg-[#A82B45] text-white hover:bg-[#90243B]">
              <Link href="/clients/new">
                <Plus size={16} />
                Add your first client
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {clients.map((client) => (
              <Link
                key={client.id}
                href={`/c/${client.id}`}
                className="group rounded-xl border border-[#E8E4E0] bg-white p-5 transition-all hover:border-[#D9A5B0] hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="font-display flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FBEFF1] text-lg font-semibold text-[#A82B45]">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-[#252326]">{client.name}</h3>
                      <p className="mt-1 truncate text-sm text-[#89817E]">
                        {client.company || 'Independent founder'}
                      </p>
                    </div>
                  </div>

                  <ArrowUpRight
                    size={18}
                    className="shrink-0 text-[#A39B98] transition-colors group-hover:text-[#A82B45]"
                  />
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#F0ECE9] pt-4">
                  <span className="rounded-md bg-[#F7F6F3] px-2.5 py-1 text-xs font-medium text-[#77706D] capitalize">
                    {client.status}
                  </span>
                  <span className="text-xs text-[#A39B98]">Open workspace</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
