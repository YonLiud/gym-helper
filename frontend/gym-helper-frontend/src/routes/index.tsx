import { createFileRoute, redirect } from '@tanstack/react-router'
import { LandingPage } from '../pages/Landing'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    if (localStorage.getItem('gym_user')) throw redirect({ to: '/home' })
  },
  component: LandingPage,
})
