import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Exercise, ExerciseInput } from '../types'

export function useExercises(muscleGroup?: string) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const path = muscleGroup
        ? `/exercise?muscle_group=${encodeURIComponent(muscleGroup)}`
        : '/exercise'
      const data = await api.get<Exercise[]>(path)
      setExercises(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load exercises')
    } finally {
      setLoading(false)
    }
  }, [muscleGroup])

  useEffect(() => { load() }, [load])

  async function createExercise(input: ExerciseInput): Promise<Exercise> {
    const exercise = await api.post<Exercise>('/exercise', input)
    setExercises(prev => [...prev, exercise].sort((a, b) => a.name.localeCompare(b.name)))
    return exercise
  }

  async function deleteExercise(id: string): Promise<void> {
    const snapshot = exercises
    setExercises(prev => prev.filter(e => e.id !== id))
    try {
      await api.delete(`/exercise/${id}`)
    } catch (err) {
      setExercises(snapshot)
      throw err
    }
  }

  async function seedDefaults(): Promise<void> {
    const exercises = await api.post<Exercise[]>('/exercise/defaults', {})
    setExercises(exercises)
  }

  return { exercises, loading, error, createExercise, deleteExercise, seedDefaults, reload: load }
}
