import { ChevronDown, ChevronUp, Plus, Sparkles, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Alert, Button, Select, Spinner } from '../components'
import { useExercises } from '../hooks/useExercises'
import type { ExerciseInput } from '../types'

const MUSCLE_GROUPS = ['chest', 'back', 'shoulders', 'legs', 'biceps', 'triceps', 'core']
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
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-(--border) p-4">
      <p className="text-sm font-medium text-(--text-h)">Add exercise</p>
      {error && <Alert variant="error">{error}</Alert>}
      <input
        type="text"
        placeholder="Exercise name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
        className="w-full rounded-lg border border-(--border) bg-(--bg) px-3 py-2 text-(--text-h) placeholder:text-(--text) focus:border-(--accent) focus:outline-none focus:ring-1 focus:ring-(--accent)"
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

  // Group exercises by muscle_group, ungrouped at the end
  const groups = useMemo(() => {
    const map = new Map<string, typeof exercises>()
    for (const ex of exercises) {
      const key = ex.muscle_group ?? 'other'
      const arr = map.get(key) ?? []
      arr.push(ex)
      map.set(key, arr)
    }
    // Sort groups by known order, then alphabetically
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
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (error) return <Alert variant="error">{error}</Alert>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 style={{ margin: 0 }}>Exercises</h2>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-(--border) text-(--text) transition-colors hover:border-(--accent-border) hover:text-(--accent)"
        >
          <Plus size={18} className={showForm ? 'rotate-45 transition-transform' : 'transition-transform'} />
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
          <p className="text-(--text)">No exercises yet.</p>
          <Button variant="secondary" onClick={handleSeedDefaults} loading={seeding}>
            <Sparkles size={16} />
            Load defaults
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {groups.map(([group, exs]) => {
              const collapsed = collapsedGroups.has(group)
              return (
                <div key={group} className="rounded-2xl border border-(--border) overflow-hidden">
                  <button
                    onClick={() => toggleGroup(group)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-(--code-bg)"
                  >
                    <span className="text-sm font-semibold text-(--text-h)">{capitalize(group)}</span>
                    <span className="flex items-center gap-2 text-xs text-(--text)">
                      {exs.length}
                      {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </span>
                  </button>

                  {!collapsed && (
                    <div className="divide-y divide-(--border) border-t border-(--border)">
                      {exs.map(ex => (
                        <div key={ex.id} className="flex items-center gap-3 px-4 py-2.5">
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm text-(--text-h)">{ex.name}</p>
                            {ex.equipment_type && (
                              <p className="text-xs text-(--text)">{capitalize(ex.equipment_type)}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDelete(ex.id)}
                            className="shrink-0 text-(--border) transition-colors hover:text-red-500"
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
