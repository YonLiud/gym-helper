import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Gym, GymInput } from '../types'

export function useGyms() {
  const [gyms, setGyms] = useState<Gym[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const data = await api.get<Gym[]>('/gym')
      setGyms(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load gyms')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

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
    await api.delete(`/gym/${id}`)
    setGyms(prev => prev.filter(g => g.id !== id))
  }

  return { gyms, loading, error, createGym, updateGym, deleteGym, reload: load }
}
