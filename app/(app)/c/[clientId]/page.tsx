import Link from 'next/link'
import {
  ArrowUpRight,
  BookOpen,
  ClipboardList,
  FileText,
  Mic2,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react'

const workspaceModules = [
  {
    title: 'Brand Profile',
    description: 'Manage the founder’s voice, brand identity, and personal brand blueprint.',
    status: 'Foundation',
    icon: BookOpen,
  },
  {
    title: 'Knowledge Vault',
    description: 'Explore interview insights, founder perspectives, and collected knowledge.',
    status: 'Knowledge',
    icon: FileText,
  },
  {
    title: 'Interview',
    description: 'Prepare founder interviews and turn conversations into valuable insights.',
    status: 'Discovery',
    icon: Mic2,
  },
  {
    title: 'Content Studio',
    description: 'Create LinkedIn posts using the founder’s voice, strategy, and insights.',
    status: 'Creation',
    icon: Sparkles,
  },
  {
    title: 'Approvals',
    description: 'Review content, manage feedback, and track approval status.',
    status: 'Review',
    icon: ShieldCheck,
  },
  {
    title: 'Client Onboarding',
    description: 'Complete the founder questionnaire, collect posts, references, and brand assets.',
    status: 'Onboarding',
    icon: ClipboardList,
  },
]

export default async function ClientWorkspacePage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <p className="text-sm font-medium text-[#A82B45]">Client workspace</p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#252326]">
          Workspace overview
        </h1>

        <p className="mt-2 text-sm text-[#89817E]">
          Manage the founder’s personal brand journey from one place.
        </p>
      </div>

      {/* Renegade approach banner */}
      <div className="rounded-2xl bg-[#252326] p-7 text-white sm:p-9">
        <div className="flex items-center gap-2 text-sm font-medium text-[#E7AAB7]">
          <Sparkles size={16} />
          The Renegade approach
        </div>

        <h2 className="mt-4 max-w-2xl text-2xl leading-snug font-semibold sm:text-3xl">
          Human conversations. Distinctive founder voices.
        </h2>

        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/65">
          We turn real founder experiences, perspectives, and expertise into thoughtful LinkedIn
          content. AI amplifies the conversation; it never replaces the human voice.
        </p>
      </div>

      {/* Workspace modules */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#252326]">Workspace modules</h3>
            <p className="mt-1 text-sm text-[#89817E]">
              Everything you need to manage this founder’s brand.
            </p>
          </div>

          <Target size={20} className="text-[#A82B45]" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {workspaceModules.map((module) => {
            const Icon = module.icon

            const cardContent = (
              <>
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FBEFF1] text-[#A82B45]">
                    <Icon size={19} />
                  </div>

                  <span className="text-[10px] font-semibold tracking-wider text-[#A39B98] uppercase">
                    {module.status}
                  </span>
                </div>

                <h4 className="font-semibold text-[#252326]">{module.title}</h4>

                <p className="mt-2 text-sm leading-relaxed text-[#89817E]">{module.description}</p>

                <div className="mt-5 flex items-center gap-1 text-xs font-medium text-[#A82B45]">
                  Workspace module
                  <ArrowUpRight size={13} />
                </div>
              </>
            )

            const moduleRoutes: Record<string, string> = {
              'Brand Profile': `/c/${clientId}/brand-profile`,
              'Knowledge Vault': `/c/${clientId}/knowledge-vault`,
              Interview: `/c/${clientId}/interview`,
              'Content Studio': `/c/${clientId}/content-studio`,
              Approvals: `/c/${clientId}/approvals`,
              'Client Onboarding': `/c/${clientId}/onboarding`,
            }

            const route = moduleRoutes[module.title]

            return route ? (
              <Link
                key={module.title}
                href={route}
                className="block rounded-xl border border-[#E8E4E0] bg-white p-5 transition-all hover:border-[#A82B45] hover:shadow-sm"
              >
                {cardContent}
              </Link>
            ) : (
              <div
                key={module.title}
                className="rounded-xl border border-[#E8E4E0] bg-white p-5 transition-shadow hover:shadow-sm"
              >
                {cardContent}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
