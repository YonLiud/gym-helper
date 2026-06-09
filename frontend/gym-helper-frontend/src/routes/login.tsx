import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginPage } from '../pages/Login'

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    if (localStorage.getItem('gym_user')) throw redirect({ to: '/home' })
  },
  component: LoginPage,
})
