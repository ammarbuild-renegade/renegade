'use client'

import Link from 'next/link'
import { use, useState } from 'react'
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  Lightbulb,
  PenLine,
  Plus,
  Sparkles,
  Target,
} from 'lucide-react'

type Pillar = {
  name: string
  category: string
  description: string
}

const pillars: Pillar[] = [
  {
    name: 'Founder Lessons',
    category: 'Resonance',
    description: 'Personal experiences, lessons, and perspectives from the founder.',
  },
  {
    name: 'Industry Insights',
    category: 'Reach',
    description: 'Ideas and observations that demonstrate industry knowledge.',
  },
  {
    name: 'Business Philosophy',
    category: 'Revenue',
    description: 'The founder’s approach, beliefs, and business principles.',
  },
]

const initialDrafts = [
  {
    title: 'The lesson nobody tells you about building a business',
    pillar: 'Founder Lessons',
    status: 'Draft',
    date: 'Just now',
    excerpt:
      'Building a business teaches you things that no textbook can prepare you for. Some of the most valuable lessons come from the decisions you make when things do not go according to plan...',
  },
  {
    title: 'Why understanding your customer matters more than ever',
    pillar: 'Industry Insights',
    status: 'In Review',
    date: 'Yesterday',
    excerpt:
      'A great product is only one part of building a successful business. Understanding the people you serve is what helps you create something that genuinely matters...',
  },
]

export default function ContentStudioPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params)

  const [selectedPillar, setSelectedPillar] = useState(pillars[0].name)
  const [contentAngle, setContentAngle] = useState('')
  const [additionalContext, setAdditionalContext] = useState('')
  const [drafts, setDrafts] = useState(initialDrafts)
  const [showBrief, setShowBrief] = useState(false)

  const selectedPillarData = pillars.find((pillar) => pillar.name === selectedPillar)

  function createLocalDraft() {
    if (!additionalContext.trim()) {
      setShowBrief(true)
      return
    }

    setDrafts((current) => [
      {
        title: contentAngle.trim() || 'New content idea',
        pillar: selectedPillar,
        status: 'Draft',
        date: 'Just now',
        excerpt: additionalContext.trim(),
      },
      ...current,
    ])

    setAdditionalContext('')
    setContentAngle('')
    setShowBrief(false)
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <Link
          href={`/c/${clientId}`}
          className="mb-5 inline-flex items-center gap-2 text-sm text-[#89817E] transition hover:text-[#A82B45]"
        >
          <ArrowLeft size={16} />
          Back to workspace
        </Link>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-[#A82B45]">Content management</p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#252326]">
              Content Studio
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#89817E]">
              Turn founder insights and strategic content pillars into meaningful LinkedIn content.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-[#E8E4E0] bg-white px-3 py-2 text-xs text-[#89817E]">
            <Sparkles size={14} className="text-[#A82B45]" />
            Human-led content creation
          </div>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E8E4E0] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#89817E]">Total drafts</p>
            <FileText size={18} className="text-[#A82B45]" />
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-[#252326]">{drafts.length}</h2>
          <p className="mt-1 text-xs text-[#A39B98]">Content in your workspace</p>
        </div>

        <div className="rounded-xl border border-[#E8E4E0] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#89817E]">In review</p>
            <Clock3 size={18} className="text-[#A82B45]" />
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-[#252326]">
            {drafts.filter((draft) => draft.status === 'In Review').length}
          </h2>
          <p className="mt-1 text-xs text-[#A39B98]">Awaiting feedback</p>
        </div>

        <div className="rounded-xl border border-[#E8E4E0] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#89817E]">Content pillars</p>
            <Target size={18} className="text-[#A82B45]" />
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-[#252326]">{pillars.length}</h2>
          <p className="mt-1 text-xs text-[#A39B98]">Strategic content directions</p>
        </div>
      </div>

      {/* R3 Content Pillars */}
      <section>
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-[#A82B45]" />
            <h2 className="text-lg font-semibold text-[#252326]">R3 Content Pillars</h2>
          </div>

          <p className="mt-1 text-sm text-[#89817E]">
            Choose a strategic direction for the next piece of content.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {pillars.map((pillar) => {
            const isSelected = selectedPillar === pillar.name

            return (
              <button
                key={pillar.name}
                type="button"
                onClick={() => setSelectedPillar(pillar.name)}
                className={`rounded-xl border p-5 text-left transition ${
                  isSelected
                    ? 'border-[#A82B45] bg-[#FDF7F8] shadow-sm'
                    : 'border-[#E8E4E0] bg-white hover:border-[#CDBFC0]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-[#FBEFF1] px-2.5 py-1 text-[10px] font-semibold tracking-wide text-[#A82B45] uppercase">
                    {pillar.category}
                  </span>

                  {isSelected && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#A82B45] text-white">
                      <Check size={14} />
                    </span>
                  )}
                </div>

                <h3 className="mt-4 font-semibold text-[#252326]">{pillar.name}</h3>

                <p className="mt-2 text-sm leading-relaxed text-[#89817E]">{pillar.description}</p>
              </button>
            )
          })}
        </div>
      </section>

      {/* Draft creation */}
      <section className="rounded-2xl border border-[#E8E4E0] bg-white p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FBEFF1] text-[#A82B45]">
            <PenLine size={19} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#252326]">Create a content draft</h2>
            <p className="mt-1 text-sm text-[#89817E]">
              Start with a content angle and add the founder’s key insight.
            </p>
          </div>
        </div>

        <div className="mt-7 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#252326]">
              Selected content pillar
            </label>

            <div className="relative">
              <select
                value={selectedPillar}
                onChange={(event) => setSelectedPillar(event.target.value)}
                className="w-full appearance-none rounded-lg border border-[#E8E4E0] bg-[#FDFCFA] px-4 py-3 pr-10 text-sm text-[#252326] outline-none focus:border-[#A82B45]"
              >
                {pillars.map((pillar) => (
                  <option key={pillar.name} value={pillar.name}>
                    {pillar.name} — {pillar.category}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[#89817E]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#252326]">
              Content angle / working title
            </label>

            <input
              value={contentAngle}
              onChange={(event) => setContentAngle(event.target.value)}
              placeholder="e.g. What I learned from my first business failure"
              className="w-full rounded-lg border border-[#E8E4E0] bg-[#FDFCFA] px-4 py-3 text-sm text-[#252326] outline-none placeholder:text-[#B0A9A5] focus:border-[#A82B45]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#252326]">
              Founder insight / additional context
            </label>

            <textarea
              value={additionalContext}
              onChange={(event) => setAdditionalContext(event.target.value)}
              rows={5}
              placeholder="Add an insight from the founder's interview, a personal experience, an opinion, or a key point you want this post to communicate..."
              className="w-full resize-y rounded-lg border border-[#E8E4E0] bg-[#FDFCFA] px-4 py-3 text-sm leading-relaxed text-[#252326] outline-none placeholder:text-[#B0A9A5] focus:border-[#A82B45]"
            />
            <p className="mt-2 text-xs text-[#A39B98]">
              Use insights from the founder’s interview and Knowledge Vault.
            </p>
          </div>

          {showBrief && (
            <p className="text-sm text-[#A82B45]">
              Please add some founder insight or context before creating a draft.
            </p>
          )}

          <div className="flex flex-col justify-between gap-3 border-t border-[#F0ECE9] pt-5 sm:flex-row sm:items-center">
            <p className="text-xs text-[#A39B98]">Selected pillar: {selectedPillarData?.name}</p>

            <button
              type="button"
              onClick={createLocalDraft}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#A82B45] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#8F2038]"
            >
              <Plus size={16} />
              Add draft preview
            </button>
          </div>
        </div>
      </section>

      {/* Draft library */}
      <section>
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-lg font-semibold text-[#252326]">Content drafts</h2>
            <p className="mt-1 text-sm text-[#89817E]">
              Review and manage the content created for this founder.
            </p>
          </div>

          <span className="text-xs text-[#89817E]">{drafts.length} items</span>
        </div>

        <div className="space-y-3">
          {drafts.map((draft, index) => (
            <div
              key={`${draft.title}-${index}`}
              className="rounded-xl border border-[#E8E4E0] bg-white p-5"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-[#FBEFF1] px-2.5 py-1 text-[10px] font-semibold text-[#A82B45]">
                      {draft.pillar}
                    </span>

                    <span
                      className={`rounded-md px-2.5 py-1 text-[10px] font-semibold ${
                        draft.status === 'In Review'
                          ? 'bg-[#F5F0E8] text-[#927044]'
                          : 'bg-[#F0EFED] text-[#77716D]'
                      }`}
                    >
                      {draft.status}
                    </span>
                  </div>

                  <h3 className="leading-relaxed font-semibold text-[#252326]">{draft.title}</h3>

                  <p className="mt-2 text-sm leading-relaxed text-[#89817E]">{draft.excerpt}</p>

                  <p className="mt-4 flex items-center gap-1.5 text-xs text-[#A39B98]">
                    <Clock3 size={13} />
                    {draft.date}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPillar(draft.pillar)
                    setContentAngle(draft.title)
                    setAdditionalContext(draft.excerpt)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-[#A82B45] transition hover:text-[#8F2038]"
                >
                  Use as starting point
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Working principle */}
      <div className="flex items-start gap-3 rounded-xl border border-[#E8E4E0] bg-[#F7F6F3] p-5">
        <Lightbulb size={19} className="mt-0.5 shrink-0 text-[#A82B45]" />
        <div>
          <h3 className="text-sm font-semibold text-[#252326]">The Renegade content principle</h3>
          <p className="mt-1 text-sm leading-relaxed text-[#89817E]">
            AI should amplify the founder’s real experiences and perspectives. The operator remains
            responsible for reviewing, refining, and maintaining the founder’s authentic voice.
          </p>
        </div>
      </div>
    </div>
  )
}
