## What this changes

<!-- One or two sentences. What does this do that the app could not do before? -->

## How to test it

<!-- The preview URL, plus the exact steps a reviewer should click through.
     "Open /apply, submit the form, check the row appears in /applications" -->

## Checklist

- [ ] Migration committed and `types/database.ts` regenerated
- [ ] RLS policy written, and the negative test passes
- [ ] API input **and** model output validated with Zod
- [ ] Screen has empty, loading and error states
- [ ] Works on the Vercel preview URL, not just locally
- [ ] Non-obvious decisions recorded in `DECISIONS.md`

<!-- Not every box applies to every PR. Strike through the ones that do not
     (~~like this~~) rather than silently leaving them unticked, so the
     reviewer can tell "not applicable" from "forgot". -->
