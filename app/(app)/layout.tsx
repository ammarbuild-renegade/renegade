import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Users, ArrowUpRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ClientSwitcher } from '@/components/workspace/client-switcher'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims) redirect('/login')

  const { data: clients } = await supabase.from('clients').select('id, name, company').order('name')

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#252326]">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-[260px] shrink-0 flex-col border-r border-[#E8E4E0] bg-white lg:flex">
          <div className="flex h-[76px] items-center gap-3 border-b border-[#E8E4E0] px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#A82B45] text-sm font-bold text-white">
              R
            </div>
            <div>
              <div className="font-display text-xl font-semibold tracking-tight">Renegade</div>
              <div className="text-[10px] tracking-[0.18em] text-[#9A9290] uppercase">
                Founder brand studio
              </div>
            </div>
          </div>

          <div className="flex-1 px-4 py-7">
            <p className="mb-3 px-3 text-[10px] font-semibold tracking-[0.16em] text-[#A39B98] uppercase">
              Workspace
            </p>

            <Link
              href="/clients"
              className="flex items-center gap-3 rounded-lg bg-[#FBEFF1] px-3 py-3 text-sm font-medium text-[#A82B45]"
            >
              <Users size={18} />
              Clients
              <span className="ml-auto rounded-md bg-white px-2 py-0.5 text-xs">
                {clients?.length ?? 0}
              </span>
            </Link>

            <div className="mt-9">
              <p className="mb-3 px-3 text-[10px] font-semibold tracking-[0.16em] text-[#A39B98] uppercase">
                Current client
              </p>
              <ClientSwitcher clients={clients ?? []} />
            </div>
          </div>

          <div className="border-t border-[#E8E4E0] p-5">
            <div className="rounded-xl bg-[#F7F6F3] p-4">
              <div className="text-xs font-semibold">Renegade FYP-1</div>
              <p className="mt-1 text-xs leading-relaxed text-[#8B8380]">
                Human-led founder branding and content operations.
              </p>
              <div className="mt-3 flex items-center gap-1 text-[10px] font-medium text-[#A82B45]">
                Project workspace <ArrowUpRight size={12} />
              </div>
            </div>
          </div>
        </aside>

        {/* Main area */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[76px] items-center justify-between border-b border-[#E8E4E0] bg-white px-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#A82B45] text-sm font-bold text-white lg:hidden">
                R
              </div>
              <div>
                <p className="text-sm font-semibold">Operator workspace</p>
                <p className="text-xs text-[#9A9290]">Manage your founder relationships</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-[#9A9290] sm:block">FYP-1 · Operator</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FBEFF1] text-sm font-semibold text-[#A82B45]">
                O
              </div>
            </div>
          </header>

          <main className="w-full flex-1 px-5 py-8 sm:px-8 lg:px-10">
            <div className="mx-auto w-full max-w-[1400px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
