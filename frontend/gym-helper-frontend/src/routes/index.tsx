import { createFileRoute, redirect } from '@tanstack/react-router'
import { DashboardPage } from '../pages/Dashboard'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    if (!localStorage.getItem('gym_user')) throw redirect({ to: '/login' })
  },
  component: DashboardPage,
})
