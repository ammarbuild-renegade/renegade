'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { use, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ClipboardList, User, Building2, Target } from 'lucide-react'

const sections = [
  { number: '01', title: 'Founder basics', icon: User },
  { number: '02', title: 'Business context', icon: Building2 },
  { number: '03', title: 'Audience & expertise', icon: ClipboardList },
  { number: '04', title: 'Brand goals', icon: Target },
]

const inputClass =
  'w-full rounded-lg border border-[#E8E4E0] bg-white px-4 py-3 text-sm text-[#292326] outline-none transition placeholder:text-[#A49C98] focus:border-[#A82B45] focus:ring-2 focus:ring-[#A82B45]/10'

const labelClass = 'mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#89817E]'

export default function QuestionnairePage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params)
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({
    fullName: '',
    role: '',
    company: '',
    website: '',
    business: '',
    audience: '',
    expertise: '',
    goals: [] as string[],
  })

  function update(field: string, value: string) {
    setAnswers((previous) => ({ ...previous, [field]: value }))
  }

  function toggleGoal(goal: string) {
    setAnswers((previous) => ({
      ...previous,
      goals: previous.goals.includes(goal)
        ? previous.goals.filter((item) => item !== goal)
        : [...previous.goals, goal],
    }))
  }

  function nextStep() {
    if (step < sections.length - 1) {
      setStep((current) => current + 1)
    } else {
      console.log('Questionnaire answers:', answers)
      router.push(`/c/${clientId}/onboarding/past-posts`)
    }
  }

  const currentSection = sections[step]
  const Icon = currentSection.icon

  return (
    <div className="min-h-screen bg-[#F8F6F3] px-5 py-8 md:px-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/c/${clientId}/onboarding`}
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#89817E] transition hover:text-[#A82B45]"
        >
          <ArrowLeft size={16} />
          Back to onboarding
        </Link>

        <div className="mb-8">
          <p className="mb-3 text-[11px] font-semibold tracking-[0.16em] text-[#A82B45]">
            CLIENT ONBOARDING
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#292326]">
            Founder questionnaire
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#89817E]">
            Tell us about the founder and the business. This gives the operator a strong starting
            point for the brand conversation.
          </p>
        </div>

        <div className="mb-7 rounded-xl border border-[#E8E4E0] bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-[#89817E]">
                YOUR PROGRESS
              </p>
              <p className="mt-1 text-sm font-semibold text-[#292326]">Section {step + 1} of 4</p>
            </div>
            <span className="text-sm font-semibold text-[#A82B45]">
              {Math.round(((step + 1) / sections.length) * 100)}%
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-[#F0ECE8]">
            <div
              className="h-full rounded-full bg-[#A82B45] transition-all"
              style={{ width: `${((step + 1) / sections.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
          <div className="rounded-xl border border-[#E8E4E0] bg-white p-6 md:p-8">
            <div className="mb-7 flex items-start gap-4">
              <div className="rounded-lg bg-[#FBEFF1] p-3 text-[#A82B45]">
                <Icon size={21} />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-[#A82B45]">{currentSection.number}</p>
                <h2 className="mt-1 text-xl font-semibold text-[#292326]">
                  {currentSection.title}
                </h2>
                <p className="mt-1 text-sm text-[#89817E]">
                  {step === 0 && 'A little about the person behind the brand.'}
                  {step === 1 && 'Help us understand what the business does and who it serves.'}
                  {step === 2 && 'Who do you want to reach, and what should you be known for?'}
                  {step === 3 && 'What should your personal brand help you achieve?'}
                </p>
              </div>
            </div>

            {step === 0 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Full name</label>
                  <input
                    className={inputClass}
                    placeholder="Founder's full name"
                    value={answers.fullName}
                    onChange={(e) => update('fullName', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Role / Job title</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. Founder, CEO"
                    value={answers.role}
                    onChange={(e) => update('role', e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Company / Brand name</label>
                    <input
                      className={inputClass}
                      placeholder="Business or company name"
                      value={answers.company}
                      onChange={(e) => update('company', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Website</label>
                    <input
                      className={inputClass}
                      placeholder="https://"
                      value={answers.website}
                      onChange={(e) => update('website', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>What does your business do?</label>
                  <textarea
                    className={inputClass}
                    rows={4}
                    placeholder="Describe your product, service or business..."
                    value={answers.business}
                    onChange={(e) => update('business', e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Who is your ideal audience?</label>
                  <textarea
                    className={inputClass}
                    rows={3}
                    placeholder="Describe the people or organisations you want to reach..."
                    value={answers.audience}
                    onChange={(e) => update('audience', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>What are your areas of expertise?</label>
                  <textarea
                    className={inputClass}
                    rows={3}
                    placeholder="Topics, skills or experiences you can speak about with authority..."
                    value={answers.expertise}
                    onChange={(e) => update('expertise', e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <label className={labelClass}>What are your primary brand goals?</label>
                <p className="mb-4 text-xs text-[#89817E]">Select all that apply.</p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    'Build authority',
                    'Generate leads',
                    'Grow network',
                    'Attract opportunities',
                  ].map((goal) => {
                    const selected = answers.goals.includes(goal)

                    return (
                      <button
                        type="button"
                        key={goal}
                        onClick={() => toggleGoal(goal)}
                        className={`flex items-center justify-between rounded-lg border p-4 text-left text-sm transition ${
                          selected
                            ? 'border-[#A82B45] bg-[#FBEFF1] text-[#A82B45]'
                            : 'border-[#E8E4E0] text-[#89817E] hover:border-[#A82B45]'
                        }`}
                      >
                        {goal}
                        {selected && <Check size={16} />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="mt-9 flex items-center justify-between border-t border-[#E8E4E0] pt-6">
              <button
                type="button"
                disabled={step === 0}
                onClick={() => setStep((current) => current - 1)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#E8E4E0] px-4 py-3 text-sm text-[#89817E] transition hover:bg-[#F8F6F3] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft size={15} />
                Previous
              </button>

              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-2 rounded-lg bg-[#A82B45] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#8F243B]"
              >
                {step === 3 ? 'Finish questionnaire' : 'Save & continue'}
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-xl bg-[#292326] p-5 text-white">
              <h3 className="text-lg font-semibold">A better understanding.</h3>
              <p className="mt-3 text-xs leading-6 text-[#D1C5C8]">
                This questionnaire captures the founder&lsquo;s context before the operator-led
                interview.
              </p>
              <div className="mt-5 border-t border-white/15 pt-4">
                <p className="text-[10px] font-semibold tracking-wider text-[#E7A9B6]">
                  HUMAN-LED PROCESS
                </p>
                <p className="mt-2 text-xs leading-5 text-[#F4ECEE]">
                  The conversation adds depth. The questionnaire gives it direction.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#E8E4E0] bg-white p-5">
              <p className="mb-5 text-[10px] font-semibold tracking-wider text-[#89817E]">
                ONBOARDING STEPS
              </p>

              {['Founder questionnaire', 'Past LinkedIn posts', 'Reference posts', 'Brand kit'].map(
                (item, index) => (
                  <div key={item} className="mb-4 flex items-center gap-3">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold ${
                        index === step
                          ? 'bg-[#FBEFF1] text-[#A82B45]'
                          : 'bg-[#F2EFEC] text-[#89817E]'
                      }`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <span
                      className={`text-xs ${
                        index === step ? 'font-semibold text-[#A82B45]' : 'text-[#89817E]'
                      }`}
                    >
                      {item}
                    </span>
                  </div>
                )
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
