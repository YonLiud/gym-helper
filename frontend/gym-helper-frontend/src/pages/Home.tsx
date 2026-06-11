import { useMemo } from 'react'
import { MuscleGroupBar, RecentPRs, Skeleton, StatCard } from '../components'
import { useAuth } from '../hooks/useAuth'
import { useWorkoutStats } from '../hooks/useWorkoutStats'

const GREETINGS = {
  morning: (name: string) => [
    `Rise and earn it, ${name}.`,
    `First lift of the day, ${name}.`,
    `Day starts here, ${name}.`,
    `Already winning, ${name}.`,
  ],
  afternoon: (name: string) => [
    `Midday grind, ${name}.`,
    `No off days, ${name}.`,
    `Afternoon is yours, ${name}.`,
    `Keep the streak, ${name}.`,
  ],
  evening: (name: string) => [
    `Prime time, ${name}.`,
    `End it strong, ${name}.`,
    `Best hour of the day, ${name}.`,
    `Clock out. Lift in, ${name}.`,
  ],
  night: (name: string) => [
    `Night owl energy, ${name}.`,
    `Late nights, ${name}. Respect.`,
    `The night shift, ${name}.`,
    `Still here, ${name}.`,
  ],
}

function getGreeting(name: string): string {
  const displayName = name.charAt(0).toUpperCase() + name.slice(1)
  const hour = new Date().getHours()
  let pool: string[]
  if (hour >= 5 && hour < 12) pool = GREETINGS.morning(displayName)
  else if (hour >= 12 && hour < 17) pool = GREETINGS.afternoon(displayName)
  else if (hour >= 17 && hour < 21) pool = GREETINGS.evening(displayName)
  else pool = GREETINGS.night(displayName)
  return pool[Math.floor(Math.random() * pool.length)]
}

function formatVolume(kg: number): string {
  if (kg === 0) return '—'
  return kg >= 1000 ? `${(kg / 1000).toFixed(1)}k` : String(Math.round(kg))
}

function formatLastSession(days: number | null): { value: string; sub: string } {
  if (days === null) return { value: '—', sub: 'no sessions yet' }
  if (days === 0) return { value: 'Today', sub: 'keep it up' }
  if (days === 1) return { value: '1', sub: 'day ago' }
  return { value: String(days), sub: 'days ago' }
}

function GreetingHeading({ text, username }: { text: string; username: string }) {
  const displayName = username.charAt(0).toUpperCase() + username.slice(1)
  const idx = text.lastIndexOf(displayName)
  if (idx === -1) return (
    <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.4px', lineHeight: 1.15 }}>{text}</h1>
  )
  return (
    <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.4px', lineHeight: 1.15 }}>
      {text.slice(0, idx)}
      <span style={{ color: 'var(--accent)' }}>{displayName}</span>
      {text.slice(idx + displayName.length)}
    </h1>
  )
}

export function HomePage() {
  const { user } = useAuth()
  const greeting = useMemo(() => user ? getGreeting(user.username) : null, [user?.username])
  const { thisWeek, streak, volumeThisWeek, daysSinceLastWorkout, muscleGroups, prs, loading } = useWorkoutStats()

  const lastSession = formatLastSession(daysSinceLastWorkout)

  return (
    <div className="space-y-6">
      {greeting && user && (
        <GreetingHeading text={greeting} username={user.username} />
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="flex gap-3">
            <Skeleton className="h-24 flex-1 rounded-[14px]" />
            <Skeleton className="h-24 flex-1 rounded-[14px]" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-24 flex-1 rounded-[14px]" />
            <Skeleton className="h-24 flex-1 rounded-[14px]" />
          </div>
          <Skeleton className="h-40 w-full rounded-[14px]" />
          <Skeleton className="h-48 w-full rounded-[14px]" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="This week"    value={thisWeek}                 sub={thisWeek === 1 ? 'workout' : 'workouts'} />
            <StatCard label="Streak"       value={streak}                   sub={streak === 1 ? 'week' : 'weeks'} />
            <StatCard label="Volume"       value={formatVolume(volumeThisWeek)} sub={volumeThisWeek > 0 ? 'kg this week' : undefined} />
            <StatCard label="Last session" value={lastSession.value}        sub={lastSession.sub} />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <MuscleGroupBar groups={muscleGroups} />
            <RecentPRs prs={prs} />
          </div>
        </>
      )}
    </div>
  )
}
