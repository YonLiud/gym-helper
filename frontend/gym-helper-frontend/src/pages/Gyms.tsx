import { MapPin, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Alert, Button, GymCardSkeleton, Skeleton } from '../components'
import { useGyms } from '../hooks/useGyms'
import type { Gym, GymInput } from '../types'

const inputClass = 'w-full rounded-[10px] border border-(--border) bg-(--code-bg) px-4 py-3 text-[14px] text-(--text-h) placeholder:text-(--text-hint) focus:border-(--accent) focus:outline-none transition-colors'

function AddGymForm({ onAdd }: { onAdd: (input: GymInput) => Promise<void> }) {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onAdd({ name: name.trim(), location: location.trim(), notes: notes.trim() || null })
      setName('')
      setLocation('')
      setNotes('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add gym')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-[14px] border border-(--border) bg-(--surface) p-4">
      <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-(--text-disabled)">Add gym</p>
      {error && <Alert variant="error">{error}</Alert>}
      <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required className={inputClass} />
      <input type="text" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} required className={inputClass} />
      <input type="text" placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} className={inputClass} />
      <Button type="submit" variant="secondary" className="w-full" loading={submitting} disabled={!name.trim() || !location.trim()}>
        <Plus size={16} />
        Add
      </Button>
    </form>
  )
}

function GymCard({
  gym,
  onUpdate,
  onDelete,
}: {
  gym: Gym
  onUpdate: (input: GymInput) => Promise<unknown>
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(gym.name)
  const [location, setLocation] = useState(gym.location)
  const [notes, setNotes] = useState(gym.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function startEdit() {
    setName(gym.name)
    setLocation(gym.location)
    setNotes(gym.notes ?? '')
    setError(null)
    setEditing(true)
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onUpdate({ name: name.trim(), location: location.trim(), notes: notes.trim() || null })
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="space-y-2.5 rounded-[14px] border border-(--accent-border) bg-(--surface) p-4">
        {error && <Alert variant="error">{error}</Alert>}
        <input type="text" value={name} onChange={e => setName(e.target.value)} required autoFocus className={inputClass} />
        <input type="text" value={location} onChange={e => setLocation(e.target.value)} required className={inputClass} />
        <input type="text" placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} className={inputClass} />
        <div className="flex gap-2">
          <Button type="submit" size="sm" className="flex-1" loading={saving} disabled={!name.trim() || !location.trim()}>
            Save
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
            <X size={15} />
          </Button>
        </div>
      </form>
    )
  }

  return (
    <div className="flex items-start gap-3 rounded-[14px] border border-(--border) bg-(--surface) p-4">
      <MapPin size={15} className="mt-0.5 shrink-0 text-(--accent)" />
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-medium text-(--text-h)">{gym.name}</p>
        <p className="text-[13px] text-(--text-muted)">{gym.location}</p>
        {gym.notes && <p className="mt-1 text-[12px] text-(--text-muted)">{gym.notes}</p>}
      </div>
      <div className="flex shrink-0 gap-1">
        <button
          onClick={startEdit}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-(--text-muted) transition-colors hover:bg-(--code-bg) hover:text-(--text-h)"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onDelete}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-(--text-muted) transition-colors hover:bg-(--code-bg) hover:text-red-500"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

export function GymsPage() {
  const { gyms, loading, error, createGym, updateGym, deleteGym } = useGyms()
  const [showForm, setShowForm] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleDelete(id: string) {
    try {
      await deleteGym(id)
    } catch {
      setDeleteError('Failed to delete — check your connection')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-7 w-20 mb-2" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <GymCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  if (error) return <Alert variant="error">{error}</Alert>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2>Gyms</h2>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex h-8.5 w-8.5 items-center justify-center rounded-[10px] bg-(--surface) border border-(--border) text-(--text-muted) transition-colors hover:text-(--text-h)"
        >
          <Plus size={17} className={showForm ? 'rotate-45 transition-transform' : 'transition-transform'} />
        </button>
      </div>

      {showForm && (
        <AddGymForm onAdd={async input => { await createGym(input); setShowForm(false) }} />
      )}

      {deleteError && (
        <Alert variant="error">
          <span className="flex items-center justify-between gap-2">
            {deleteError}
            <button onClick={() => setDeleteError(null)} className="shrink-0 text-xs underline">dismiss</button>
          </span>
        </Alert>
      )}

      {gyms.length === 0 ? (
        <p className="py-16 text-center text-[13px] text-(--text-muted)">No gyms yet. Add one above.</p>
      ) : (
        <div className="space-y-2">
          {gyms.map(gym => (
            <GymCard
              key={gym.id}
              gym={gym}
              onUpdate={input => updateGym(gym.id, input)}
              onDelete={() => handleDelete(gym.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
