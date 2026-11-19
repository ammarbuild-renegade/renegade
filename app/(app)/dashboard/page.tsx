import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowUpRight, Plus, UsersRound, UserRoundCheck, Layers3 } from 'lucide-react'

export default async function OperatorDashboard() {
  const supabase = await createClient()

  const [
    { count: totalClients, error: totalError },
    { count: activeClients, error: activeError },
    { data: recentClients, error: recentError },
  ] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }),

    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active'),

    supabase
      .from('clients')
      .select('id, name, company, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  if (totalError || activeError || recentError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">Could not load your dashboard</h2>
        <p className="mt-1 text-sm text-red-700">Please refresh the page or try again.</p>
      </div>
    )
  }

  const total = totalClients ?? 0
  const active = activeClients ?? 0
  const other = total - active

  return (
    <div className="space-y-9">
      {/* Welcome */}
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-[#A82B45] uppercase">
            Renegade / Operator workspace
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#252326] sm:text-4xl">
            Your workspace.
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#89817E]">
            Manage founder relationships, build personal brands, and turn meaningful conversations
            into thoughtful content.
          </p>
        </div>

        <Button asChild className="h-10 rounded-lg bg-[#A82B45] px-4 text-white hover:bg-[#90243B]">
          <Link href="/clients/new">
            <Plus size={16} />
            Add new client
          </Link>
        </Button>
      </section>

      {/* Introduction banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[#252326] p-7 text-white sm:p-9">
        <div className="relative z-10 max-w-2xl">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-[#DDA6B1] uppercase">
            The Renegade approach
          </p>
          <h2 className="font-display mt-4 text-2xl leading-tight font-semibold sm:text-3xl">
            Human conversations.
            <br />
            Distinctive founder voices.
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#C4BEC0]">
            Your work starts with understanding each founder. Renegade helps turn their knowledge,
            perspective, and experience into content that sounds like them.
          </p>
          <Link
            href="/clients"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-[#DDA6B1]"
          >
            Explore your clients <ArrowRight size={16} />
          </Link>
        </div>
        <div className="pointer-events-none absolute -top-24 -right-12 h-72 w-72 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -top-14 -right-2 h-52 w-52 rounded-full border border-white/10" />
      </section>

      {/* Overview */}
      <section>
        <div className="mb-4">
          <h2 className="font-display text-xl font-semibold text-[#252326]">Workspace overview</h2>
          <p className="mt-1 text-xs text-[#89817E]">A snapshot of your founder relationships</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#E8E4E0] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#89817E]">Total clients</p>
              <UsersRound size={19} className="text-[#A82B45]" />
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-[#252326]">{total}</p>
            <p className="mt-1 text-xs text-[#A39B98]">Founder workspaces</p>
          </div>

          <div className="rounded-xl border border-[#E8E4E0] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#89817E]">Active clients</p>
              <UserRoundCheck size={19} className="text-[#A82B45]" />
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-[#252326]">{active}</p>
            <p className="mt-1 text-xs text-[#A39B98]">Currently active</p>
          </div>

          <div className="rounded-xl border border-[#E8E4E0] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#89817E]">Other statuses</p>
              <Layers3 size={19} className="text-[#A82B45]" />
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-[#252326]">{other}</p>
            <p className="mt-1 text-xs text-[#A39B98]">Not marked as active</p>
          </div>
        </div>
      </section>

      {/* Recent clients */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#252326]">Your clients</h2>
            <p className="mt-1 text-xs text-[#89817E]">Recently added founder workspaces</p>
          </div>
          <Link
            href="/clients"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#A82B45] hover:text-[#90243B]"
          >
            View all <ArrowUpRight size={14} />
          </Link>
        </div>

        {!recentClients || recentClients.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#DCD5D0] bg-white px-6 py-12 text-center">
            <UsersRound size={25} className="mx-auto text-[#A82B45]" />
            <h3 className="font-display mt-4 text-lg font-semibold text-[#252326]">
              Your workspace starts here
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-[#89817E]">
              Add your first founder to begin building their personal brand.
            </p>
            <Button asChild className="mt-5 rounded-lg bg-[#A82B45] text-white hover:bg-[#90243B]">
              <Link href="/clients/new">
                <Plus size={16} />
                Add your first client
              </Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#E8E4E0] bg-white">
            {recentClients.map((client, index) => (
              <Link
                key={client.id}
                href={`/c/${client.id}`}
                className={`group flex items-center justify-between gap-4 p-5 transition-colors hover:bg-[#FAF8F6] ${
                  index !== 0 ? 'border-t border-[#F0ECE9]' : ''
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="font-display flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FBEFF1] text-lg font-semibold text-[#A82B45]">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#252326]">{client.name}</p>
                    <p className="mt-1 truncate text-xs text-[#89817E]">
                      {client.company || 'Independent founder'}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="rounded-md bg-[#F7F6F3] px-2.5 py-1 text-xs font-medium text-[#77706D] capitalize">
                    {client.status}
                  </span>
                  <ArrowUpRight
                    size={17}
                    className="text-[#A39B98] transition-colors group-hover:text-[#A82B45]"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
