import { ChevronDown, ChevronUp, Plus, Sparkles, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Alert, Button, ExerciseGroupSkeleton, Select, Skeleton } from '../components'
import { useExercises } from '../hooks/useExercises'
import type { ExerciseInput } from '../types'

const MUSCLE_GROUPS = ['chest', 'back', 'shoulders', 'legs', 'biceps', 'triceps', 'core']

const MUSCLE_COLORS: Record<string, string> = {
  chest:     '#f87171',
  back:      '#60a5fa',
  shoulders: '#fb923c',
  legs:      '#a78bfa',
  biceps:    '#34d399',
  triceps:   '#c8f73a',
  core:      '#fbbf24',
  other:     '#6b7280',
}
const EQUIPMENT_TYPES = ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'other']

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const muscleGroupOptions = [
  ...MUSCLE_GROUPS.map(m => ({ value: m, label: capitalize(m) })),
  { value: 'other', label: 'Other' },
]
const equipmentOptions = EQUIPMENT_TYPES.map(e => ({ value: e, label: capitalize(e) }))

function AddExerciseForm({
  onAdd,
}: {
  onAdd: (input: ExerciseInput) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [muscleGroup, setMuscleGroup] = useState('')
  const [equipment, setEquipment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await onAdd({
        name: name.trim(),
        muscle_group: muscleGroup || null,
        equipment_type: equipment || null,
      })
      setName('')
      setMuscleGroup('')
      setEquipment('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add exercise')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-[14px] border border-(--border) bg-(--surface) p-4">
      <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-(--text-disabled)">Add exercise</p>
      {error && <Alert variant="error">{error}</Alert>}
      <input
        type="text"
        placeholder="Exercise name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
        className="w-full rounded-[10px] border border-(--border) bg-(--code-bg) px-4 py-3 text-[14px] text-(--text-h) placeholder:text-(--text-hint) focus:border-(--accent) focus:outline-none transition-colors"
      />
      <div className="flex gap-3">
        <Select
          value={muscleGroup}
          onChange={e => setMuscleGroup(e.target.value)}
          options={muscleGroupOptions}
          placeholder="Muscle group"
          className="flex-1"
        />
        <Select
          value={equipment}
          onChange={e => setEquipment(e.target.value)}
          options={equipmentOptions}
          placeholder="Equipment"
          className="flex-1"
        />
      </div>
      <Button type="submit" variant="secondary" className="w-full" loading={submitting} disabled={!name.trim()}>
        <Plus size={16} />
        Add
      </Button>
    </form>
  )
}

export function ExercisesPage() {
  const { exercises, loading, error, createExercise, deleteExercise, seedDefaults } = useExercises()
  const [seeding, setSeeding] = useState(false)
  const [seedError, setSeedError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  async function handleDelete(id: string) {
    try {
      await deleteExercise(id)
    } catch {
      setDeleteError('Failed to delete — check your connection')
    }
  }

  async function handleSeedDefaults() {
    setSeeding(true)
    setSeedError(null)
    try {
      await seedDefaults()
    } catch (err) {
      setSeedError(err instanceof Error ? err.message : 'Failed to load defaults')
    } finally {
      setSeeding(false)
    }
  }

  function toggleGroup(group: string) {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      next.has(group) ? next.delete(group) : next.add(group)
      return next
    })
  }

  const groups = useMemo(() => {
    const map = new Map<string, typeof exercises>()
    for (const ex of exercises) {
      const key = ex.muscle_group ?? 'other'
      const arr = map.get(key) ?? []
      arr.push(ex)
      map.set(key, arr)
    }
    const known = [...MUSCLE_GROUPS, 'other']
    return [...map.entries()].sort(([a], [b]) => {
      const ai = known.indexOf(a)
      const bi = known.indexOf(b)
      if (ai === -1 && bi === -1) return a.localeCompare(b)
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
  }, [exercises])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-7 w-32 mb-2" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <ExerciseGroupSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  if (error) return <Alert variant="error">{error}</Alert>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2>Exercises</h2>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex h-8.5 w-8.5 items-center justify-center rounded-[10px] bg-(--surface) border border-(--border) text-(--text-muted) transition-colors hover:text-(--text-h)"
        >
          <Plus size={17} className={showForm ? 'rotate-45 transition-transform' : 'transition-transform'} />
        </button>
      </div>

      {showForm && (
        <AddExerciseForm onAdd={async input => { await createExercise(input); setShowForm(false) }} />
      )}

      {seedError && <Alert variant="error">{seedError}</Alert>}
      {deleteError && (
        <Alert variant="error">
          <span className="flex items-center justify-between gap-2">
            {deleteError}
            <button onClick={() => setDeleteError(null)} className="shrink-0 underline text-xs">dismiss</button>
          </span>
        </Alert>
      )}

      {exercises.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-[13px] text-(--text-muted)">No exercises yet.</p>
          <Button variant="secondary" onClick={handleSeedDefaults} loading={seeding}>
            <Sparkles size={16} />
            Load defaults
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {groups.map(([group, exs]) => {
              const collapsed = collapsedGroups.has(group)
              return (
                <div key={group} className="glass overflow-hidden rounded-[14px]">
                  <button
                    onClick={() => toggleGroup(group)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/3"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: MUSCLE_COLORS[group] ?? MUSCLE_COLORS.other }} />
                      <span className="text-[13px] font-medium uppercase tracking-[0.08em] text-(--text-muted)">{capitalize(group)}</span>
                    </span>
                    <span className="flex items-center gap-2 text-[12px] text-(--text-disabled)">
                      {exs.length}
                      {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </span>
                  </button>

                  {!collapsed && (
                    <div className="divide-y divide-(--border) border-t border-(--border)">
                      {exs.map(ex => (
                        <div key={ex.id} className="flex items-center gap-3 px-4 py-2.5">
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-[14px] text-(--text-h)">{ex.name}</p>
                            {ex.equipment_type && (
                              <p className="text-[12px] text-(--text-muted)">{capitalize(ex.equipment_type)}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDelete(ex.id)}
                            className="shrink-0 text-(--text-disabled) transition-colors hover:text-red-500"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <Button variant="ghost" size="sm" onClick={handleSeedDefaults} loading={seeding} className="w-full">
            <Sparkles size={14} />
            Load defaults
          </Button>
        </>
      )}
    </div>
  )
}
