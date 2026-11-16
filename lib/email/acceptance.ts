import { Resend } from 'resend'

export async function sendAcceptanceEmail(opts: { to: string; name: string; link: string }) {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set')

  const resend = new Resend(key)

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM ?? 'Renegade <onboarding@resend.dev>',
    to: opts.to,
    subject: 'You are in — next step for your LinkedIn presence',
    text: [
      `Hi ${opts.name},`,
      '',
      'Good news — we would like to work with you.',
      '',
      'The next step is a short questionnaire about your audience, your voice and your goals.',
      'It takes about fifteen minutes, and there are no wrong answers:',
      '',
      opts.link,
      '',
      'This link is personal to you and expires in 14 days.',
    ].join('\n'),
  })

  if (error) throw new Error(error.message)
}
