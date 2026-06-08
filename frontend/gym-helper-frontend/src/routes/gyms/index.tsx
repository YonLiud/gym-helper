import { createFileRoute, redirect } from '@tanstack/react-router'
import { GymsPage } from '../../pages/Gyms'

export const Route = createFileRoute('/gyms/')({
  beforeLoad: () => {
    if (!localStorage.getItem('gym_user')) throw redirect({ to: '/login' })
  },
  component: GymsPage,
})
