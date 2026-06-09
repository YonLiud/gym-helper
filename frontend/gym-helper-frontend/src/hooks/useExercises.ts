import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Exercise, ExerciseInput } from '../types'

export function useExercises(muscleGroup?: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: muscleGroup ? ['exercises', muscleGroup] : ['exercises'],
    queryFn: () => {
      const path = muscleGroup
        ? `/exercise?muscle_group=${encodeURIComponent(muscleGroup)}`
        : '/exercise'
      return api.get<Exercise[]>(path)
    },
    staleTime: 5 * 60 * 1000,
  })

  const createMutation = useMutation({
    mutationFn: (input: ExerciseInput) => api.post<Exercise>('/exercise', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exercises'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/exercise/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exercises'] }),
  })

  const seedMutation = useMutation({
    mutationFn: () => api.post<Exercise[]>('/exercise/defaults', {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exercises'] }),
  })

  return {
    exercises: query.data ?? [],
    loading: query.isPending,
    error: query.error instanceof Error ? query.error.message : null,
    createExercise: (input: ExerciseInput) => createMutation.mutateAsync(input),
    deleteExercise: (id: string) => deleteMutation.mutateAsync(id),
    seedDefaults: () => seedMutation.mutateAsync(),
  }
}
