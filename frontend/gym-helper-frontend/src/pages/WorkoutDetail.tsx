import { useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Select, Spinner } from '../components'
import { useExercises } from '../hooks/useExercises'
import { useWorkout, useWorkouts } from '../hooks/useWorkouts'
import type { WorkoutSet } from '../types'

function fmtDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  if (sameDay(d, today)) return 'Today'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function SetRow({ set, onDelete }: { set: WorkoutSet; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-(--code-bg) px-4 py-2.5">
      <span className="flex-1 text-sm text-(--text-h)">
        {set.weight != null ? `${set.weight} kg` : 'BW'}
        {set.reps != null && <span className="text-(--text)"> × {set.reps}</span>}
      </span>
      <button
        onClick={onDelete}
        className="text-(--text) transition-colors hover:text-red-500"
      >
        <Trash2 size={15} />
      </button>
    </div>
  )
}

type View = 'logger' | 'overview'

export function WorkoutDetailPage() {
  const { id } = useParams({ from: '/workouts/$id' })
  const navigate = useNavigate()

  const { workout, loading, error, addSet, deleteSet } = useWorkout(id)
  const { exercises } = useExercises()
  const { workouts } = useWorkouts()

  const [view, setView] = useState<View | null>(null)
  const [exerciseId, setExerciseId] = useState('')
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  // Set initial view once workout loads
  useEffect(() => {
    if (workout && view === null) {
      setView(workout.sets.length === 0 ? 'logger' : 'overview')
    }
  }, [workout, view])

  const exerciseMap = useMemo(
    () => new Map(exercises.map(e => [e.id, e])),
    [exercises],
  )

  // Previous performance: most recent OTHER workout with sets for this exercise
  const prevPerformance = useMemo(() => {
    if (!exerciseId || !workout) return null
    const match = [...workouts]
      .filter(w => w.id !== workout.id && w.sets.some(s => s.exercise_id === exerciseId))
      .sort((a, b) => b.date.localeCompare(a.date))[0]
    if (!match) return null
    return {
      date: match.date,
      sets: match.sets.filter(s => s.exercise_id === exerciseId).sort((a, b) => a.order - b.order),
    }
  }, [exerciseId, workout, workouts])

  // Sets for the selected exercise in this workout
  const currentExerciseSets = useMemo(() => {
    if (!exerciseId || !workout) return []
    return workout.sets
      .filter(s => s.exercise_id === exerciseId)
      .sort((a, b) => a.order - b.order)
  }, [exerciseId, workout])

  // Exercises grouped in this workout (for overview)
  const exerciseGroups = useMemo(() => {
    if (!workout) return []
    const map = new Map<string, WorkoutSet[]>()
    for (const s of workout.sets) {
      const arr = map.get(s.exercise_id) ?? []
      arr.push(s)
      map.set(s.exercise_id, arr)
    }
    return [...map.entries()].map(([exId, sets]) => ({
      exId,
      name: exerciseMap.get(exId)?.name ?? 'Unknown exercise',
      sets: sets.sort((a, b) => a.order - b.order),
    }))
  }, [workout, exerciseMap])

  async function handleAddSet(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!exerciseId || !workout) return
    if (!reps) return
    setAdding(true)
    setAddError(null)
    try {
      await addSet({
        exercise_id: exerciseId,
        order: workout.sets.length,
        weight: weight ? parseFloat(weight) : null,
        reps: reps ? parseInt(reps, 10) : null,
      })
      setWeight('')
      setReps('')
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add set')
    } finally {
      setAdding(false)
    }
  }

  function openLoggerForExercise(preselectedId?: string) {
    setExerciseId(preselectedId ?? '')
    setWeight('')
    setReps('')
    setAddError(null)
    setView('logger')
  }

  if (loading || view === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (error) return <Alert variant="error">{error}</Alert>
  if (!workout) return null

  const exerciseOptions = [...exercises]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(e => ({ value: e.id, label: e.name }))

  // ── Logger view ──────────────────────────────────────────────────────────────
  if (view === 'logger') {
    const selectedExercise = exerciseId ? exerciseMap.get(exerciseId) : null
    const canGoToOverview = workout.sets.length > 0

    return (
      <div className="mx-auto max-w-lg space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => canGoToOverview ? setView('overview') : navigate({ to: '/workouts' })}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-(--border) text-(--text) transition-colors hover:border-(--accent-border) hover:text-(--accent)"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-(--text-h)">{fmtDate(workout.date)}</p>
            {workout.notes && (
              <p className="truncate text-xs text-(--text)">{workout.notes}</p>
            )}
          </div>
        </div>

        {/* Exercise picker */}
        <Select
          label="Exercise"
          value={exerciseId}
          onChange={e => {
            setExerciseId(e.target.value)
            setWeight('')
            setReps('')
          }}
          options={exerciseOptions}
          placeholder="Pick an exercise…"
        />

        {selectedExercise && (
          <>
            {/* Previous performance */}
            {prevPerformance ? (
              <div className="rounded-2xl border border-(--border) p-4">
                <p className="mb-2.5 text-xs font-medium text-(--text)">
                  Last time · {fmtDate(prevPerformance.date)}
                </p>
                <div className="space-y-1.5">
                  {prevPerformance.sets.map((s, i) => (
                    <p key={s.id} className="text-sm text-(--text-h)">
                      <span className="text-(--text)">Set {i + 1} </span>
                      {s.weight != null ? `${s.weight} kg` : 'BW'}
                      {s.reps != null && ` × ${s.reps}`}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-(--text)">No previous data for {selectedExercise.name}.</p>
            )}

            {/* Sets logged this session */}
            {currentExerciseSets.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-(--text)">This session</p>
                {currentExerciseSets.map(s => (
                  <SetRow key={s.id} set={s} onDelete={() => deleteSet(s.id)} />
                ))}
              </div>
            )}

            {/* Add set form */}
            {addError && <Alert variant="error">{addError}</Alert>}
            <form onSubmit={handleAddSet} className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1.5 block text-sm font-medium text-(--text-h)">Weight (kg)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    min="0"
                    placeholder={currentExerciseSets.at(-1)?.weight?.toString() ?? 'e.g. 80'}
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    className="w-full rounded-lg border border-(--border) bg-(--bg) px-3 py-2 text-(--text-h) placeholder:text-(--text) focus:border-(--accent) focus:outline-none focus:ring-1 focus:ring-(--accent)"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1.5 block text-sm font-medium text-(--text-h)">Reps</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    step="1"
                    min="1"
                    placeholder={currentExerciseSets.at(-1)?.reps?.toString() ?? 'e.g. 8'}
                    value={reps}
                    onChange={e => setReps(e.target.value)}
                    className="w-full rounded-lg border border-(--border) bg-(--bg) px-3 py-2 text-(--text-h) placeholder:text-(--text) focus:border-(--accent) focus:outline-none focus:ring-1 focus:ring-(--accent)"
                  />
                </div>
              </div>
              <Button
                type="submit"
                variant="secondary"
                className="w-full"
                loading={adding}
                disabled={!reps}
              >
                <Plus size={16} />
                Add Set
              </Button>
            </form>
          </>
        )}

        {/* Done CTA */}
        {workout.sets.length > 0 && (
          <button
            onClick={() => setView('overview')}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-(--accent) py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Done — see workout
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    )
  }

  // ── Overview view ─────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-lg space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate({ to: '/workouts' })}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-(--border) text-(--text) transition-colors hover:border-(--accent-border) hover:text-(--accent)"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-(--text-h)">{fmtDate(workout.date)}</p>
          {workout.notes && (
            <p className="truncate text-xs text-(--text)">{workout.notes}</p>
          )}
        </div>
      </div>

      {/* Exercise groups */}
      {exerciseGroups.length === 0 ? (
        <p className="text-sm text-(--text)">No sets logged yet.</p>
      ) : (
        <div className="space-y-3">
          {exerciseGroups.map(({ exId, name, sets }) => (
            <div key={exId} className="rounded-2xl border border-(--border) p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-medium text-(--text-h)">{name}</p>
                <button
                  onClick={() => openLoggerForExercise(exId)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-(--text) transition-colors hover:bg-(--code-bg) hover:text-(--accent)"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-1.5">
                {sets.map((s, i) => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <span className="text-(--text)">Set {i + 1}</span>
                    <span className="text-(--text-h)">
                      {s.weight != null ? `${s.weight} kg` : 'BW'}
                      {s.reps != null && ` × ${s.reps}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add exercise */}
      <button
        onClick={() => openLoggerForExercise()}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-(--border) py-3.5 text-sm font-medium text-(--text) transition-colors hover:border-(--accent-border) hover:text-(--accent)"
      >
        <Plus size={16} />
        Add Exercise
      </button>
    </div>
  )
}
