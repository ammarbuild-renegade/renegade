'use client'

import Link from 'next/link'
import { use } from 'react'
import {
  ArrowLeft,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Mic2,
  PenLine,
  Sparkles,
  Target,
  UserRound,
} from 'lucide-react'

export default function BrandProfilePage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params)

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
            <p className="text-sm font-medium text-[#A82B45]">Brand foundation</p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#252326]">
              Brand Profile
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#89817E]">
              Understand the founder’s identity, communication style, positioning, and strategic
              direction.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-[#E8E4E0] bg-white px-3 py-2 text-xs text-[#89817E]">
            <Sparkles size={14} className="text-[#A82B45]" />
            Brand foundation
          </div>
        </div>
      </div>

      {/* Profile overview */}
      <section className="rounded-2xl border border-[#E8E4E0] bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#FBEFF1] text-[#A82B45]">
            <UserRound size={28} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold text-[#252326]">Founder Brand Overview</h2>

              <span className="rounded-md bg-[#F0EFED] px-2.5 py-1 text-[10px] font-semibold text-[#77716D]">
                Sample profile
              </span>
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#89817E]">
              This profile represents the foundation from which the founder’s LinkedIn content
              strategy, voice, and positioning will be developed.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-[#E8E4E0] px-3 py-2 text-xs text-[#89817E]">
                <BriefcaseBusiness size={14} />
                Business identity
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-[#E8E4E0] px-3 py-2 text-xs text-[#89817E]">
                <BookOpen size={14} />
                Brand foundation
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Foundation status */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[#252326]">Brand foundation</h2>
          <p className="mt-1 text-sm text-[#89817E]">
            The essential elements that shape the founder’s personal brand.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {/* Voice Card */}
          <div className="rounded-xl border border-[#E8E4E0] bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FBEFF1] text-[#A82B45]">
                <Mic2 size={19} />
              </div>

              <span className="text-[10px] font-semibold tracking-wider text-[#A39B98] uppercase">
                Communication
              </span>
            </div>

            <h3 className="mt-5 font-semibold text-[#252326]">Voice Card</h3>

            <p className="mt-2 text-sm leading-relaxed text-[#89817E]">
              Defines how the founder communicates, writes, expresses opinions, and connects with
              their audience.
            </p>

            <div className="mt-5 flex items-center gap-2 text-xs text-[#A39B98]">
              <CheckCircle2 size={14} />
              Foundation component
            </div>
          </div>

          {/* Blueprint */}
          <div className="rounded-xl border border-[#E8E4E0] bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FBEFF1] text-[#A82B45]">
                <Target size={19} />
              </div>

              <span className="text-[10px] font-semibold tracking-wider text-[#A39B98] uppercase">
                Positioning
              </span>
            </div>

            <h3 className="mt-5 font-semibold text-[#252326]">Personal Brand Blueprint</h3>

            <p className="mt-2 text-sm leading-relaxed text-[#89817E]">
              Establishes positioning, audience, differentiators, goals, and the strategic direction
              of the brand.
            </p>

            <div className="mt-5 flex items-center gap-2 text-xs text-[#A39B98]">
              <CheckCircle2 size={14} />
              Foundation component
            </div>
          </div>

          {/* R3 Strategy */}
          <div className="rounded-xl border border-[#E8E4E0] bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FBEFF1] text-[#A82B45]">
                <Sparkles size={19} />
              </div>

              <span className="text-[10px] font-semibold tracking-wider text-[#A39B98] uppercase">
                Content strategy
              </span>
            </div>

            <h3 className="mt-5 font-semibold text-[#252326]">R3 Strategy</h3>

            <p className="mt-2 text-sm leading-relaxed text-[#89817E]">
              Defines the strategic content pillars across Reach, Resonance, and Revenue.
            </p>

            <div className="mt-5 flex items-center gap-2 text-xs text-[#A39B98]">
              <CheckCircle2 size={14} />
              Foundation component
            </div>
          </div>
        </div>
      </section>

      {/* Voice card details */}
      <section className="rounded-2xl border border-[#E8E4E0] bg-white p-6 sm:p-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FBEFF1] text-[#A82B45]">
            <Mic2 size={19} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#252326]">Voice Card</h2>
            <p className="text-sm text-[#89817E]">The founder’s written personality.</p>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <label className="text-xs font-semibold tracking-wider text-[#A39B98] uppercase">
              Voice sketch
            </label>

            <div className="mt-3 rounded-xl bg-[#F7F6F3] p-5">
              <p className="text-sm leading-7 text-[#625D5A]">
                This founder communicates with clarity and conviction. Their writing feels
                conversational, thoughtful, and grounded in personal experience rather than abstract
                theory. They prefer practical observations, direct opinions, and stories that
                connect business lessons with real situations. Their voice should feel natural and
                confident without sounding overly polished, promotional, or artificial.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold tracking-wider text-[#A39B98] uppercase">
                Post length preference
              </label>

              <div className="mt-3 rounded-lg border border-[#E8E4E0] px-4 py-3 text-sm text-[#252326]">
                Medium-length posts
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold tracking-wider text-[#A39B98] uppercase">
                Emoji policy
              </label>

              <div className="mt-3 rounded-lg border border-[#E8E4E0] px-4 py-3 text-sm text-[#252326]">
                Minimal emoji usage
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold tracking-wider text-[#A39B98] uppercase">
              Writing restrictions
            </label>

            <div className="mt-3 rounded-xl border border-[#E8E4E0] p-5">
              <ul className="space-y-3 text-sm text-[#89817E]">
                <li className="flex gap-2">
                  <span className="text-[#A82B45]">•</span>
                  Avoid generic motivational statements.
                </li>
                <li className="flex gap-2">
                  <span className="text-[#A82B45]">•</span>
                  Avoid exaggerated claims and artificial enthusiasm.
                </li>
                <li className="flex gap-2">
                  <span className="text-[#A82B45]">•</span>
                  Avoid unnecessarily formal corporate language.
                </li>
                <li className="flex gap-2">
                  <span className="text-[#A82B45]">•</span>
                  Avoid repetitive hooks and predictable post structures.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Blueprint details */}
      <section className="rounded-2xl border border-[#E8E4E0] bg-white p-6 sm:p-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FBEFF1] text-[#A82B45]">
            <Target size={19} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#252326]">Personal Brand Blueprint</h2>
            <p className="text-sm text-[#89817E]">
              The strategic foundation of the founder’s brand.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold tracking-wider text-[#A39B98] uppercase">
              Brand positioning
            </label>

            <div className="mt-3 rounded-xl bg-[#F7F6F3] p-5">
              <p className="text-sm leading-relaxed text-[#625D5A]">
                A practical, experience-driven business leader sharing insights, lessons, and
                perspectives that help others navigate real business challenges.
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold tracking-wider text-[#A39B98] uppercase">
              Target audience
            </label>

            <div className="mt-3 rounded-xl bg-[#F7F6F3] p-5">
              <p className="text-sm leading-relaxed text-[#625D5A]">
                Entrepreneurs, business owners, professionals, and people interested in practical
                business insights and leadership.
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold tracking-wider text-[#A39B98] uppercase">
              Differentiator
            </label>

            <div className="mt-3 rounded-xl bg-[#F7F6F3] p-5">
              <p className="text-sm leading-relaxed text-[#625D5A]">
                Real experiences and honest perspectives instead of generic advice or surface-level
                business content.
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold tracking-wider text-[#A39B98] uppercase">
              Brand objective
            </label>

            <div className="mt-3 rounded-xl bg-[#F7F6F3] p-5">
              <p className="text-sm leading-relaxed text-[#625D5A]">
                Build credibility, develop meaningful professional relationships, and create a
                recognizable personal brand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* R3 pillars */}
      <section className="rounded-2xl border border-[#E8E4E0] bg-white p-6 sm:p-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FBEFF1] text-[#A82B45]">
            <Sparkles size={19} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#252326]">R3 Content Strategy</h2>
            <p className="text-sm text-[#89817E]">
              Strategic directions for the founder’s content.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[#E8E4E0] p-5">
            <span className="rounded-md bg-[#F0EFED] px-2.5 py-1 text-[10px] font-semibold text-[#77716D]">
              REACH
            </span>

            <h3 className="mt-4 font-semibold text-[#252326]">Industry insights</h3>

            <p className="mt-2 text-sm leading-relaxed text-[#89817E]">
              Share industry observations, emerging perspectives, and ideas that attract a wider
              professional audience.
            </p>
          </div>

          <div className="rounded-xl border border-[#E8E4E0] p-5">
            <span className="rounded-md bg-[#FBEFF1] px-2.5 py-1 text-[10px] font-semibold text-[#A82B45]">
              RESONANCE
            </span>

            <h3 className="mt-4 font-semibold text-[#252326]">Founder lessons</h3>

            <p className="mt-2 text-sm leading-relaxed text-[#89817E]">
              Share personal stories, lessons, experiences, and opinions that build genuine
              connection.
            </p>
          </div>

          <div className="rounded-xl border border-[#E8E4E0] p-5">
            <span className="rounded-md bg-[#F5F0E8] px-2.5 py-1 text-[10px] font-semibold text-[#927044]">
              REVENUE
            </span>

            <h3 className="mt-4 font-semibold text-[#252326]">Business philosophy</h3>

            <p className="mt-2 text-sm leading-relaxed text-[#89817E]">
              Communicate expertise, business approaches, and perspectives connected to the
              founder’s business.
            </p>
          </div>
        </div>
      </section>

      {/* Sources */}
      <section className="rounded-2xl border border-[#E8E4E0] bg-white p-6 sm:p-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FBEFF1] text-[#A82B45]">
            <FileText size={19} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#252326]">Brand foundation sources</h2>
            <p className="text-sm text-[#89817E]">
              Information used to develop the founder’s brand foundation.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {[
            {
              title: 'Founder questionnaire',
              description: 'Business, goals, audience, and personal perspectives',
            },
            {
              title: 'Past LinkedIn posts',
              description: 'Writing style and voice reference',
            },
            {
              title: 'Reference posts',
              description: 'Creative direction and content inspiration',
            },
            {
              title: 'Founder interview',
              description: 'Experiences, insights, opinions, and knowledge',
            },
          ].map((source) => (
            <div
              key={source.title}
              className="flex items-center gap-3 rounded-xl border border-[#E8E4E0] p-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F7F6F3] text-[#89817E]">
                <FileText size={16} />
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-medium text-[#252326]">{source.title}</h3>
                <p className="mt-1 text-xs text-[#89817E]">{source.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer note */}
      <div className="flex items-start gap-3 rounded-xl border border-[#E8E4E0] bg-[#F7F6F3] p-5">
        <PenLine size={19} className="mt-0.5 shrink-0 text-[#A82B45]" />

        <div>
          <h3 className="text-sm font-semibold text-[#252326]">Brand foundation evolves</h3>

          <p className="mt-1 text-sm leading-relaxed text-[#89817E]">
            The Voice Card, Blueprint, and content pillars should evolve as more founder
            conversations, feedback, and experiences are collected. This is a working foundation,
            not a fixed identity.
          </p>
        </div>
      </div>
    </div>
  )
}
