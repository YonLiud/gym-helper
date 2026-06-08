import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { AppLayout } from '../layouts/AppLayout'

const PUBLIC_PATHS = new Set(['/login', '/components'])

function Root() {
  const pathname = useRouterState({ select: s => s.location.pathname })
  if (PUBLIC_PATHS.has(pathname)) return <Outlet />
  return <AppLayout />
}

export const Route = createRootRoute({ component: Root })
