import { createFileRoute, redirect } from '@tanstack/react-router'
import { ExercisesPage } from '../../pages/Exercises'

export const Route = createFileRoute('/exercises/')({
  beforeLoad: () => {
    if (!localStorage.getItem('gym_user')) throw redirect({ to: '/login' })
  },
  component: ExercisesPage,
})
