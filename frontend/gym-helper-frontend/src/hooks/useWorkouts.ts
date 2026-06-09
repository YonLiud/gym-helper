import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Workout, WorkoutInput, WorkoutSet, SetInput, SetUpdateInput } from '../types'

export function useWorkouts(gymId?: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: gymId ? ['workouts', { gymId }] : ['workouts'],
    queryFn: () => {
      const path = gymId
        ? `/workout?gym_id=${encodeURIComponent(gymId)}`
        : '/workout'
      return api.get<Workout[]>(path)
    },
    staleTime: 5 * 60 * 1000,
  })

  const createMutation = useMutation({
    mutationFn: (input: WorkoutInput) => api.post<Workout>('/workout', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workouts'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/workout/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workouts'] }),
  })

  return {
    workouts: query.data ?? [],
    loading: query.isPending,
    error: query.error instanceof Error ? query.error.message : null,
    createWorkout: (input: WorkoutInput) => createMutation.mutateAsync(input),
    deleteWorkout: (id: string) => deleteMutation.mutateAsync(id),
  }
}

export function useWorkout(id: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['workout', id],
    queryFn: () => api.get<Workout>(`/workout/${id}`),
    staleTime: 2 * 60 * 1000,
  })

  const addSetMutation = useMutation({
    mutationFn: (input: SetInput) => api.post<WorkoutSet>(`/workout/${id}/sets`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workout', id] }),
  })

  const updateWorkoutMutation = useMutation({
    mutationFn: (input: WorkoutInput) => api.put<Workout>(`/workout/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout', id] })
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
    },
  })

  const deleteWorkoutMutation = useMutation({
    mutationFn: () => api.delete(`/workout/${id}`),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['workout', id] })
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
    },
  })

  const updateSetMutation = useMutation({
    mutationFn: ({ setId, input }: { setId: string; input: SetUpdateInput }) =>
      api.put<WorkoutSet>(`/workout/${id}/sets/${setId}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workout', id] }),
  })

  const deleteSetMutation = useMutation({
    mutationFn: (setId: string) => api.delete(`/workout/${id}/sets/${setId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workout', id] }),
  })

  return {
    workout: query.data ?? null,
    loading: query.isPending,
    error: query.error instanceof Error ? query.error.message : null,
    addSet: (input: SetInput) => addSetMutation.mutateAsync(input),
    updateWorkout: (input: WorkoutInput) => updateWorkoutMutation.mutateAsync(input),
    deleteWorkout: () => deleteWorkoutMutation.mutateAsync(),
    updateSet: (setId: string, input: SetUpdateInput) => updateSetMutation.mutateAsync({ setId, input }),
    deleteSet: (setId: string) => deleteSetMutation.mutateAsync(setId),
  }
}
