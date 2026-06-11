import { Link, useNavigate } from '@tanstack/react-router'
import { Activity, ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Alert, Button, Input, Select } from '../components'
import { useExercises } from '../hooks/useExercises'
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
  const { exercises, loading: loadingExercises } = useExercises()

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

  const loading = loadingGyms || loadingWorkouts || loadingExercises
  const gymOptions = gyms.map(g => ({ value: g.id, label: g.name }))
  const noExercises = !loadingExercises && exercises.length === 0

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate({ to: '/workouts' })}
          className="flex h-8.5 w-8.5 items-center justify-center rounded-[10px] bg-(--surface) border border-(--border) text-(--text-muted) transition-colors hover:text-(--text-h)"
        >
          <ArrowLeft size={17} />
        </button>
        <h2>New Workout</h2>
      </div>

      {noExercises && (
        <Link
          to="/exercises"
          className="glass mb-4 flex items-center gap-4 rounded-[18px] p-5 transition-opacity active:opacity-80"
          style={{ borderColor: 'rgba(200,247,58,0.22)' }}
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px]"
            style={{ background: 'rgba(200,247,58,0.1)', border: '1px solid rgba(200,247,58,0.2)' }}
          >
            <Activity size={22} color="var(--accent)" />
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-semibold text-(--text-h)">Add exercises first</p>
            <p className="mt-0.5 text-[13px] text-(--text-muted)">You need at least one exercise to log sets.</p>
          </div>
          <ArrowRight size={18} className="shrink-0 text-(--text-disabled)" />
        </Link>
      )}

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-4">
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
          disabled={loading || noExercises}
        >
          Start Workout
        </Button>
      </form>
    </div>
  )
}
