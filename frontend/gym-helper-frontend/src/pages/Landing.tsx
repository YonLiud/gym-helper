import { Link } from '@tanstack/react-router'
import { Dumbbell } from 'lucide-react'

export function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[20px] bg-(--accent)">
        <Dumbbell size={30} color="#0f0f0f" />
      </div>

      <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
        Your gym.<br />Your progress.
      </h1>

      <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-(--text-muted)">
        Track workouts, log sets, and watch yourself improve — session by session.
      </p>

      <Link
        to="/login"
        className="mt-10 rounded-[14px] bg-(--accent) px-8 py-3 text-[15px] font-semibold text-[#0f0f0f] transition-opacity hover:opacity-90 active:scale-[0.98]"
      >
        Get started
      </Link>
    </div>
  )
}
