import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Gym, GymInput } from '../types'

export function useGyms() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['gyms'],
    queryFn: () => api.get<Gym[]>('/gym'),
    staleTime: 5 * 60 * 1000,
  })

  const createMutation = useMutation({
    mutationFn: (input: GymInput) => api.post<Gym>('/gym', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gyms'] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<GymInput> }) =>
      api.put<Gym>(`/gym/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gyms'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/gym/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gyms'] }),
  })

  return {
    gyms: query.data ?? [],
    loading: query.isPending,
    error: query.error instanceof Error ? query.error.message : null,
    createGym: (input: GymInput) => createMutation.mutateAsync(input),
    updateGym: (id: string, input: Partial<GymInput>) => updateMutation.mutateAsync({ id, input }),
    deleteGym: (id: string) => deleteMutation.mutateAsync(id),
  }
}
