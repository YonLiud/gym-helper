import { useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Button, Skeleton } from '../components'
import { cn } from '../lib/cn'
import { useExercises } from '../hooks/useExercises'
import { useWorkout, useWorkouts } from '../hooks/useWorkouts'
import type { Exercise, WorkoutSet } from '../types'

function fmtDate(dateStr: string, createdAt?: string) {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  const label = sameDay(d, today)
    ? 'Today'
    : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  if (!createdAt) return label
  const time = new Date(createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${label} · ${time}`
}

// ── Exercise picker ───────────────────────────────────────────────────────────

function ExercisePicker({
  exercises,
  selectedId,
  onSelect,
}: {
  exercises: Exercise[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const [muscleFilter, setMuscleFilter] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!selectedId) {
      setQuery('')
      setMuscleFilter('')
    }
  }, [selectedId])

  const muscleGroups = useMemo(() => {
    const seen = new Set<string>()
    for (const e of exercises) {
      if (e.muscle_group) seen.add(e.muscle_group)
    }
    return [...seen].sort()
  }, [exercises])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return exercises
      .filter(e => {
        const matchesQuery = !q || e.name.toLowerCase().includes(q)
        const matchesMuscle = !muscleFilter || e.muscle_group === muscleFilter
        return matchesQuery && matchesMuscle
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [exercises, query, muscleFilter])

  const selected = selectedId ? exercises.find(e => e.id === selectedId) : null

  if (selected) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 rounded-[10px] border border-(--accent-border) bg-(--surface) px-4 py-3">
          <p className="text-[14px] font-medium text-(--text-h)">{selected.name}</p>
          {selected.muscle_group && (
            <p className="text-[11px] capitalize text-(--text-muted)">{selected.muscle_group}</p>
          )}
        </div>
        <button
          onClick={() => onSelect('')}
          className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[10px] border border-(--border) bg-(--surface) text-(--text-muted) transition-colors hover:text-(--text-h)"
        >
          <X size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search size={14} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted)" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search exercise…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full rounded-[10px] border border-(--border) bg-(--surface) py-3 pl-10 pr-4 text-[14px] text-(--text-h) placeholder:text-(--text-hint) focus:border-(--accent) focus:outline-none transition-colors"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); inputRef.current?.focus() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted)"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {muscleGroups.length > 0 && (
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-0.5">
          {muscleGroups.map(group => (
            <button
              key={group}
              onClick={() => setMuscleFilter(prev => prev === group ? '' : group)}
              className={cn(
                'shrink-0 rounded-[20px] border px-3.5 py-1.5 text-[12px] font-medium transition-colors',
                muscleFilter === group
                  ? 'border-(--accent-border) bg-(--accent-bg) text-(--accent)'
                  : 'border-(--border) bg-(--surface) text-(--text-muted)',
              )}
            >
              {group.charAt(0).toUpperCase() + group.slice(1)}
            </button>
          ))}
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="max-h-60 overflow-y-auto rounded-[14px] border border-(--border) bg-(--surface)">
          {filtered.map((ex, i) => (
            <button
              key={ex.id}
              onClick={() => onSelect(ex.id)}
              className={cn(
                'flex w-full items-start px-4 py-3 text-left transition-colors hover:bg-(--code-bg)',
                i > 0 && 'border-t border-(--border)',
              )}
            >
              <div>
                <p className="text-[14px] text-(--text-h)">{ex.name}</p>
                {(ex.muscle_group || ex.equipment_type) && (
                  <p className="text-[11px] capitalize text-(--text-muted)">
                    {[ex.muscle_group, ex.equipment_type].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className="py-2 text-[13px] text-(--text-muted)">No exercises found.</p>
      )}
    </div>
  )
}

// ── Set row ───────────────────────────────────────────────────────────────────

function SetRow({ set, index, onDelete }: { set: WorkoutSet; index: number; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-[10px] bg-(--code-bg) px-4 py-2.5">
      <span className="w-5 shrink-0 text-[11px] font-medium text-(--text-disabled)">{index + 1}</span>
      <span className="flex-1 text-[14px] font-medium text-(--text-h)">
        {set.weight != null ? `${set.weight} kg` : 'BW'}
        {set.reps != null && <span className="text-(--text-muted)"> × {set.reps}</span>}
      </span>
      <button onClick={onDelete} className="text-(--text-disabled) transition-colors hover:text-red-500">
        <Trash2 size={15} />
      </button>
    </div>
  )
}

// ── Inline title editor ───────────────────────────────────────────────────────

function InlineTitle({
  value,
  onSave,
}: {
  value: string | null
  onSave: (newValue: string | null) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  function startEdit() {
    setDraft(value ?? '')
    setEditing(true)
  }

  function commit() {
    setEditing(false)
    const trimmed = draft.trim() || null
    if (trimmed !== value) onSave(trimmed)
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }}
        placeholder="Add title…"
        className="w-full border-b border-(--accent) bg-transparent text-[16px] font-medium text-(--text-h) placeholder:text-(--text-disabled) focus:outline-none pb-0.5"
      />
    )
  }

  return (
    <button onClick={startEdit} className="flex w-full items-center gap-1.5 truncate text-left transition-colors">
      <span className="truncate text-[16px] font-medium text-(--text-h)">
        {value || <span className="text-(--text-disabled)">Add title…</span>}
      </span>
      <Pencil size={12} className="shrink-0 text-(--text-disabled)" />
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

type View = 'logger' | 'overview'

export function WorkoutDetailPage() {
  const { id } = useParams({ from: '/workouts/$id' })
  const navigate = useNavigate()

  const { workout, loading, error, addSet, updateSet, updateWorkout, deleteWorkout, deleteSet } = useWorkout(id)
  const { exercises } = useExercises()
  const { workouts } = useWorkouts()

  const [view, setView] = useState<View | null>(null)
  const [exerciseId, setExerciseId] = useState('')
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [reassigningGroup, setReassigningGroup] = useState<string | null>(null)

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
    if (!exerciseId || !workout || !reps) return
    setAdding(true)
    setAddError(null)
    try {
      await addSet({
        exercise_id: exerciseId,
        order: workout.sets.length,
        weight: weight ? parseFloat(weight) : null,
        reps: parseInt(reps, 10),
      })
      setWeight('')
      setReps('')
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add set')
    } finally {
      setAdding(false)
    }
  }

  async function handleDeleteWorkout() {
    setDeleting(true)
    try {
      await deleteWorkout()
      navigate({ to: '/workouts' })
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  async function handleSaveTitle(newNotes: string | null) {
    if (!workout) return
    try {
      await updateWorkout({ date: workout.date, gym_id: workout.gym_id, notes: newNotes })
    } catch { /* silent — optimistic update already set in hook */ }
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
      <div className="mx-auto max-w-lg space-y-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8.5 w-8.5 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-5 w-40" />
          </div>
        </div>
        <Skeleton className="h-12 w-full" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-[14px] border border-(--border) bg-(--surface) p-4 space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  if (error) return <Alert variant="error">{error}</Alert>
  if (!workout) return null

  // ── Logger view ─────────────────────────────────────────────────────────────

  if (view === 'logger') {
    const canGoToOverview = workout.sets.length > 0

    return (
      <div className="mx-auto max-w-lg space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => canGoToOverview ? setView('overview') : navigate({ to: '/workouts' })}
            className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-[10px] border border-(--border) bg-(--surface) text-(--text-muted) transition-colors hover:text-(--text-h)"
          >
            <ArrowLeft size={17} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-(--text-muted)">{fmtDate(workout.date, workout.created_at)}</p>
            <InlineTitle value={workout.notes} onSave={handleSaveTitle} />
          </div>
        </div>

        {/* Exercise picker */}
        <ExercisePicker
          exercises={exercises}
          selectedId={exerciseId}
          onSelect={id => {
            setExerciseId(id)
            setWeight('')
            setReps('')
          }}
        />

        {exerciseId && (
          <>
            {/* Previous performance */}
            {prevPerformance ? (
              <div className="rounded-[14px] p-4" style={{ background: 'rgba(200,247,58,0.04)', border: '1px solid rgba(200,247,58,0.12)' }}>
                <p className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: 'rgba(200,247,58,0.6)' }}>
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
              <p className="text-[13px] text-(--text-muted)">
                No previous data for {exerciseMap.get(exerciseId)?.name}.
              </p>
            )}

            {/* Sets logged this session */}
            {currentExerciseSets.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-(--text-disabled)">This session</p>
                {currentExerciseSets.map((s, i) => (
                  <SetRow key={s.id} set={s} index={i} onDelete={() => deleteSet(s.id)} />
                ))}
              </div>
            )}

            {/* Add set form */}
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
                    className="w-full rounded-lg border border-(--border) bg-(--surface) px-3 py-3 text-center text-[15px] font-medium text-(--text-h) placeholder:text-(--text-hint) focus:border-(--accent) focus:outline-none transition-colors"
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
                    className="w-full rounded-lg border border-(--border) bg-(--surface) px-3 py-3 text-center text-[15px] font-medium text-(--text-h) placeholder:text-(--text-hint) focus:border-(--accent) focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <Button type="submit" variant="secondary" className="w-full" loading={adding} disabled={!reps}>
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
            className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-(--accent) py-4.25 text-[15px] font-medium text-[#0f0f0f] transition-opacity hover:opacity-90"
          >
            Done — see workout
          </button>
        )}
      </div>
    )
  }

  // ── Overview view ────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-lg space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate({ to: '/workouts' })}
          className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-[10px] border border-(--border) bg-(--surface) text-(--text-muted) transition-colors hover:text-(--text-h)"
        >
          <ArrowLeft size={17} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] text-(--text-muted)">{fmtDate(workout.date, workout.created_at)}</p>
          <InlineTitle value={workout.notes} onSave={handleSaveTitle} />
        </div>
        {/* Delete */}
        {confirmDelete ? (
          <div className="flex shrink-0 items-center gap-3">
            <button
              onClick={handleDeleteWorkout}
              disabled={deleting}
              className="text-[13px] font-medium text-red-500 disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
            <button onClick={() => setConfirmDelete(false)} className="text-[13px] text-(--text-muted)">
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-[10px] border border-(--border) bg-(--surface) text-(--text-muted) transition-colors hover:border-red-900 hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Exercise groups */}
      {exerciseGroups.length === 0 ? (
        <p className="text-[13px] text-(--text-muted)">No sets logged yet.</p>
      ) : (
        <div className="space-y-3">
          {exerciseGroups.map(({ exId, name, sets }) => (
            <div key={exId} className="glass overflow-hidden rounded-[14px]">
              {reassigningGroup === exId ? (
                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-(--text-disabled)">Change exercise</p>
                    <button onClick={() => setReassigningGroup(null)} className="text-(--text-muted) hover:text-(--text-h) transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                  <ExercisePicker
                    exercises={exercises}
                    selectedId=""
                    onSelect={async newId => {
                      if (!newId) return
                      setReassigningGroup(null)
                      await Promise.all(sets.map(s => updateSet(s.id, { exercise_id: newId })))
                    }}
                  />
                </div>
              ) : (
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <button
                      onClick={() => setReassigningGroup(exId)}
                      className="flex items-center gap-1.5 text-left transition-colors hover:text-(--text-muted)"
                    >
                      <span className="text-[14px] font-medium text-(--text-h)">{name}</span>
                      <Pencil size={11} className="shrink-0 text-(--text-disabled)" />
                    </button>
                    <button
                      onClick={() => openLoggerForExercise(exId)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-(--text-muted) transition-colors hover:bg-(--code-bg) hover:text-(--accent)"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {sets.map((s, i) => (
                      <div key={s.id} className="flex items-center gap-3 rounded-lg bg-(--code-bg) px-3 py-2 text-[13px]">
                        <span className="w-4 shrink-0 text-[11px] font-medium text-(--text-disabled)">{i + 1}</span>
                        <span className="flex-1 font-medium text-(--text-h)">
                          {s.weight != null ? `${s.weight} kg` : 'BW'}
                          <span className="text-(--text-muted)">{s.reps != null && ` × ${s.reps}`}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
