'use client'

import Link from 'next/link'
import { use } from 'react'
import { useState } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  Lightbulb,
  MessageSquare,
  Mic2,
  Upload,
  Users,
  ClipboardList,
  ArrowUpRight,
  Plus,
  Clock,
} from 'lucide-react'

export default function InterviewPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params)

  const [notes, setNotes] = useState('')
  const [transcriptName, setTranscriptName] = useState('')

  const interviewQuestions = [
    'What originally motivated you to start your business?',
    'What was one of the most difficult decisions you made as a founder?',
    'What is something you learned the hard way?',
    'What do you believe your industry gets wrong?',
    'How do you approach building and managing your team?',
    'What advice would you give someone starting in your industry?',
  ]

  const handleTranscriptUpload = (file: File | undefined) => {
    if (file) {
      setTranscriptName(file.name)
    }
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
              <Mic2 size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#252326]">
                Founder Interview
              </h1>
              <p className="mt-1 text-sm text-[#89817E]">
                Capture the founder&apos;s stories, experiences and perspectives.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#EAE5E3] bg-white px-4 py-2.5 text-sm font-medium text-[#252326] transition hover:bg-[#F8F6F5]"
          >
            <Plus size={16} />
            New session
          </button>
        </div>
      </div>

      {/* Session overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Sessions',
            value: '03',
            description: 'Interview sessions',
            icon: CalendarDays,
          },
          {
            label: 'Interview notes',
            value: '12',
            description: 'Notes captured',
            icon: ClipboardList,
          },
          {
            label: 'Insights',
            value: '24',
            description: 'Knowledge extracted',
            icon: Lightbulb,
          },
          {
            label: 'Transcript',
            value: '01',
            description: 'Uploaded transcript',
            icon: FileText,
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

      {/* Interview approach */}
      <div className="rounded-2xl border border-[#EAE5E3] bg-[#252326] p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-white/10 p-3">
            <MessageSquare size={22} />
          </div>
          <div>
            <h2 className="text-lg font-medium">The founder&apos;s voice comes first</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
              Renegade interviews are designed to uncover real experiences, opinions, decisions and
              lessons. The operator leads the conversation. AI will later help organize the
              transcript into useful knowledge, without replacing the founder&apos;s perspective.
            </p>
          </div>
        </div>
      </div>

      {/* Preparation and questions */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <div className="rounded-2xl border border-[#EAE5E3] bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[#252326]">Interview preparation</h2>
                <p className="mt-1 text-sm text-[#89817E]">
                  Suggested questions to guide the founder conversation.
                </p>
              </div>
              <div className="rounded-xl bg-[#F8F5F4] p-3 text-[#A82B45]">
                <Users size={20} />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {interviewQuestions.map((question, index) => (
                <div
                  key={question}
                  className="flex items-start gap-3 rounded-xl border border-[#F0ECEB] bg-[#FAF8F7] p-4"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-medium text-[#A82B45]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="pt-1 text-sm leading-6 text-[#494346]">{question}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#A82B45] transition hover:text-[#812036]"
            >
              <Plus size={16} />
              Add question
            </button>
          </div>

          {/* Interview notes */}
          <div className="rounded-2xl border border-[#EAE5E3] bg-white p-6">
            <div>
              <h2 className="text-lg font-semibold text-[#252326]">Interview notes</h2>
              <p className="mt-1 text-sm text-[#89817E]">
                Record important points during the interview.
              </p>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Capture important stories, memorable statements, observations or follow-up questions..."
              rows={7}
              className="mt-5 w-full resize-y rounded-xl border border-[#EAE5E3] bg-[#FAF8F7] p-4 text-sm leading-6 text-[#252326] transition outline-none focus:border-[#A82B45]"
            />

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs text-[#A39B98]">{notes.length} characters</p>
              <button
                type="button"
                onClick={() => setNotes('')}
                className="rounded-xl border border-[#EAE5E3] bg-white px-4 py-2 text-sm text-[#89817E] transition hover:bg-[#F8F6F5]"
              >
                Clear notes
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Session card */}
          <div className="rounded-2xl border border-[#EAE5E3] bg-white p-6">
            <h2 className="text-base font-semibold text-[#252326]">Session overview</h2>

            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#F8F5F4] p-3 text-[#A82B45]">
                  <CalendarDays size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#252326]">Interview session</p>
                  <p className="text-xs text-[#89817E]">Not scheduled</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#F8F5F4] p-3 text-[#A82B45]">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#252326]">Session duration</p>
                  <p className="text-xs text-[#89817E]">Not recorded</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#F8F5F4] p-3 text-[#A82B45]">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#252326]">Transcript status</p>
                  <p className="text-xs text-[#89817E]">Awaiting upload</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="mt-6 w-full rounded-xl bg-[#A82B45] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#8D233A]"
            >
              Schedule interview
            </button>
          </div>

          {/* Transcript upload */}
          <div className="rounded-2xl border border-[#EAE5E3] bg-white p-6">
            <h2 className="text-base font-semibold text-[#252326]">Transcript upload</h2>
            <p className="mt-1 text-sm leading-5 text-[#89817E]">
              Upload the interview transcript as a text file.
            </p>

            <label className="mt-5 flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-[#D9CFCC] bg-[#FAF8F7] px-5 py-8 text-center transition hover:border-[#A82B45]">
              <div className="rounded-xl bg-white p-3 text-[#A82B45]">
                <Upload size={22} />
              </div>
              <p className="mt-3 text-sm font-medium text-[#252326]">Choose transcript file</p>
              <p className="mt-1 text-xs text-[#89817E]">.txt file</p>
              <input
                type="file"
                accept=".txt,text/plain"
                className="hidden"
                onChange={(e) => handleTranscriptUpload(e.target.files?.[0])}
              />
            </label>

            {transcriptName && (
              <div className="mt-4 rounded-xl border border-[#EAE5E3] bg-white p-3">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-[#A82B45]" />
                  <p className="text-sm break-all text-[#252326]">{transcriptName}</p>
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={!transcriptName}
              className="mt-4 w-full rounded-xl border border-[#EAE5E3] bg-white px-4 py-3 text-sm font-medium text-[#252326] transition hover:bg-[#F8F6F5] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Process transcript
            </button>

            <p className="mt-3 text-xs leading-5 text-[#A39B98]">
              Transcript processing will be connected in a later integration phase.
            </p>
          </div>
        </div>
      </div>

      {/* Insight preview */}
      <div className="rounded-2xl border border-[#EAE5E3] bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#252326]">Extracted insights</h2>
            <p className="mt-1 text-sm text-[#89817E]">
              A preview of the knowledge extracted from interview conversations.
            </p>
          </div>
          <div className="rounded-xl bg-[#F8F5F4] p-3 text-[#A82B45]">
            <Lightbulb size={20} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              category: 'Founder Lesson',
              title: 'Learning through failure',
              content:
                'A failed project taught the founder the importance of validating ideas before investing resources.',
            },
            {
              category: 'Personal Story',
              title: 'Early business challenges',
              content:
                'The founder describes an early operational challenge that changed how the business was managed.',
            },
            {
              category: 'Industry Opinion',
              title: 'A different perspective',
              content:
                'An opinion about a common industry practice that the founder believes needs to change.',
            },
          ].map((insight) => (
            <div
              key={insight.title}
              className="rounded-xl border border-[#F0ECEB] bg-[#FAF8F7] p-5"
            >
              <span className="rounded-full bg-[#FBEFF1] px-3 py-1 text-xs font-medium text-[#A82B45]">
                {insight.category}
              </span>
              <h3 className="mt-4 text-sm font-semibold text-[#252326]">{insight.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#89817E]">{insight.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-[#EAE5E3] bg-[#FAF8F7] p-4">
          <p className="text-sm leading-6 text-[#89817E]">
            <span className="font-medium text-[#252326]">Prototype:</span> These insights are
            examples. Later, the AI pipeline will extract knowledge from uploaded transcripts, and
            the operator will review the results before they enter the Knowledge Vault.
          </p>
        </div>
      </div>

      {/* Interview history */}
      <div className="rounded-2xl border border-[#EAE5E3] bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#252326]">Interview history</h2>
            <p className="mt-1 text-sm text-[#89817E]">Previous sessions with this founder.</p>
          </div>
          <ArrowUpRight size={18} className="text-[#A39B98]" />
        </div>

        <div className="mt-6 rounded-xl border border-dashed border-[#EAE5E3] bg-[#FAF8F7] p-8 text-center">
          <CalendarDays size={22} className="mx-auto text-[#A39B98]" />
          <p className="mt-3 text-sm font-medium text-[#252326]">No interview sessions recorded</p>
          <p className="mt-2 text-sm text-[#89817E]">Completed sessions will appear here.</p>
        </div>
      </div>

      {/* Footer */}
      <div className="rounded-xl border border-[#EAE5E3] bg-[#FAF8F7] p-4">
        <p className="text-sm leading-6 text-[#89817E]">
          <span className="font-medium text-[#252326]">Interview workflow:</span> Operator
          preparation → Founder conversation → Transcript upload → Insight extraction → Operator
          review → Knowledge Vault.
        </p>
      </div>
    </div>
  )
}
