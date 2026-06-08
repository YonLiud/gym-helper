import { Link } from '@tanstack/react-router'

export function DashboardPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4">
      <h1 style={{ margin: 0 }}>Gym Helper</h1>
      <Link
        to="/login"
        className="rounded-lg bg-(--accent) px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Log in
      </Link>
    </div>
  )
}
