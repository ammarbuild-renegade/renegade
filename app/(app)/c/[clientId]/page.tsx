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
    description: 'Define the founder’s voice, positioning, and brand identity.',
    icon: Target,
    status: 'Foundation',
  },

  {
    title: 'Client Onboarding',
    description: 'Collect founder information, business goals, audience, and brand preferences.',
    icon: ClipboardList,
    status: 'Getting started',
  },

  {
    title: 'Knowledge Vault',
    description: 'Centralize founder insights, experiences, and interview notes.',
    icon: BookOpen,
    status: 'Knowledge',
  },
  {
    title: 'Interview',
    description: 'Prepare conversations and manage interview transcripts.',
    icon: Mic2,
    status: 'Research',
  },
  {
    title: 'Content Studio',
    description: 'Develop LinkedIn content from real founder insights.',
    icon: Sparkles,
    status: 'Creation',
  },
  {
    title: 'Approvals',
    description: 'Review and manage content before founder approval.',
    icon: ShieldCheck,
    status: 'Review',
  },
]

export default function Page() {
  return (
    <div className="space-y-8">
      {/* Welcome heading */}
      <section>
        <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-[#A82B45] uppercase">
          Client workspace
        </p>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-[#252326]">
          Workspace overview
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#89817E]">
          Your central space for founder research, brand strategy, and LinkedIn content operations.
        </p>
      </section>

      {/* Intro banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[#292326] p-7 text-white sm:p-9">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-[#E7A9B5] uppercase">
            The Renegade approach
          </p>
          <h3 className="font-display text-2xl leading-snug font-semibold sm:text-3xl">
            Build a brand around what makes a founder different.
          </h3>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#D1C6C8]">
            Start with human conversations. Capture real experiences. Turn those insights into
            meaningful content in the founder’s own voice.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-12 -bottom-24 h-64 w-64 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-2 -bottom-16 h-48 w-48 rounded-full border border-white/10" />
      </section>

      {/* Workspace summary */}
      <section>
        <div className="mb-4">
          <h3 className="font-display text-xl font-semibold text-[#252326]">
            Workspace at a glance
          </h3>
          <p className="mt-1 text-sm text-[#89817E]">
            The key areas of your founder-brand workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {workspaceModules.map((module) => {
            const Icon = module.icon

            return (
              <div
                key={module.title}
                className="rounded-xl border border-[#E8E4E0] bg-white p-5 transition-shadow hover:shadow-sm"
              >
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
              </div>
            )
          })}
        </div>
      </section>

      {/* Working principle */}
      <section className="flex flex-col gap-4 rounded-xl border border-[#E8E4E0] bg-white p-6 sm:flex-row sm:items-center">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FBEFF1] text-[#A82B45]">
          <FileText size={20} />
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold text-[#252326]">
            Human insight comes first
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-[#89817E]">
            AI supports research and content creation. The operator guides the process, and the
            founder remains in control of final approval.
          </p>
        </div>
      </section>
    </div>
  )
}
