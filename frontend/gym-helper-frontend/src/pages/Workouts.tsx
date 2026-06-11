import { Link } from '@tanstack/react-router'
import { ChevronRight, MapPin, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Alert, EmptyState, PageHeader, Skeleton, WorkoutCardSkeleton } from '../components'
import { useExercises } from '../hooks/useExercises'
import { useGyms } from '../hooks/useGyms'
import { useWorkouts } from '../hooks/useWorkouts'
import type { Workout } from '../types'

function formatDate(dateStr: string): { main: string; sub: string } {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.round((today.getTime() - d.getTime()) / 86_400_000)
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' })

  if (diffDays === 0) return { main: weekday, sub: 'Today' }
  if (diffDays <= 6) return { main: weekday, sub: `${diffDays}d ago` }

  const month = d.toLocaleDateString('en-US', { month: 'short' })
  return { main: weekday, sub: `${month} ${d.getDate()}` }
}

function WorkoutCard({
  workout,
  gymName,
  exerciseNames,
  onDelete,
}: {
  workout: Workout
  gymName: string | null
  exerciseNames: string[]
  onDelete: () => Promise<unknown>
}) {
  const { main, sub } = formatDate(workout.date)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const setCount = workout.sets.length
  const preview =
    exerciseNames.length > 3
      ? [...exerciseNames.slice(0, 3), `+${exerciseNames.length - 3} more`]
      : exerciseNames

  async function handleDelete() {
    setDeleting(true)
    try { await onDelete() } finally { setDeleting(false) }
  }

  return (
    <div className="glass glass-interactive flex items-center rounded-[14px]">
      <Link
        to="/workouts/$id"
        params={{ id: workout.id }}
        className="flex flex-1 items-center gap-4 px-4 py-3.5 min-w-0 active:scale-[0.99]"
      >
        <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-[10px] bg-(--code-bg) py-2.5 text-center">
          <span className="text-[15px] font-medium leading-tight text-(--text-h)">{main}</span>
          {sub && <span className="mt-0.5 text-[11px] text-(--text-muted)">{sub}</span>}
        </div>

        <div className="min-w-0 flex-1">
          {workout.notes && (
            <p className="mb-1 truncate text-[14px] font-medium text-(--text-h)">{workout.notes}</p>
          )}
          {gymName && (
            <div className="mb-1.5 flex items-center gap-1 text-[11px] text-(--text-muted)">
              <MapPin size={11} className="shrink-0" />
              <span className="truncate">{gymName}</span>
            </div>
          )}
          {preview.length > 0 ? (
            <p className="truncate text-[12px] text-(--text-muted)">{preview.join(' · ')}</p>
          ) : (
            <p className="text-[12px] text-(--text-muted)">No exercises logged</p>
          )}
          <p className="mt-1 text-[11px] text-(--accent)">
            {setCount} {setCount === 1 ? 'set' : 'sets'}
          </p>
        </div>

        <ChevronRight size={16} className="shrink-0 text-(--text-disabled)" />
      </Link>

      <div className="shrink-0 border-l border-(--border) px-3">
        {confirming ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setConfirming(false)}
              className="px-2 py-1 text-[11px] text-(--text-muted) hover:text-(--text)"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-red-500/15 px-2 py-1 text-[11px] font-medium text-red-400 hover:bg-red-500/25 disabled:opacity-50"
            >
              {deleting ? '…' : 'Delete'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="flex h-9 w-9 items-center justify-center text-(--text-disabled) transition-colors hover:text-red-400"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  )
}

export function WorkoutsPage() {
  const { workouts, loading: loadingWorkouts, error: errorWorkouts, deleteWorkout } = useWorkouts()
  const { gyms, loading: loadingGyms } = useGyms()
  const { exercises, loading: loadingExercises } = useExercises()

  const gymMap = useMemo(
    () => new Map(gyms.map(g => [g.id, g.name])),
    [gyms],
  )
  const exerciseMap = useMemo(
    () => new Map(exercises.map(e => [e.id, e.name])),
    [exercises],
  )

  const loading = loadingWorkouts || loadingGyms || loadingExercises

  const sorted = useMemo(
    () => [...workouts].sort((a, b) => {
      const dateDiff = b.date.localeCompare(a.date)
      if (dateDiff !== 0) return dateDiff
      return b.created_at.localeCompare(a.created_at)
    }),
    [workouts],
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-7 w-36 mb-6" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <WorkoutCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  if (errorWorkouts) {
    return <Alert variant="error">{errorWorkouts}</Alert>
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Workouts" />

      {sorted.length === 0 ? (
        <EmptyState
          title="No workouts yet"
          description="Tap the + button to log your first session."
        />
      ) : (
        <div className="space-y-2">
          {sorted.map(w => {
            const uniqueExerciseIds = [...new Set(w.sets.map(s => s.exercise_id))]
            const exerciseNames = uniqueExerciseIds
              .map(id => exerciseMap.get(id))
              .filter((n): n is string => Boolean(n))

            return (
              <WorkoutCard
                key={w.id}
                workout={w}
                gymName={w.gym_id ? (gymMap.get(w.gym_id) ?? null) : null}
                exerciseNames={exerciseNames}
                onDelete={() => deleteWorkout(w.id)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
