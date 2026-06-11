import type { PR } from '../hooks/useWorkoutStats'

interface RecentPRsProps {
  prs: PR[]
}

export function RecentPRs({ prs }: RecentPRsProps) {
  if (prs.length === 0) return null

  return (
    <div className="glass rounded-[14px] px-4 py-4">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-(--text-muted)">Personal bests</p>
      <div className="space-y-3">
        {prs.map(pr => (
          <div key={pr.exerciseId} className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-medium text-(--text-h)">{pr.exerciseName}</p>
              {pr.muscleGroup && (
                <p className="text-[11px] text-(--text-muted)">{pr.muscleGroup}</p>
              )}
            </div>
            <div className="shrink-0 text-right">
              <span className="text-[15px] font-semibold text-(--accent)">{pr.weight} kg</span>
              {pr.reps && (
                <span className="ml-1.5 text-[12px] text-(--text-muted)">× {pr.reps}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
