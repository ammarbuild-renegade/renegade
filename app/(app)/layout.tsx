import { ClientSwitcher } from '@/components/workspace/client-switcher'
import { MOCK_CLIENTS } from '@/components/workspace/mock-clients'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="border-border w-64 shrink-0 border-r p-4">
        <div className="font-display mb-6 text-lg font-semibold">Renegade</div>
        <ClientSwitcher clients={MOCK_CLIENTS} />
      </aside>
      <div className="min-w-0 flex-1 p-8">{children}</div>
    </div>
  )
}
