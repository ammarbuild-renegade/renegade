/**
 * Placeholder landing page for Phase 0.
 *
 * It demonstrates rather than describes: a fragment of what the operator
 * actually records, beside what the client actually posts. The post shown is
 * real output from the Phase 0 generation spike, not sample copy.
 *
 * Phase 1 replaces this with the operator dashboard.
 */

const TRANSCRIPT = `...no, and that's the thing, right, nobody actually checks. So a journalist writes about you — good piece, names the product, all of it — and then the link goes to, er, to Amazon. Straight to the listing.

And the sale still happens! That's why nobody kicks off about it. The money comes in. But Amazon's taken their cut and you've got no customer data, nothing, and your affiliate programme sees none of it.

Then six months later someone's sat in a meeting going "why has affiliate gone flat"...`

const POST = `Your press coverage might be selling plenty of product.

Just not through your website.

A journalist writes about your brand, recommends the exact product, then links readers straight to the Amazon listing.

The sale still happens, so nobody kicks up a fuss.

But Amazon takes its margin. You get none of the customer data. And the affiliate programme gets no tracked revenue from coverage it should be benefiting from.

Lovely stuff. You've done the hard bit and handed the useful bit to Amazon.

Most brands have never actually checked how much of their editorial coverage does this. They see the articles, stick them in a press report and move on.

Meanwhile, the ecommerce team is wondering why affiliate has gone quiet.

Happy to point you at where to look.`

const FOUNDATION = [
  { label: 'Application', value: 'Next.js 16 · TypeScript · Tailwind' },
  { label: 'Database', value: 'PostgreSQL · row-level security enforced' },
  { label: 'AI layer', value: 'Two providers behind one interface' },
  { label: 'Deployment', value: 'A live URL for every pull request' },
]

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-24 sm:px-8">
      {/* ── mark ─────────────────────────────────────────────────────────── */}
      <header className="flex items-baseline gap-3 py-10">
        <span className="font-display text-xl font-semibold tracking-tight">Renegade</span>
        <span className="text-brand font-mono text-[10px] tracking-[0.18em] uppercase">
          FYP-1 ZapAsad
        </span>
      </header>

      {/* ── thesis ───────────────────────────────────────────────────────── */}
      <section className="border-border border-t pt-12 pb-14">
        <h1 className="font-display max-w-[19ch] text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
          The AI amplifies a human conversation.{' '}
          <em className="text-brand not-italic">It never replaces it.</em>
        </h1>

        <p className="text-muted-foreground mt-7 max-w-[62ch] text-base leading-relaxed sm:text-lg">
          A branding specialist interviews a founder — a real conversation, recorded. Renegade turns
          that transcript into LinkedIn posts written in the founder&rsquo;s own voice, built only
          from things they actually said. Two people approve every post before it goes anywhere.
        </p>
      </section>

      {/* ── the transformation ───────────────────────────────────────────── */}
      <section className="border-border border-t pt-12">
        <div className="grid gap-px overflow-hidden rounded-xl border lg:grid-cols-[1fr_auto_1fr]">
          {/* in */}
          <div className="bg-card p-6 sm:p-8">
            <div className="text-muted-foreground font-mono text-[10px] tracking-[0.15em] uppercase">
              What the operator records
            </div>
            <p className="text-muted-foreground/90 mt-5 font-mono text-[13px] leading-[1.75] whitespace-pre-wrap">
              {TRANSCRIPT}
            </p>
            <div className="text-muted-foreground mt-6 font-mono text-[11px]">
              spoken · unstructured · the substance
            </div>
          </div>

          {/* arrow */}
          <div className="bg-card flex items-center justify-center py-3 lg:w-16 lg:py-0">
            <div className="bg-background border-brand-line text-brand flex h-9 w-9 items-center justify-center rounded-full border">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="rotate-90 lg:rotate-0"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </div>
          </div>

          {/* out */}
          <div className="bg-card p-6 sm:p-8">
            <div className="text-brand font-mono text-[10px] tracking-[0.15em] uppercase">
              What the client posts
            </div>
            <p className="font-display mt-5 text-[15.5px] leading-[1.7] whitespace-pre-wrap">
              {POST}
            </p>
            <div className="text-muted-foreground mt-6 font-mono text-[11px]">
              their voice · nothing invented · approved twice
            </div>
          </div>
        </div>

        <p className="text-muted-foreground mt-4 max-w-[70ch] text-sm leading-relaxed">
          Real output from the Phase&nbsp;0 generation test, written from a real client&rsquo;s
          voice profile. No figures appear in it because none were supplied — the system does not
          invent them.
        </p>
      </section>

      {/* ── foundation ───────────────────────────────────────────────────── */}
      <section className="border-border mt-16 border-t pt-12">
        <div className="flex items-baseline gap-3">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Phase 0 — foundation
          </h2>
          <span className="border-brand-line bg-brand-soft text-brand rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-[0.1em] uppercase">
            Live
          </span>
        </div>

        <p className="text-muted-foreground mt-3 max-w-[60ch] text-[15px]">
          Two weeks with no features, on purpose — proving the approach works and building what lets
          four people develop in parallel without breaking each other.
        </p>

        <dl className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2">
          {FOUNDATION.map((item) => (
            <div key={item.label} className="border-border border-t pt-4">
              <dt className="text-muted-foreground font-mono text-[10px] tracking-[0.15em] uppercase">
                {item.label}
              </dt>
              <dd className="mt-1.5 text-[15px]">{item.value}</dd>
            </div>
          ))}
        </dl>

        <p className="text-muted-foreground mt-10 font-mono text-[11.5px]">
          Next: Phase 1 — operator workspace, client records, access control.
        </p>
      </section>
    </main>
  )
}
