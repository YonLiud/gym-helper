import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Alert, Button, Input, Select } from '../components'
import { useGyms } from '../hooks/useGyms'
import { useWorkouts } from '../hooks/useWorkouts'

function todayLocal(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function todayTitle(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

export function WorkoutNewPage() {
  const navigate = useNavigate()
  const { gyms, loading: loadingGyms } = useGyms()
  const { workouts, loading: loadingWorkouts, createWorkout } = useWorkouts()

  const [gymId, setGymId] = useState('')
  const [title, setTitle] = useState(todayTitle())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (loadingWorkouts || gymId) return
    const lastGymId = [...workouts]
      .sort((a, b) => b.date.localeCompare(a.date))
      .find(w => w.gym_id)?.gym_id
    if (lastGymId) setGymId(lastGymId)
  }, [workouts, loadingWorkouts, gymId])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const workout = await createWorkout({
        date: todayLocal(),
        gym_id: gymId || null,
        notes: title.trim() || null,
      })
      navigate({ to: '/workouts/$id', params: { id: workout.id } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workout')
      setSubmitting(false)
    }
  }

  const loading = loadingGyms || loadingWorkouts
  const gymOptions = gyms.map(g => ({ value: g.id, label: g.name }))

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate({ to: '/workouts' })}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-(--border) text-(--text) transition-colors hover:border-(--accent-border) hover:text-(--accent)"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 style={{ margin: 0 }}>New Workout</h2>
      </div>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Push day"
        />

        <Select
          label="Gym"
          value={gymId}
          onChange={e => setGymId(e.target.value)}
          options={gymOptions}
          placeholder={loading ? 'Loading…' : 'No gym'}
          disabled={loading}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={submitting}
          disabled={loading}
        >
          Start Workout
        </Button>
      </form>
    </div>
  )
}
