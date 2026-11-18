import Link from 'next/link'
import { ArrowLeft, UserRound, FileText, Images, Palette, ArrowRight } from 'lucide-react'

const onboardingSections = [
  {
    number: '01',
    title: 'Founder Questionnaire',
    description:
      'Collect the founder’s background, business information, expertise, audience and professional goals.',
    detail: 'Founder information and brand direction',
    icon: UserRound,
  },
  {
    number: '02',
    title: 'Past LinkedIn Posts',
    description:
      'Collect posts written by the founder to understand their existing writing style and voice.',
    detail: 'The founder’s own writing samples',
    icon: FileText,
  },
  {
    number: '03',
    title: 'Reference Posts',
    description:
      'Collect examples of content from creators the founder admires for creative direction.',
    detail: 'Inspiration and preferred direction',
    icon: Images,
  },
  {
    number: '04',
    title: 'Brand Kit',
    description: 'Collect the founder’s brand colours, fonts, logo and other brand guidelines.',
    detail: 'Visual identity and brand assets',
    icon: Palette,
  },
]

export default function OnboardingPage() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 pb-10">
      <Link
        href="."
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition"
      >
        <ArrowLeft size={16} />
        Back to workspace
      </Link>

      <section>
        <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-[#A82B45] uppercase">
          Client onboarding
        </p>

        <h1 className="font-display text-3xl font-semibold tracking-tight text-[#252326]">
          Build the foundation.
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#89817E]">
          Gather everything needed to understand the founder, their business, their writing style
          and their brand identity before the interview.
        </p>
      </section>

      <section className="rounded-2xl bg-[#292326] p-7 text-white sm:p-9">
        <p className="text-xs font-semibold tracking-[0.16em] text-[#E7A9B5] uppercase">
          The onboarding process
        </p>

        <h2 className="font-display mt-3 max-w-xl text-2xl leading-snug font-semibold sm:text-3xl">
          Every strong personal brand starts with understanding the person.
        </h2>

        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#D1C6C8]">
          This information helps the operator prepare for a meaningful conversation with the
          founder. AI supports the process; human insight remains at the centre.
        </p>
      </section>

      <section>
        <div className="mb-5">
          <h2 className="font-display text-xl font-semibold text-[#252326]">Onboarding sections</h2>
          <p className="mt-1 text-sm text-[#89817E]">
            Complete these four sections to prepare the founder&apos;s brand foundation.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {onboardingSections.map((section) => {
            const Icon = section.icon

            return (
              <div
                key={section.number}
                className="rounded-xl border border-[#E8E4E0] bg-white p-6 transition-shadow hover:shadow-sm"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FBEFF1] text-[#A82B45]">
                    <Icon size={20} />
                  </div>

                  <span className="text-xs font-semibold tracking-wider text-[#A39B98]">
                    {section.number}
                  </span>
                </div>

                <h3 className="font-semibold text-[#252326]">{section.title}</h3>

                <p className="mt-2 min-h-12 text-sm leading-relaxed text-[#89817E]">
                  {section.description}
                </p>

                <div className="mt-5 border-t border-[#E8E4E0] pt-4">
                  <p className="text-xs text-[#A39B98]">{section.detail}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-[#E8E4E0] bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-[#252326]">Ready to begin?</h3>
          <p className="mt-1 text-sm text-[#89817E]">
            Start by collecting the founder&lsquo;s information.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 text-sm font-medium text-[#A82B45]">
          Questionnaire coming next
          <ArrowRight size={16} />
        </span>
      </section>
    </main>
  )
}
