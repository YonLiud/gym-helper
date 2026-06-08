import { cn } from '../lib/cn'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton rounded-[10px]', className)} />
}

export function WorkoutCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-[14px] border border-(--border) bg-(--surface) px-4 py-3.5">
      <Skeleton className="h-14 w-14 shrink-0 rounded-[10px]" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}

export function ExerciseGroupSkeleton() {
  return (
    <div className="rounded-[14px] border border-(--border) bg-(--surface) overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-6" />
      </div>
    </div>
  )
}

export function GymCardSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-[14px] border border-(--border) bg-(--surface) p-4">
      <Skeleton className="mt-0.5 h-4 w-4 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}
