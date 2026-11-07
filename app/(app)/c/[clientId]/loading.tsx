import { Skeleton } from '@/components/ui/skeleton'

/**
 * Shown while the client workspace loads.
 *
 * Matches the header the layout renders - name on top, company beneath - so
 * the page does not shift when the real values arrive.
 */
export default function Loading() {
  return (
    <>
      <header className="mb-8">
        <Skeleton className="mb-2 h-8 w-64" />
        <Skeleton className="h-4 w-40" />
      </header>
      <Skeleton className="h-4 w-48" />
    </>
  )
}
