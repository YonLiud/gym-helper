import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Gym, GymInput } from '../types'

export function useGyms() {
  const [gyms, setGyms] = useState<Gym[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      setError(null)
      const data = await api.get<Gym[]>('/gym', signal)
      setGyms(data)
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return
      setError(e instanceof Error ? e.message : 'Failed to load gyms')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  async function createGym(input: GymInput): Promise<Gym> {
    const gym = await api.post<Gym>('/gym', input)
    setGyms(prev => [...prev, gym])
    return gym
  }

  async function updateGym(id: string, input: Partial<GymInput>): Promise<Gym> {
    const gym = await api.put<Gym>(`/gym/${id}`, input)
    setGyms(prev => prev.map(g => g.id === id ? gym : g))
    return gym
  }

  async function deleteGym(id: string): Promise<void> {
    const snapshot = gyms
    setGyms(prev => prev.filter(g => g.id !== id))
    try {
      await api.delete(`/gym/${id}`)
    } catch (err) {
      setGyms(snapshot)
      throw err
    }
  }

  return { gyms, loading, error, createGym, updateGym, deleteGym, reload: () => load() }
}
