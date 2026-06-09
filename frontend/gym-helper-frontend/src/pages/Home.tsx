import { useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'

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

export function HomePage() {
  const { user } = useAuth()
  const greeting = useMemo(() => user ? getGreeting(user.username) : null, [user?.username])

  return (
    <div className="space-y-8">
      {greeting && (
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.4px', lineHeight: 1.15 }}>
          {greeting}
        </h1>
      )}

      {/* Analytics coming soon */}
    </div>
  )
}
