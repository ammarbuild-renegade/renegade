# Renegade — Figma Design Brief

For the Figma front-end demonstration.

**Read this first: the design system already exists.** Parts of Renegade are built and
deployed. Your job is not to invent a look — it is to **document the one that exists** and
extend it to the screens that are not built yet.

> If the Figma and the running app disagree, the Figma is wrong. A supervisor who opens both
> and sees two different products learns that the mockup was decorative.

---

## 1. Look at the real thing first

**Live app:** <https://renegade-eight.vercel.app>

| Page                    | URL       | Signed in? |
| ----------------------- | --------- | ---------- |
| Landing                 | `/`       | no         |
| Sign in                 | `/login`  | no         |
| Create operator account | `/signup` | no         |

The screens behind login — client list, add client, workspace with sidebar and client switcher
— need an account. **Ask Ammar for the test login** rather than making one.

Spend twenty minutes clicking around before you open Figma. The landing page in particular is
the visual reference: it already sets the type, the spacing and the restraint.

**Source of truth for tokens:** `app/globals.css` in the repo.

---

## 2. Brand

The identity is **restrained, editorial, and almost entirely neutral**, with one accent colour
used sparingly. It should read like a serious tool, not a marketing site.

### Colour

Everything except the accent is a pure neutral grey — no tint, no colour temperature.

**Accent — the only colour in the product**

| Token        | Light     | Dark      | Used for                                        |
| ------------ | --------- | --------- | ----------------------------------------------- |
| `brand`      | `#A82B45` | `#F0899E` | The wordmark tag, one or two accents per screen |
| `brand-soft` | `#FBEDF0` | `#331A22` | Tinted background behind a brand element        |
| `brand-line` | `#E9B9C4` | `#5C333D` | Hairline borders on brand elements              |

**Neutrals** — these are Tailwind's `neutral` scale, so you can pull them straight from any
Tailwind plugin:

| Token                            | Light     | Dark      | Used for                              |
| -------------------------------- | --------- | --------- | ------------------------------------- |
| `background`                     | `#FFFFFF` | `#0A0A0A` | Page                                  |
| `foreground`                     | `#0A0A0A` | `#FAFAFA` | Body text                             |
| `primary`                        | `#171717` | —         | Primary button fill                   |
| `primary-foreground`             | `#FAFAFA` | —         | Text on primary                       |
| `muted` / `secondary` / `accent` | `#F5F5F5` | —         | Subtle fills, hover states            |
| `muted-foreground`               | `#737373` | —         | Secondary text, captions, helper text |
| `border` / `input`               | `#E5E5E5` | —         | All hairlines and field borders       |
| `ring`                           | `#A1A1A1` | —         | Focus ring                            |
| `sidebar`                        | `#FAFAFA` | —         | Sidebar background                    |
| `destructive`                    | `#E7000B` | —         | Errors only                           |

> **Use the accent sparingly.** On the landing page it appears about five times in total. If a
> screen has more than two brand-coloured elements, something has gone wrong.

> **Design light mode first.** Dark values are listed because the tokens exist, but the app
> ships light and the demo will be shown light. Do dark only if you have time left over.

### Type

Three families, already loaded from Google Fonts:

| Role        | Font                 | Weights           | Where                                         |
| ----------- | -------------------- | ----------------- | --------------------------------------------- |
| **Display** | **Spectral** (serif) | 400, 600 + italic | Headings, the wordmark, page titles           |
| **Body**    | **Geist** (sans)     | 400, 500, 600     | Everything else                               |
| **Mono**    | **Geist Mono**       | 400               | Labels, tags, metadata, small caps-style text |

The serif/sans pairing is the identity. **A heading in the sans font looks wrong**, and that
exact bug has already appeared once in the built app.

Mono is used more than you would expect — small uppercase labels with wide letter-spacing
(`0.15em`–`0.18em`) are a recurring motif. Look at the landing page.

### Shape and spacing

- **Corner radius: 10px** base (`--radius: 0.625rem`). Buttons and inputs use it; cards use a
  slightly larger one. Nothing in the product is sharp-cornered or pill-shaped except status
  badges.
- **Borders over shadows.** The app uses 1px `#E5E5E5` hairlines almost everywhere and
  shadows almost nowhere. Do not add drop shadows to make things "pop".
- Spacing is Tailwind's 4px scale. Stick to multiples of 4.

---

## 3. One thing to fix, not copy

The built app has **drifted on type sizes**. In use right now: `text-sm`, `text-base`,
`text-lg`, `text-xl`, `text-2xl`, `text-4xl`, `text-5xl`, `text-xs`, plus one-off values
`10px`, `11px`, `11.5px`, `13px`, `15px` and `15.5px`.

`CLAUDE.md` requires **one type scale**. Five arbitrary sizes is not one scale.

**Define a clean scale in Figma and we will bring the code to it.** Something like:

| Step    | Size    | Use                   |
| ------- | ------- | --------------------- |
| Display | 36–48px | Landing hero only     |
| H1      | 24px    | Page titles           |
| H2      | 20px    | Section headings      |
| Body    | 15px    | Default               |
| Small   | 13px    | Helper text, captions |
| Micro   | 11px    | Mono labels, badges   |

Pick the real numbers yourself — the point is that there are six of them and no others. This
is the most useful thing the Figma can produce, because it is a decision the code currently
lacks.

---

## 4. Components

The app uses **shadcn/ui** on Radix, `radix-nova` style, with **Lucide** icons. Do not design
new components where one exists.

Already in the codebase: `button`, `input`, `label`, `card`, `badge`, `dialog`, `select`,
`skeleton`, `table`, `textarea`, `sonner` (toasts).

There is an official **shadcn/ui Figma community file** — start from it rather than drawing
buttons by hand. Use **Lucide** for every icon; do not mix icon sets.

---

## 5. Rules every screen must follow

From `CLAUDE.md`, non-negotiable:

1. **Empty states with a next action.** Never a blank panel. "No clients yet" plus a button
   that adds one. Design the empty state for every list.
2. **Skeleton loaders, never spinners.** A skeleton shaped like the content it replaces, so
   nothing jumps when data arrives.
3. **Error states that say what failed and what to do.** Not "Something went wrong".
4. **Every list needs three states:** empty, loading, loaded. Design all three.

> Most mockups show only the happy path with perfect data. Ours must not — these three states
> are a third of the actual product, and the supervisor will notice if they are missing.

---

## 6. Screens to design

### Already built — match them, do not redesign

Open the live app and reproduce these faithfully. Where you think something is wrong, note it
in a comment rather than silently changing it.

1. Landing page
2. Sign in
3. Create operator account
4. Client list — with its empty state
5. Add a client
6. Client workspace shell — sidebar, client switcher, header

### Not built yet — design these properly

This is where the real work is. Follow the system above.

7. **Public application form** (`/apply`) — the $5k qualifying form, plus its thank-you state
8. **Application queue** — the operator's list, sorted by fit score. Must show three different
   states per row: scored, **not scored yet**, and scoring failed. _Unscored is not zero_ —
   make them visually distinct
9. **Onboarding questionnaire** — a **stepped form**, one section per screen, five steps, with
   a progress indicator. See `docs/PHASE-2-BUILD.md` section 8.2 for the exact questions
10. **Onboarding complete** — with the "book your first interview" button
11. **Voice Card** — a prose voice sketch (200–300 words), a banned-structures list, and the
    gold set of posts. This is an _editable_ screen, not a read-only one
12. **Knowledge Vault** — insights extracted from an interview, each traceable to its source
13. **Post writer** — a draft with its hook, which pillar it belongs to, and the sources it
    came from
14. **Client review page** — what the client sees. They can edit the hook, leave feedback, and
    approve. **No regenerate button** — that is deliberate, do not add one
15. **Voice-match score** — a rubric with several components, not one number

Read `CLAUDE.md` before designing 11 to 15. Those screens have specific rules, and the Voice
Card in particular is prose rather than a form of fields — that is a deliberate product
decision and designing it as a settings panel would be wrong.

---

## 7. Deliverable

- One Figma file, pages split into **Design system** / **Built screens** / **New screens**
- Desktop first at **1440px**. The operator side is a desktop tool
- The client review page (14) and the onboarding form (9) should also have **mobile frames at
  375px** — clients will open those on a phone
- Colour and type styles defined as Figma **variables/styles**, not hand-typed hex

Share a view link with Ammar when the design system page is done, before building out the
screens. Faster to correct the foundations than fifteen finished screens.

---

## 8. If you are unsure

- **The live app wins** over anything in this document
- **`CLAUDE.md`** wins over your instinct about what a feature should do
- Ask before inventing a new component, a new colour, or a new type size

The bar is simple: someone should be able to look at the Figma and the running app and not be
able to tell which one came first.
