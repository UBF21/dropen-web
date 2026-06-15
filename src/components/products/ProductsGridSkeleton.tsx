import { Skeleton } from '@/components/ui/skeleton'

export default function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} data-testid="skeleton-card" className="flex flex-col gap-3">
          <Skeleton className="aspect-[3/4] w-full bg-surface" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4 bg-surface" />
            <Skeleton className="h-4 w-1/3 bg-surface" />
          </div>
        </div>
      ))}
    </div>
  )
}
