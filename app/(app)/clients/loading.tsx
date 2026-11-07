import { Skeleton } from '@/components/ui/skeleton'

/**
 * Shown while the clients query runs.
 *
 * A file named loading.tsx is Next's Suspense fallback for this route. Without
 * one the page simply does not appear until the query finishes, which reads as
 * a frozen app rather than a loading one.
 *
 * Shaped like the real list so the layout does not jump when the rows arrive.
 */
export default function Loading() {
  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-9 w-28" />
      </div>

      <ul className="flex flex-col">
        {[0, 1, 2].map((i) => (
          <li key={i} className="border-border border-t px-2 py-4">
            <Skeleton className="mb-2 h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </li>
        ))}
      </ul>
    </>
  )
}
