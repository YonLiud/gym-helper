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
    <div className="flex items-center gap-3 rounded-[10px] bg-(--code-bg) px-4 py-2.5">
      <span className="flex-1 text-[14px] text-(--text-h)">
        {set.weight != null ? `${set.weight} kg` : 'BW'}
        {set.reps != null && <span className="text-(--text-muted)"> × {set.reps}</span>}
      </span>
      <button
        onClick={onDelete}
        className="text-(--text-disabled) transition-colors hover:text-red-500"
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

  useEffect(() => {
    if (workout && view === null) {
      setView(workout.sets.length === 0 ? 'logger' : 'overview')
    }
  }, [workout, view])

  const exerciseMap = useMemo(
    () => new Map(exercises.map(e => [e.id, e])),
    [exercises],
  )

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

  const currentExerciseSets = useMemo(() => {
    if (!exerciseId || !workout) return []
    return workout.sets
      .filter(s => s.exercise_id === exerciseId)
      .sort((a, b) => a.order - b.order)
  }, [exerciseId, workout])

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
        <div className="flex items-center gap-3">
          <button
            onClick={() => canGoToOverview ? setView('overview') : navigate({ to: '/workouts' })}
            className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-[10px] bg-(--surface) border border-(--border) text-(--text-muted) transition-colors hover:text-(--text-h)"
          >
            <ArrowLeft size={17} />
          </button>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-medium text-(--text-h)">{fmtDate(workout.date)}</p>
            {workout.notes && (
              <p className="truncate text-[12px] text-(--text-muted)">{workout.notes}</p>
            )}
          </div>
        </div>

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
            {prevPerformance ? (
              <div className="rounded-[14px] border border-(--border) bg-(--surface) p-4">
                <p className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-(--text-disabled)">
                  Last time · {fmtDate(prevPerformance.date)}
                </p>
                <div className="space-y-1.5">
                  {prevPerformance.sets.map((s, i) => (
                    <p key={s.id} className="text-[14px] text-(--text-h)">
                      <span className="text-(--text-muted)">Set {i + 1} </span>
                      {s.weight != null ? `${s.weight} kg` : 'BW'}
                      {s.reps != null && ` × ${s.reps}`}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-(--text-muted)">No previous data for {selectedExercise.name}.</p>
            )}

            {currentExerciseSets.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-(--text-disabled)">This session</p>
                {currentExerciseSets.map(s => (
                  <SetRow key={s.id} set={s} onDelete={() => deleteSet(s.id)} />
                ))}
              </div>
            )}

            {addError && <Alert variant="error">{addError}</Alert>}
            <form onSubmit={handleAddSet} className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1.5 block text-[13px] font-medium text-(--text-muted)">Weight (kg)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    min="0"
                    placeholder={currentExerciseSets.at(-1)?.weight?.toString() ?? 'e.g. 80'}
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    className="w-full rounded-lg border border-(--border) bg-(--surface) px-3 py-3 text-[15px] font-medium text-center text-(--text-h) placeholder:text-(--text-hint) focus:border-(--accent) focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1.5 block text-[13px] font-medium text-(--text-muted)">Reps</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    step="1"
                    min="1"
                    placeholder={currentExerciseSets.at(-1)?.reps?.toString() ?? 'e.g. 8'}
                    value={reps}
                    onChange={e => setReps(e.target.value)}
                    className="w-full rounded-lg border border-(--border) bg-(--surface) px-3 py-3 text-[15px] font-medium text-center text-(--text-h) placeholder:text-(--text-hint) focus:border-(--accent) focus:outline-none transition-colors"
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

        {workout.sets.length > 0 && (
          <button
            onClick={() => setView('overview')}
            className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-(--accent) py-4.25 text-[15px] font-medium text-[#0f0f0f] transition-opacity hover:opacity-90"
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
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate({ to: '/workouts' })}
          className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-[10px] bg-(--surface) border border-(--border) text-(--text-muted) transition-colors hover:text-(--text-h)"
        >
          <ArrowLeft size={17} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-medium text-(--text-h)">{fmtDate(workout.date)}</p>
          {workout.notes && (
            <p className="truncate text-[12px] text-(--text-muted)">{workout.notes}</p>
          )}
        </div>
      </div>

      {exerciseGroups.length === 0 ? (
        <p className="text-[13px] text-(--text-muted)">No sets logged yet.</p>
      ) : (
        <div className="space-y-3">
          {exerciseGroups.map(({ exId, name, sets }) => (
            <div key={exId} className="rounded-[14px] border border-(--border) bg-(--surface) p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[14px] font-medium text-(--text-h)">{name}</p>
                <button
                  onClick={() => openLoggerForExercise(exId)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-(--text-muted) transition-colors hover:bg-(--code-bg) hover:text-(--accent)"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-1.5">
                {sets.map((s, i) => (
                  <div key={s.id} className="flex items-center justify-between text-[13px]">
                    <span className="text-(--text-muted)">Set {i + 1}</span>
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

      <button
        onClick={() => openLoggerForExercise()}
        className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-(--border) py-4.25 text-[14px] font-medium text-(--text-muted) transition-colors hover:border-(--accent-border) hover:text-(--accent)"
      >
        <Plus size={16} />
        Add Exercise
      </button>
    </div>
  )
}
