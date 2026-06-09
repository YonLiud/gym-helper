import { cn } from '../lib/cn'
import type { MuscleGroupStat } from '../hooks/useWorkoutStats'

const COLORS = ['#c8f73a', '#4ade80', '#60a5fa', '#f472b6', '#fb923c', '#a78bfa', '#34d399']

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function donutSlice(cx: number, cy: number, outerR: number, innerR: number, start: number, end: number) {
  const clamped = Math.min(end, start + 359.99)
  const p1 = polarToCartesian(cx, cy, outerR, start)
  const p2 = polarToCartesian(cx, cy, outerR, clamped)
  const p3 = polarToCartesian(cx, cy, innerR, clamped)
  const p4 = polarToCartesian(cx, cy, innerR, start)
  const large = clamped - start > 180 ? 1 : 0
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${p4.x} ${p4.y}`,
    'Z',
  ].join(' ')
}

interface MuscleGroupBarProps {
  groups: MuscleGroupStat[]
}

export function MuscleGroupBar({ groups }: MuscleGroupBarProps) {
  if (groups.length === 0) return null

  const top = groups.slice(0, 6)
  const rest = groups.slice(6)
  const sliceData: MuscleGroupStat[] = rest.length > 0
    ? [...top, { name: 'Other', count: rest.reduce((s, g) => s + g.count, 0), daysSinceLastTrained: 0 }]
    : top

  const total = sliceData.reduce((s, g) => s + g.count, 0)
  const cx = 60, cy = 60, outerR = 54, innerR = 33

  let angle = 0
  const slices = sliceData.map((g, i) => {
    const sweep = (g.count / total) * 360
    const start = angle
    angle += sweep
    return { ...g, start, end: angle, color: COLORS[i % COLORS.length] }
  })

  const top1 = slices[0]

  return (
    <div className="rounded-[14px] bg-(--surface) px-4 py-4">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-(--text-muted)">
        Muscle focus
      </p>

      {/* Mobile: chart left, legend right — Desktop: chart centered on top, legend grid below */}
      <div className="flex items-center gap-5 md:flex-col md:gap-4">

        <svg
          viewBox="0 0 120 120"
          className="w-28 shrink-0 md:w-36"
          style={{ height: 'auto' }}
        >
          {slices.map((s, i) => (
            <path
              key={i}
              d={donutSlice(cx, cy, outerR, innerR, s.start, s.end)}
              fill={s.color}
              stroke="#272727"
              strokeWidth="2"
            />
          ))}
          <text x={cx} y={cy - 5} textAnchor="middle" fill="#f0f0f0" fontSize={10} fontWeight={700} fontFamily="Inter, system-ui, sans-serif">
            {top1.name}
          </text>
          <text x={cx} y={cy + 9} textAnchor="middle" fill="#888" fontSize={10} fontFamily="Inter, system-ui, sans-serif">
            {Math.round((top1.count / total) * 100)}%
          </text>
        </svg>

        <div className="min-w-0 flex-1 space-y-2 md:w-full md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-2 md:space-y-0">
          {slices.map((s, i) => {
            const pct = Math.round((s.count / total) * 100)
            const due = s.daysSinceLastTrained > 7 && s.name !== 'Other'
            const stale = s.daysSinceLastTrained > 14 && s.name !== 'Other'
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                <span className="min-w-0 flex-1 truncate text-[12px] text-(--text)">{s.name}</span>
                <span className="text-[11px] text-(--text-muted)">{pct}%</span>
                {due && (
                  <span className={cn('text-[10px]', stale ? 'text-amber-400' : 'text-(--text-disabled)')}>
                    {s.daysSinceLastTrained}d{stale ? ' ⚠' : ''}
                  </span>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
