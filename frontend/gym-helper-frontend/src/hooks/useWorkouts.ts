import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Workout, WorkoutInput, WorkoutSet, SetInput, SetUpdateInput } from '../types'

export function useWorkouts(gymId?: string) {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      setError(null)
      const path = gymId
        ? `/workout?gym_id=${encodeURIComponent(gymId)}`
        : '/workout'
      const data = await api.get<Workout[]>(path, signal)
      setWorkouts(data)
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return
      setError(e instanceof Error ? e.message : 'Failed to load workouts')
    } finally {
      setLoading(false)
    }
  }, [gymId])

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  async function createWorkout(input: WorkoutInput): Promise<Workout> {
    const workout = await api.post<Workout>('/workout', input)
    setWorkouts(prev => [workout, ...prev])
    return workout
  }

  async function deleteWorkout(id: string): Promise<void> {
    await api.delete(`/workout/${id}`)
    setWorkouts(prev => prev.filter(w => w.id !== id))
  }

  return { workouts, loading, error, createWorkout, deleteWorkout, reload: () => load() }
}

export function useWorkout(id: string) {
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      setError(null)
      const data = await api.get<Workout>(`/workout/${id}`, signal)
      setWorkout(data)
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return
      setError(e instanceof Error ? e.message : 'Failed to load workout')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  async function addSet(input: SetInput): Promise<WorkoutSet> {
    const set = await api.post<WorkoutSet>(`/workout/${id}/sets`, input)
    setWorkout(prev => prev ? { ...prev, sets: [...prev.sets, set] } : prev)
    return set
  }

  async function updateWorkout(input: WorkoutInput): Promise<Workout> {
    const updated = await api.put<Workout>(`/workout/${id}`, input)
    setWorkout(prev => prev ? { ...prev, ...updated } : prev)
    return updated
  }

  async function deleteWorkout(): Promise<void> {
    await api.delete(`/workout/${id}`)
  }

  async function updateSet(setId: string, input: SetUpdateInput): Promise<WorkoutSet> {
    const set = await api.put<WorkoutSet>(`/workout/${id}/sets/${setId}`, input)
    setWorkout(prev => prev ? { ...prev, sets: prev.sets.map(s => s.id === setId ? set : s) } : prev)
    return set
  }

  async function deleteSet(setId: string): Promise<void> {
    await api.delete(`/workout/${id}/sets/${setId}`)
    setWorkout(prev => prev ? { ...prev, sets: prev.sets.filter(s => s.id !== setId) } : prev)
  }

  return { workout, loading, error, addSet, updateWorkout, deleteWorkout, updateSet, deleteSet, reload: () => load() }
}
