import { Link } from '@tanstack/react-router'
import { ChevronRight, MapPin } from 'lucide-react'
import { useMemo } from 'react'
import { Alert, EmptyState, PageHeader, Spinner } from '../components'
import { useExercises } from '../hooks/useExercises'
import { useGyms } from '../hooks/useGyms'
import { useWorkouts } from '../hooks/useWorkouts'
import type { Workout } from '../types'

function formatDate(dateStr: string): { main: string; sub: string } {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  if (sameDay(d, today)) return { main: 'Today', sub: '' }
  if (sameDay(d, yesterday)) return { main: 'Yesterday', sub: '' }

  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' })
  const month = d.toLocaleDateString('en-US', { month: 'short' })
  const day = d.getDate()
  return { main: weekday, sub: `${month} ${day}` }
}

function WorkoutCard({
  workout,
  gymName,
  exerciseNames,
}: {
  workout: Workout
  gymName: string | null
  exerciseNames: string[]
}) {
  const { main, sub } = formatDate(workout.date)
  const setCount = workout.sets.length
  const preview =
    exerciseNames.length > 3
      ? [...exerciseNames.slice(0, 3), `+${exerciseNames.length - 3} more`]
      : exerciseNames

  return (
    <Link
      to="/workouts/$id"
      params={{ id: workout.id }}
      className="flex items-center gap-4 rounded-[14px] border border-(--border) bg-(--surface) px-4 py-3.5 transition-colors hover:border-(--accent-border) active:scale-[0.99]"
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
  )
}

export function WorkoutsPage() {
  const { workouts, loading: loadingWorkouts, error: errorWorkouts } = useWorkouts()
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
    () => [...workouts].sort((a, b) => b.date.localeCompare(a.date)),
    [workouts],
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spinner />
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
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
