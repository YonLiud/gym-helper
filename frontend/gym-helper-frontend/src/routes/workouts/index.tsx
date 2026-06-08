import { createFileRoute, redirect } from '@tanstack/react-router'
import { WorkoutsPage } from '../../pages/Workouts'

export const Route = createFileRoute('/workouts/')({
  beforeLoad: () => {
    if (!localStorage.getItem('gym_user')) throw redirect({ to: '/login' })
  },
  component: WorkoutsPage,
})
