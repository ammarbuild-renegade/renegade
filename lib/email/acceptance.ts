import { Resend } from 'resend'

/**
 * Sends the acceptance email carrying the onboarding link.
 *
 * Throws on failure, deliberately. The caller catches it and still returns the
 * link so the operator can send it by hand - an email that silently failed
 * would otherwise strand a real client with no way forward.
 *
 * Note on the default sender: Resend's test address only delivers to the
 * address on the Resend account itself. Anyone else gets a 403 reading "You
 * can only send testing emails to your own email address." To reach real
 * clients, verify a domain in Resend and set RESEND_FROM to an address on it -
 * the from domain has to match the verified domain exactly.
 */
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
      'It is five quick screens and takes about ten minutes. There are no wrong answers, and you',
      'can skip anything you would rather talk through on our call:',
      '',
      opts.link,
      '',
      'This link is personal to you, works once, and expires in 14 days.',
      '',
      'Speak soon.',
    ].join('\n'),
  })

  if (error) throw new Error(error.message)
}
