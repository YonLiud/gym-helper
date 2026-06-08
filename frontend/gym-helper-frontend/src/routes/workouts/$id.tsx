import { createFileRoute, redirect } from '@tanstack/react-router'
import { WorkoutDetailPage } from '../../pages/WorkoutDetail'

export const Route = createFileRoute('/workouts/$id')({
  beforeLoad: () => {
    if (!localStorage.getItem('gym_user')) throw redirect({ to: '/login' })
  },
  component: WorkoutDetailPage,
})
