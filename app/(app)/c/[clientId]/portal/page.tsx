'use client'

import Link from 'next/link'
import { use } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  MessageSquare,
  Sparkles,
  UserRound,
} from 'lucide-react'

export default function FounderPortalPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params)

  const drafts = [
    {
      title: 'What building a business taught me about patience',
      pillar: 'Founder Lessons',
      status: 'Approved',
      date: 'Nov 18',
    },
    {
      title: 'Why customer feedback changed our approach',
      pillar: 'Business Philosophy',
      status: 'In Review',
      date: 'Nov 19',
    },
    {
      title: "The decisions founders don't talk about",
      pillar: 'Leadership',
      status: 'Draft',
      date: 'Nov 20',
    },
  ]

  const stats = [
    { label: 'Content drafts', value: '3', icon: FileText },
    { label: 'Awaiting your review', value: '1', icon: Clock3 },
    { label: 'Approved posts', value: '1', icon: CheckCircle2 },
  ]

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#A82B45]">Founder Portal</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#252326]">
            Your brand workspace
          </h1>
          <p className="mt-2 text-sm text-[#89817E]">
            Your ideas, content and personal brand — all in one place.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-[#EAE5E3] bg-white px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FBEFF1]">
            <UserRound className="h-4 w-4 text-[#A82B45]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#252326]">Founder workspace</p>
            <p className="text-xs text-[#89817E]">Personal brand overview</p>
          </div>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="overflow-hidden rounded-2xl bg-[#252326] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-[#E8B7C1]">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-medium tracking-wide">YOUR PERSONAL BRAND</span>
            </div>

            <h2 className="mt-3 text-2xl font-semibold text-white">
              Your ideas. Your voice. Your story.
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#C5C0C3]">
              Review your content, share feedback and stay involved in building your personal brand.
            </p>
          </div>

          <Link
            href={`/c/${clientId}/approvals`}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#A82B45] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#92233B]"
          >
            Review content
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <div key={stat.label} className="rounded-2xl border border-[#EAE5E3] bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#89817E]">{stat.label}</p>
                <Icon className="h-4 w-4 text-[#A82B45]" />
              </div>

              <p className="mt-4 text-3xl font-semibold text-[#252326]">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Drafts */}
        <div className="rounded-2xl border border-[#EAE5E3] bg-white">
          <div className="flex items-center justify-between border-b border-[#F0ECEB] p-5">
            <div>
              <h2 className="font-semibold text-[#252326]">Your content</h2>
              <p className="mt-1 text-xs text-[#89817E]">Recent content activity</p>
            </div>

            <Link
              href={`/c/${clientId}/content-studio`}
              className="text-sm font-medium text-[#A82B45] hover:underline"
            >
              View studio
            </Link>
          </div>

          <div className="divide-y divide-[#F0ECEB]">
            {drafts.map((draft) => (
              <div key={draft.title} className="p-5 transition hover:bg-[#FCFAF9]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="max-w-md">
                    <h3 className="text-sm leading-6 font-medium text-[#252326]">{draft.title}</h3>

                    <p className="mt-2 text-xs text-[#89817E]">
                      {draft.pillar} · {draft.date}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                      draft.status === 'Approved'
                        ? 'bg-[#EAF5EE] text-[#397451]'
                        : draft.status === 'In Review'
                          ? 'bg-[#FBEFF1] text-[#A82B45]'
                          : 'bg-[#F2F0EF] text-[#77716E]'
                    }`}
                  >
                    {draft.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[#F0ECEB] p-5">
            <Link
              href={`/c/${clientId}/content-studio`}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#A82B45] hover:underline"
            >
              Explore your content
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Review */}
        <div className="rounded-2xl border border-[#EAE5E3] bg-white">
          <div className="border-b border-[#F0ECEB] p-5">
            <h2 className="font-semibold text-[#252326]">Review & feedback</h2>
            <p className="mt-1 text-xs text-[#89817E]">Your input shapes the final content</p>
          </div>

          <div className="p-5">
            <div className="flex items-start gap-3 rounded-xl bg-[#FBEFF1] p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
                <Clock3 className="h-4 w-4 text-[#A82B45]" />
              </div>

              <div>
                <p className="text-sm font-medium text-[#252326]">1 post needs your attention</p>
                <p className="mt-1 text-xs leading-5 text-[#89817E]">
                  Review the content and share your feedback before it is finalized.
                </p>
              </div>
            </div>

            <Link
              href={`/c/${clientId}/approvals`}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#A82B45] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#92233B]"
            >
              Open approvals
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="mt-5 border-t border-[#F0ECEB] pt-5">
              <div className="flex items-start gap-3">
                <MessageSquare className="mt-1 h-4 w-4 text-[#89817E]" />
                <div>
                  <p className="text-sm font-medium text-[#252326]">Your feedback matters</p>
                  <p className="mt-1 text-xs leading-5 text-[#89817E]">
                    Request edits, approve posts or share your thoughts with your content operator.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Foundation */}
      <div className="rounded-2xl border border-[#EAE5E3] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#F0ECEB] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-[#252326]">Your brand foundation</h2>
            <p className="mt-1 text-xs text-[#89817E]">
              The foundation behind your content strategy
            </p>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Link
            href={`/c/${clientId}/brand-profile`}
            className="group rounded-xl border border-[#EAE5E3] p-5 transition hover:border-[#D9A2AE] hover:bg-[#FCFAF9]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FBEFF1]">
              <UserRound className="h-5 w-5 text-[#A82B45]" />
            </div>

            <h3 className="mt-4 text-sm font-medium text-[#252326]">Brand profile</h3>

            <p className="mt-2 text-xs leading-5 text-[#89817E]">
              Your positioning, voice, audience and brand identity.
            </p>

            <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-[#A82B45]">
              View profile
              <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            href={`/c/${clientId}/knowledge-vault`}
            className="group rounded-xl border border-[#EAE5E3] p-5 transition hover:border-[#D9A2AE] hover:bg-[#FCFAF9]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FBEFF1]">
              <FileText className="h-5 w-5 text-[#A82B45]" />
            </div>

            <h3 className="mt-4 text-sm font-medium text-[#252326]">Knowledge vault</h3>

            <p className="mt-2 text-xs leading-5 text-[#89817E]">
              Your stories, insights, ideas and experiences.
            </p>

            <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-[#A82B45]">
              Explore knowledge
              <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="rounded-2xl border border-[#EAE5E3] bg-[#FCFAF9] p-5">
        <p className="text-sm font-medium text-[#252326]">
          Your personal brand is a work in progress.
        </p>
        <p className="mt-2 text-xs leading-5 text-[#89817E]">
          Renegade helps transform your experiences, ideas and expertise into meaningful content
          while keeping your voice and perspective at the center.
        </p>
      </div>
    </div>
  )
}
