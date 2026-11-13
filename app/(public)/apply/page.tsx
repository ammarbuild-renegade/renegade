'use client'

import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function ApplyPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [website, setWebsite] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [revenue, setRevenue] = useState('')
  const [goal, setGoal] = useState('')
  const [about, setAbout] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          company: company || undefined,
          linkedin_url: linkedinUrl,
          monthly_revenue_usd: revenue,
          answers: {
            ...(website ? { website } : {}),
            goal,
            about,
          },
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setError(data?.error ?? 'Something went wrong. Please try again.')
        return
      }

      setSubmitted(true)
    } catch {
      setError('Could not reach the server. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <main className="mx-auto w-full max-w-2xl px-6 py-16">
        <h1 className="font-display text-2xl font-semibold">Thank you — your application is in</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Thanks for applying. We read every application ourselves and will reply by email if it
          looks like a good fit.
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold">Apply to work with us</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          A few quick questions about you and your LinkedIn goals. It takes about two minutes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full name</Label>
          <Input
            id="full_name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Jordan Reyes"
            required
            maxLength={120}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            maxLength={200}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Northbound Studio"
            maxLength={120}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Company website</Label>
          <Input
            id="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yourcompany.com"
            maxLength={300}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin_url">LinkedIn profile</Label>

          <Input
            id="linkedin_url"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://www.linkedin.com/in/you"
            maxLength={300}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="monthly_revenue_usd">Monthly revenue (USD)</Label>
          <Input
            id="monthly_revenue_usd"
            type="number"
            min={0}
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            placeholder="e.g. 8000"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="goal">What is the #1 thing you want LinkedIn to do for you?</Label>
          <Textarea
            id="goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. Get leads, build authority, grow my network…"
            rows={3}
            maxLength={2000}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="about">Tell us about your work — who do you help, and how?</Label>
          <Textarea
            id="about"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            rows={4}
            maxLength={2000}
          />
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button type="submit" disabled={submitting}>
          {submitting ? 'Sending…' : 'Submit application'}
        </Button>
      </form>
    </main>
  )
}
