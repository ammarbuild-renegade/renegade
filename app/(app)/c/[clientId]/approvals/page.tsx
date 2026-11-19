'use client'

import Link from 'next/link'
import { use } from 'react'
import { useState } from 'react'
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  Send,
  ShieldCheck,
  Eye,
} from 'lucide-react'

type Draft = {
  id: number
  title: string
  pillar: string
  status: 'Pending review' | 'Approved' | 'Changes requested'
  content: string
  feedback: string
}

const initialDrafts: Draft[] = [
  {
    id: 1,
    title: 'The lesson I learned from my first business failure',
    pillar: 'Founder Lessons',
    status: 'Pending review',
    content:
      'When I started my first business, I thought having a great idea was enough. I focused on building the product before truly understanding the people I was building it for.\n\nThat mistake cost us time and resources.\n\nOver time, I learned that the best ideas do not come from assumptions. They come from listening, asking better questions and understanding what customers actually need.\n\nToday, that lesson influences every decision I make.',
    feedback: '',
  },
  {
    id: 2,
    title: 'Why listening to customers changed our approach',
    pillar: 'Industry Insights',
    status: 'Pending review',
    content:
      'We used to think we knew exactly what our customers wanted.\n\nBut some of our biggest improvements came from conversations we almost never had.\n\nCustomer feedback changed how we prioritised features, approached problems and made decisions.\n\nSometimes, the answer is not another strategy meeting. It is simply listening.',
    feedback: '',
  },
  {
    id: 3,
    title: 'Building a team requires more than hiring',
    pillar: 'Business Philosophy',
    status: 'Approved',
    content:
      'Hiring talented people is only the beginning.\n\nA strong team needs clarity, trust, ownership and the freedom to make decisions.\n\nAs leaders, our responsibility is not to control every outcome. It is to create an environment where people can do their best work.',
    feedback: '',
  },
]

export default function ApprovalsPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params)

  const [drafts, setDrafts] = useState(initialDrafts)
  const [selectedDraftId, setSelectedDraftId] = useState(1)
  const [feedback, setFeedback] = useState('')
  const [filter, setFilter] = useState('All')

  const selectedDraft = drafts.find((draft) => draft.id === selectedDraftId)

  const pendingCount = drafts.filter((draft) => draft.status === 'Pending review').length

  const approvedCount = drafts.filter((draft) => draft.status === 'Approved').length

  const changesCount = drafts.filter((draft) => draft.status === 'Changes requested').length

  const filteredDrafts = drafts.filter((draft) => {
    if (filter === 'All') return true
    return draft.status === filter
  })

  const updateStatus = (id: number, status: Draft['status'], feedbackText = '') => {
    setDrafts((current) =>
      current.map((draft) =>
        draft.id === id ? { ...draft, status, feedback: feedbackText } : draft
      )
    )
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href={`/c/${clientId}`}
          className="inline-flex items-center gap-2 text-sm text-[#89817E] transition hover:text-[#252326]"
        >
          <ArrowLeft size={16} />
          Back to workspace
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FBEFF1] text-[#A82B45]">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#252326]">
                Content Approvals
              </h1>
              <p className="mt-1 text-sm text-[#89817E]">
                Review drafts, provide feedback and approve content.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: 'Pending review',
            value: pendingCount,
            description: 'Waiting for feedback',
            icon: Clock,
          },
          {
            label: 'Approved',
            value: approvedCount,
            description: 'Ready to move forward',
            icon: CheckCircle2,
          },
          {
            label: 'Changes requested',
            value: changesCount,
            description: 'Sent back for revisions',
            icon: MessageSquare,
          },
        ].map((stat) => {
          const Icon = stat.icon

          return (
            <div key={stat.label} className="rounded-2xl border border-[#EAE5E3] bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[#89817E]">{stat.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-[#252326]">{stat.value}</p>
                  <p className="mt-1 text-xs text-[#A39B98]">{stat.description}</p>
                </div>
                <div className="rounded-xl bg-[#F8F5F4] p-3 text-[#A82B45]">
                  <Icon size={20} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Intro banner */}
      <div className="rounded-2xl border border-[#EAE5E3] bg-[#252326] p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-white/10 p-3">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 className="text-lg font-medium">Your content. Your approval.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
              Every draft is reviewed before it moves forward. Read the content, share feedback or
              approve it. Renegade keeps the founder in control of what represents their personal
              brand.
            </p>
          </div>
        </div>
      </div>

      {/* Review workspace */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Draft list */}
        <div className="rounded-2xl border border-[#EAE5E3] bg-white p-5 xl:col-span-1">
          <div>
            <h2 className="text-lg font-semibold text-[#252326]">Review queue</h2>
            <p className="mt-1 text-sm text-[#89817E]">Select a draft to review.</p>
          </div>

          {/* Filters */}
          <div className="mt-5 flex flex-wrap gap-2">
            {['All', 'Pending review', 'Approved', 'Changes requested'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  filter === status
                    ? 'border-[#A82B45] bg-[#A82B45] text-white'
                    : 'border-[#EAE5E3] bg-white text-[#89817E] hover:text-[#252326]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            {filteredDrafts.map((draft) => (
              <button
                key={draft.id}
                type="button"
                onClick={() => {
                  setSelectedDraftId(draft.id)
                  setFeedback(draft.feedback)
                }}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  selectedDraftId === draft.id
                    ? 'border-[#D9B7BF] bg-[#FDF6F7]'
                    : 'border-[#EAE5E3] bg-white hover:bg-[#FAF8F7]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs text-[#89817E]">{draft.pillar}</span>
                  {draft.status === 'Approved' ? (
                    <CheckCircle2 size={16} className="text-[#6F8C77]" />
                  ) : draft.status === 'Changes requested' ? (
                    <MessageSquare size={16} className="text-[#A82B45]" />
                  ) : (
                    <Clock size={16} className="text-[#C18A45]" />
                  )}
                </div>

                <p className="mt-3 text-sm leading-5 font-medium text-[#252326]">{draft.title}</p>

                <span
                  className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs ${
                    draft.status === 'Approved'
                      ? 'bg-[#EDF4EE] text-[#56745D]'
                      : draft.status === 'Changes requested'
                        ? 'bg-[#FBEFF1] text-[#A82B45]'
                        : 'bg-[#F8F3E9] text-[#96713C]'
                  }`}
                >
                  {draft.status}
                </span>
              </button>
            ))}

            {filteredDrafts.length === 0 && (
              <div className="rounded-xl border border-dashed border-[#EAE5E3] p-6 text-center">
                <FileText size={20} className="mx-auto text-[#A39B98]" />
                <p className="mt-3 text-sm text-[#89817E]">No drafts in this category.</p>
              </div>
            )}
          </div>
        </div>

        {/* Selected draft */}
        <div className="space-y-6 xl:col-span-2">
          {selectedDraft ? (
            <>
              <div className="rounded-2xl border border-[#EAE5E3] bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-full bg-[#FBEFF1] px-3 py-1 text-xs font-medium text-[#A82B45]">
                    {selectedDraft.pillar}
                  </span>
                  <span className="text-xs text-[#89817E]">Draft #{selectedDraft.id}</span>
                </div>

                <h2 className="mt-5 text-xl leading-7 font-semibold text-[#252326]">
                  {selectedDraft.title}
                </h2>

                <div className="mt-6 rounded-xl border border-[#F0ECEB] bg-[#FAF8F7] p-5 text-sm leading-7 whitespace-pre-line text-[#494346]">
                  {selectedDraft.content}
                </div>

                <div className="mt-5 flex items-center gap-2 text-xs text-[#89817E]">
                  <Eye size={15} />
                  Content preview
                </div>
              </div>

              {/* Feedback */}
              <div className="rounded-2xl border border-[#EAE5E3] bg-white p-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-[#F8F5F4] p-3 text-[#A82B45]">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#252326]">Feedback</h2>
                    <p className="mt-1 text-sm text-[#89817E]">
                      Share any changes you&lsquo;d like to see.
                    </p>
                  </div>
                </div>

                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  placeholder="Write feedback, suggest edits or request changes..."
                  className="mt-5 w-full resize-y rounded-xl border border-[#EAE5E3] bg-[#FAF8F7] p-4 text-sm leading-6 text-[#252326] transition outline-none focus:border-[#A82B45]"
                />

                {selectedDraft.feedback && (
                  <div className="mt-4 rounded-xl border border-[#F0ECEB] bg-[#FAF8F7] p-4">
                    <p className="text-xs font-medium text-[#89817E]">
                      Previously submitted feedback
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#494346]">
                      {selectedDraft.feedback}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => updateStatus(selectedDraft.id, 'Changes requested', feedback)}
                    disabled={!feedback.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#EAE5E3] bg-white px-4 py-3 text-sm font-medium text-[#252326] transition hover:bg-[#F8F6F5] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Send size={16} />
                    Request changes
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateStatus(selectedDraft.id, 'Approved', feedback)
                      setFeedback('')
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#A82B45] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#8D233A]"
                  >
                    <Check size={16} />
                    Approve content
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#EAE5E3] bg-white p-12 text-center">
              <FileText size={24} className="mx-auto text-[#A39B98]" />
              <p className="mt-4 text-sm text-[#89817E]">Select a draft to review.</p>
            </div>
          )}
        </div>
      </div>

      {/* Approval history */}
      <div className="rounded-2xl border border-[#EAE5E3] bg-white p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-[#F8F5F4] p-3 text-[#A82B45]">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#252326]">Approval activity</h2>
            <p className="mt-1 text-sm text-[#89817E]">
              Current decisions across the review queue.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="flex flex-col gap-3 rounded-xl border border-[#F0ECEB] bg-[#FAF8F7] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-[#252326]">{draft.title}</p>
                <p className="mt-1 text-xs text-[#89817E]">{draft.pillar}</p>
              </div>

              <span
                className={`inline-flex w-fit rounded-full px-3 py-1 text-xs ${
                  draft.status === 'Approved'
                    ? 'bg-[#EDF4EE] text-[#56745D]'
                    : draft.status === 'Changes requested'
                      ? 'bg-[#FBEFF1] text-[#A82B45]'
                      : 'bg-[#F8F3E9] text-[#96713C]'
                }`}
              >
                {draft.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="rounded-xl border border-[#EAE5E3] bg-[#FAF8F7] p-4">
        <p className="text-sm leading-6 text-[#89817E]">
          <span className="font-medium text-[#252326]">Prototype:</span> Review actions currently
          update local page state. In the integration phase, approvals and feedback will be stored
          and associated with each client and content draft.
        </p>
      </div>
    </div>
  )
}
