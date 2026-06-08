import { createFileRoute, redirect } from '@tanstack/react-router'
import { WorkoutNewPage } from '../../pages/WorkoutNew'

export const Route = createFileRoute('/workouts/new')({
  beforeLoad: () => {
    if (!localStorage.getItem('gym_user')) throw redirect({ to: '/login' })
  },
  component: WorkoutNewPage,
})
