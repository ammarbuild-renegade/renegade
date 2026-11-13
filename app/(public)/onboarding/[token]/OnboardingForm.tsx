'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Answers = Record<string, string>

type Field = {
  key: string
  label: string
  help?: string
  input?: 'text'
}

const STEPS: { title: string; intro?: string; fields: Field[] }[] = [
  {
    title: 'Your audience',
    intro: 'Who are we trying to reach? The more specific, the better your content will land.',
    fields: [
      {
        key: 'audience_who',
        label: 'Who do you MOST want to reach on LinkedIn?',
        help: 'Think about the person who would DM you and say "I need your help."',
      },
      {
        key: 'audience_titles',
        label: "What's their job title?",
        help: 'List a few. e.g. Executive Director, Founder, Marketing Manager, Ops Director.',
      },
      { key: 'audience_industry', label: 'What industry or space are they in?' },
      {
        key: 'audience_company_size',
        label: 'How big is their company?',
        help: 'e.g. 5–50 people, solo founder, 100+ employees.',
      },
      {
        key: 'audience_avoid',
        label: 'Who do you NOT want to attract?',
        help: 'Wrong-fit clients, industries, or types of people. Be blunt.',
      },
    ],
  },
  {
    title: 'What you sell',
    fields: [
      { key: 'offer', label: 'What do you sell, and to whom?' },
      { key: 'website', label: 'Your website', input: 'text' },
    ],
  },
  {
    title: 'Goals',
    intro: 'What does winning look like for you?',
    fields: [
      {
        key: 'goals_why_now',
        label: 'Why are you investing in your LinkedIn personal brand right now?',
        help: 'What happened or what changed that made this a priority?',
      },
      {
        key: 'goals_number_one',
        label: "What's the #1 thing you want LinkedIn to do for you?",
        help: 'e.g. get leads, build authority, grow network, recruit talent, get speaking gigs.',
      },
      {
        key: 'goals_success_90',
        label: 'How will you know this is working? What does success look like in 90 days?',
      },
    ],
  },
  {
    title: 'Guardrails',
    fields: [
      {
        key: 'guardrails_hated_words',
        label: 'Any words or phrases you HATE?',
        help: 'Things that make you cringe. Words that feel fake or overused.',
      },
      {
        key: 'guardrails_off_limits',
        label: 'Anything you absolutely do NOT want to post about?',
        help: 'Off-limits topics, personal stuff, politics, etc.',
      },
    ],
  },
]

const UPLOAD_AREAS = [
  {
    type: 'past_post',
    title: 'Your past posts',
    body: '5 to 10 of your own posts. Required. These teach the system how you actually write.',
    accept: '.txt,.md,.docx,.pdf',
  },
  {
    type: 'reference_post',
    title: 'Posts from creators you admire',
    body: 'Optional. Add the posts themselves, not just names — the system learns from the words, not the profile.',
    accept: '.txt,.md,.docx,.pdf',
  },
  {
    type: 'brand_kit',
    title: 'Brand kit',
    body: 'Optional. Logo, brand guidelines, photos — anything that is already you.',
    accept: '.txt,.md,.docx,.pdf,image/*',
  },
]

export function OnboardingForm({
  token,
  initialAnswers,
  bookingUrl,
}: {
  token: string
  initialAnswers: Answers
  bookingUrl: string | null
}) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>(initialAnswers)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploads, setUploads] = useState<Record<string, number>>({
    past_post: 0,
    reference_post: 0,
    brand_kit: 0,
  })
  const [uploadError, setUploadError] = useState<string | null>(null)

  function set(key: string, value: string) {
    setAnswers((current) => ({ ...current, [key]: value }))
  }

  async function save(final: boolean) {
    const response = await fetch(`/api/onboarding/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, final }),
    })

    if (!response.ok) {
      throw new Error('save failed')
    }
  }

  async function advance(final = false) {
    setBusy(true)
    setError(null)

    try {
      await save(final)
      setStep((current) => current + 1)
    } catch {
      setError('Could not save. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  async function upload(type: string, files: FileList | null) {
    if (!files || files.length === 0) return

    setUploadError(null)

    for (const file of Array.from(files)) {
      const form = new FormData()
      form.append('file', file)
      form.append('type', type)

      const response = await fetch(`/api/onboarding/${token}/upload`, {
        method: 'POST',
        body: form,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        setUploadError(data?.error ?? 'An upload failed. Please try again.')
        return
      }

      setUploads((current) => ({ ...current, [type]: (current[type] ?? 0) + 1 }))
    }
  }

  if (step === 0) {
    return (
      <div className="border-border rounded-lg border p-6">
        <h2 className="font-display mb-3 text-xl font-semibold">How this works</h2>

        <p className="mb-3 text-sm">
          This doc helps us understand YOU so we can build your LinkedIn presence the right way.
          There are no wrong answers. Write however you talk. The messier and more honest, the
          better.
        </p>

        <p className="mb-6 text-sm">
          If you get stuck on a question, just skip it. We&apos;ll figure it out together on our
          call.
        </p>

        <Button onClick={() => setStep(1)}>Let&apos;s start</Button>
      </div>
    )
  }

  if (step === 6) {
    return (
      <div className="border-border rounded-lg border border-dashed p-12 text-center">
        <h2 className="font-display mb-2 text-xl font-semibold">
          Thank you — that is everything we need
        </h2>

        <p className="text-muted-foreground mx-auto mb-6 max-w-sm text-sm">
          The last step is your first interview, where we go through your answers together.
        </p>

        {bookingUrl ? (
          <>
            <Button asChild>
              <a href={bookingUrl} target="_blank" rel="noreferrer">
                Book your first interview
              </a>
            </Button>

            <p className="text-muted-foreground mt-6 text-sm">
              Once you&apos;ve booked,{' '}
              <a href={`/onboarding/${token}/booked`} className="underline">
                click here
              </a>{' '}
              so we know.
            </p>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">
            Your operator will send you a booking link shortly.
          </p>
        )}
      </div>
    )
  }

  const isLastStep = step === 5
  const fields: Field[] = isLastStep
    ? [
        {
          key: 'logistics_contact',
          label: "What's the best way to reach you?",
          help: 'Slack, email, text, WhatsApp, etc.',
        },
      ]
    : STEPS[step - 1].fields

  return (
    <div className="border-border rounded-lg border p-6">
      <p className="text-muted-foreground mb-1 text-xs tracking-wide uppercase">Step {step} of 5</p>

      <h2 className="font-display mb-2 text-xl font-semibold">
        {isLastStep ? 'Logistics and uploads' : STEPS[step - 1].title}
      </h2>

      {!isLastStep && STEPS[step - 1].intro ? (
        <p className="text-muted-foreground mb-4 text-sm italic">{STEPS[step - 1].intro}</p>
      ) : null}

      <div className="flex flex-col gap-5">
        {fields.map((field) => (
          <div key={field.key} className="flex flex-col gap-1.5">
            <Label htmlFor={field.key}>{field.label}</Label>

            {field.help ? (
              <p className="text-muted-foreground text-sm italic">{field.help}</p>
            ) : null}

            {field.input === 'text' ? (
              <Input
                id={field.key}
                value={answers[field.key] ?? ''}
                onChange={(event) => set(field.key, event.target.value)}
              />
            ) : (
              <Textarea
                id={field.key}
                rows={3}
                value={answers[field.key] ?? ''}
                onChange={(event) => set(field.key, event.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      {isLastStep ? (
        <div className="mt-8 flex flex-col gap-6">
          {UPLOAD_AREAS.map((area) => (
            <div key={area.type} className="border-border rounded-lg border border-dashed p-4">
              <h3 className="font-medium">{area.title}</h3>
              <p className="text-muted-foreground mb-3 text-sm">{area.body}</p>

              <Input
                type="file"
                multiple
                accept={area.accept}
                onChange={(event) => upload(area.type, event.target.files)}
              />

              {uploads[area.type] > 0 ? (
                <p className="text-muted-foreground mt-2 text-sm">
                  {uploads[area.type]} file{uploads[area.type] === 1 ? '' : 's'} uploaded
                </p>
              ) : null}
            </div>
          ))}

          {uploadError ? <p className="text-destructive text-sm">{uploadError}</p> : null}

          <p className="text-muted-foreground text-sm">
            Add at least one of your own past posts before submitting — they are what the system
            learns your voice from.
          </p>
        </div>
      ) : null}

      {error ? <p className="text-destructive mt-4 text-sm">{error}</p> : null}

      <div className="mt-8 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep((current) => current - 1)}
          disabled={busy}
        >
          Back
        </Button>

        {isLastStep ? (
          <Button
            type="button"
            onClick={() => advance(true)}
            disabled={busy || uploads.past_post === 0}
          >
            {busy ? 'Submitting...' : 'Submit'}
          </Button>
        ) : (
          <Button type="button" onClick={() => advance()} disabled={busy}>
            {busy ? 'Saving...' : 'Continue'}
          </Button>
        )}
      </div>
    </div>
  )
}
