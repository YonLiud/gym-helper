import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Activity, BarChart3, ChevronDown, Dumbbell, ArrowRight, Trophy, Github, Globe } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { StatCard } from '../components/StatCard'
import { MuscleGroupBar } from '../components/MuscleGroupBar'
import { RecentPRs } from '../components/RecentPRs'
import type { MuscleGroupStat, PR } from '../hooks/useWorkoutStats'

// ── fake preview data ──────────────────────────────────────────────────────────
const PREVIEW_MUSCLES: MuscleGroupStat[] = [
  { name: 'Chest',     count: 24, daysSinceLastTrained: 2 },
  { name: 'Back',      count: 20, daysSinceLastTrained: 3 },
  { name: 'Legs',      count: 18, daysSinceLastTrained: 5 },
  { name: 'Shoulders', count: 14, daysSinceLastTrained: 1 },
  { name: 'Arms',      count: 10, daysSinceLastTrained: 4 },
]

const PREVIEW_PRS: PR[] = [
  { exerciseId: '1', exerciseName: 'Bench Press', muscleGroup: 'Chest',     weight: 100, reps: 5 },
  { exerciseId: '2', exerciseName: 'Squat',       muscleGroup: 'Legs',      weight: 140, reps: 3 },
  { exerciseId: '3', exerciseName: 'Deadlift',    muscleGroup: 'Back',      weight: 170, reps: 1 },
  { exerciseId: '4', exerciseName: 'OHP',         muscleGroup: 'Shoulders', weight: 65,  reps: 5 },
]

// ── scroll-visibility hook ─────────────────────────────────────────────────────
function useVisible(ref: React.RefObject<Element | null>, threshold = 0.15) {
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect() } }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return v
}

// ── scroll star with trail ────────────────────────────────────────────────────
const TRAIL_LEN = 72

function getStarPos(pct: number) {
  return {
    x: window.innerWidth  * (0.5 + 0.38 * Math.sin(pct * Math.PI * 4)),
    y: window.innerHeight * pct,
  }
}

function ScrollStar() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starRef   = useRef<HTMLDivElement>(null)
  const scroll    = useRef(0)
  const cur       = useRef(0)
  const trail     = useRef<{ x: number; y: number }[]>([])
  const raf       = useRef<number | undefined>(undefined)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const onScroll = () => { scroll.current = window.scrollY }
    window.addEventListener('scroll', onScroll, { passive: true })

    const tick = () => {
      cur.current += (scroll.current - cur.current) * 0.08
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
      const pct = Math.min(cur.current / maxScroll, 1)
      const { x, y } = getStarPos(pct)

      trail.current.push({ x, y })
      if (trail.current.length > TRAIL_LEN) trail.current.shift()

      // redraw trail
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const pts = trail.current
      for (let i = 1; i < pts.length; i++) {
        const t = i / (pts.length - 1)
        ctx.beginPath()
        ctx.moveTo(pts[i - 1].x, pts[i - 1].y)
        ctx.lineTo(pts[i].x, pts[i].y)
        ctx.strokeStyle = `rgba(200,247,58,${(t * 0.5).toFixed(3)})`
        ctx.lineWidth = t * 2
        ctx.lineCap = 'round'
        ctx.stroke()
      }

      if (starRef.current) {
        starRef.current.style.left = `${x}px`
        starRef.current.style.top  = `${y}px`
      }

      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div ref={starRef} className="absolute" style={{ transform: 'translate(-50%, -50%)' }}>
        <div className="absolute" style={{
          width: 56, height: 56, top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(200,247,58,0.3), transparent 70%)',
          filter: 'blur(10px)', borderRadius: '50%',
        }} />
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.9, position: 'relative' }}>
          <path d="M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z" fill="#c8f73a" />
        </svg>
      </div>
    </div>
  )
}

// ── floating hero card (desktop background decoration) ────────────────────────
function FloatingCard({
  label, value, sub, rotation, delay, position,
}: {
  label: string; value: string | number; sub?: string
  rotation: number; delay: number
  position: string
}) {
  return (
    <div className={`pointer-events-none absolute hidden lg:block ${position}`} style={{ opacity: 0.32 }}>
      <div style={{ animation: `float 7s ease-in-out infinite ${delay}ms` }}>
        <div className="w-44" style={{ transform: `rotate(${rotation}deg)`, filter: 'blur(1.5px)' }}>
          <StatCard label={label} value={value} sub={sub} />
        </div>
      </div>
    </div>
  )
}

// ── feature card ──────────────────────────────────────────────────────────────
function FeatureCard({ Icon, title, desc, delay }: { Icon: LucideIcon; title: string; desc: string; delay: number }) {
  const ref     = useRef<HTMLDivElement>(null)
  const visible = useVisible(ref)
  return (
    <div
      ref={ref}
      className="glass rounded-[18px] p-6"
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-(--accent-bg)">
        <Icon size={20} color="#c8f73a" />
      </div>
      <p className="mb-2 text-[15px] font-bold text-(--text-h)">{title}</p>
      <p className="text-[14px] leading-relaxed text-(--text-muted)">{desc}</p>
    </div>
  )
}

// ── scroll-animated wrapper ───────────────────────────────────────────────────
function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref     = useRef<HTMLDivElement>(null)
  const visible = useVisible(ref, 0.1)
  return (
    <div
      ref={ref}
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ── section heading ───────────────────────────────────────────────────────────
function SectionHeading({ eyebrow, headline }: { eyebrow: string; headline: React.ReactNode }) {
  return (
    <FadeUp>
      <div className="mb-14 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-(--accent)">{eyebrow}</p>
        <h2
          className="mt-2 text-(--text-h)"
          style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.08 }}
        >
          {headline}
        </h2>
      </div>
    </FadeUp>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    Icon: Dumbbell,
    title: 'Log workouts fast',
    desc: 'Add exercises, log sets with weight and reps in seconds. No friction between you and the bar.',
  },
  {
    Icon: Trophy,
    title: 'Automatic PRs',
    desc: 'Your personal bests are tracked automatically. Every time you lift heavier, you see it immediately.',
  },
  {
    Icon: BarChart3,
    title: 'Muscle breakdown',
    desc: "Know exactly which muscle groups you've been crushing — and which ones are overdue.",
  },
]

export function LandingPage() {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 60); return () => clearTimeout(t) }, [])

  const s = (delay: number): React.CSSProperties => ({
    opacity:    loaded ? 1 : 0,
    transform:  loaded ? 'translateY(0)' : 'translateY(22px)',
    transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
  })

  return (
    <div className="relative overflow-x-hidden">
      <ScrollStar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-svh flex-col items-center justify-center px-6 text-center">

        {/* dot-grid background */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.065) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            WebkitMaskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 20%, transparent 100%)',
            maskImage:       'radial-gradient(ellipse 90% 90% at 50% 50%, black 20%, transparent 100%)',
          }}
        />

        {/* ambient corner glows */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-125 w-125 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(200,247,58,0.25), transparent 70%)', filter: 'blur(80px)' }} />
        <div className="pointer-events-none absolute -bottom-20 -right-40 h-100 w-100 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, rgba(200,247,58,0.2), transparent 70%)', filter: 'blur(80px)' }} />

        {/* floating stat cards (lg screens only) */}
        <FloatingCard label="Streak"       value={6}       sub="weeks"        rotation={8}   delay={0}    position="right-[5%] top-[17%]"    />
        <FloatingCard label="This week"    value={4}       sub="workouts"     rotation={-7}  delay={1400} position="left-[5%] top-[27%]"     />
        <FloatingCard label="Volume"       value="12.4k"   sub="kg this week" rotation={6}   delay={2800} position="right-[6%] bottom-[23%]" />
        <FloatingCard label="Last session" value="Today"   sub="keep it up"   rotation={-8}  delay={700}  position="left-[6%] bottom-[18%]"  />

        {/* hero content */}
        <div className="relative z-10 flex max-w-3xl flex-col items-center">
          {/* eyebrow badge */}
          <div
            style={s(0)}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-(--accent-border) bg-(--accent-bg) px-4 py-1.5"
          >
            <Activity size={12} color="#c8f73a" />
            <span className="text-[12px] font-semibold tracking-wide text-(--accent)">Personal Gym Tracker</span>
          </div>

          {/* headline */}
          <h1
            style={{
              ...s(80),
              fontSize: 'clamp(46px, 9vw, 92px)',
              fontWeight: 900,
              letterSpacing: '-3px',
              lineHeight: 0.93,
            }}
          >
            Every rep.<br />
            Every PR.<br />
            <span style={{ color: '#c8f73a' }}>Every gain.</span>
          </h1>

          {/* subtitle */}
          <p
            style={{
              ...s(200),
              maxWidth: 440,
              marginTop: 28,
              fontSize: 'clamp(15px, 2vw, 17px)',
              lineHeight: 1.7,
              color: 'var(--text-muted)',
            }}
          >
            Log workouts, track personal bests, and break down your muscle focus — all in one clean app.
          </p>

          {/* CTA */}
          <div style={{ ...s(320), marginTop: 44 }}>
            <Link
              to="/login"
              className="group inline-flex items-center gap-2.5 rounded-[14px] bg-(--accent) px-8 py-4 text-[15px] font-bold text-[#0f0f0f] transition-all duration-200 hover:scale-[1.04] active:scale-[0.97]"
              style={{ boxShadow: '0 4px 28px rgba(200,247,58,0.35)' }}
            >
              Get started
              <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* scroll nudge */}
        <div
          style={{ ...s(600), position: 'absolute', bottom: 28 }}
          className="flex animate-bounce flex-col items-center gap-1.5"
        >
          <span className="text-[10px] uppercase tracking-[0.18em] text-(--text-disabled)">Scroll</span>
          <ChevronDown size={14} className="text-(--text-disabled)" />
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-28">
        <SectionHeading
          eyebrow="Features"
          headline={<>Everything you need.<br />Nothing you don't.</>}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {FEATURES.map(({ Icon, title, desc }, i) => (
            <FeatureCard key={title} Icon={Icon} title={title} desc={desc} delay={i * 110} />
          ))}
        </div>
      </section>

      {/* ── App preview ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 pb-28">
        <SectionHeading
          eyebrow="Preview"
          headline={<>Your dashboard,<br />at a glance.</>}
        />

        {/* chrome frame */}
        <div
          className="glass rounded-[22px] p-5 md:p-8"
          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 0 0 1px rgba(200,247,58,0.07), 0 32px 80px rgba(0,0,0,0.5)' }}
        >
          {/* window chrome bar */}
          <div className="mb-5 flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#3a3a3a]" />
            <span className="h-3 w-3 rounded-full bg-[#3a3a3a]" />
            <span className="h-3 w-3 rounded-full bg-[#3a3a3a]" />
            <span className="ml-3 text-[11px] font-medium text-(--text-disabled)">gym helper — home</span>
          </div>

          <FadeUp>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard label="This week"    value={4}      sub="workouts"     />
              <StatCard label="Streak"       value={6}      sub="weeks"        />
              <StatCard label="Volume"       value="12.4k"  sub="kg this week" />
              <StatCard label="Last session" value="Today"  sub="keep it up"   />
            </div>
          </FadeUp>

          <FadeUp delay={160}>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <MuscleGroupBar groups={PREVIEW_MUSCLES} />
              <RecentPRs prs={PREVIEW_PRS} />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-(--border) px-6 py-28 text-center">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 65% 80% at 50% 110%, rgba(200,247,58,0.08) 0%, transparent 100%)' }}
        />
        <FadeUp>
          <div className="relative z-10">
            <h2
              className="text-(--text-h)"
              style={{ fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 900, letterSpacing: '-2.5px', lineHeight: 1.05 }}
            >
              Ready to start<br />
              <span style={{ color: '#c8f73a' }}>tracking?</span>
            </h2>
            <p style={{ marginTop: 16, fontSize: 15, color: 'var(--text-muted)', maxWidth: 280, margin: '16px auto 0' }}>
              Your first workout is one tap away.
            </p>
            <div className="mt-10">
              <Link
                to="/login"
                className="group inline-flex items-center gap-2.5 rounded-[14px] bg-(--accent) px-8 py-4 text-[16px] font-bold text-[#0f0f0f] transition-all duration-200 hover:scale-[1.04] active:scale-[0.97]"
                style={{ boxShadow: '0 4px 36px rgba(200,247,58,0.4)' }}
              >
                Get started
                <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-(--border) px-6 py-8">
        <div className="flex items-center justify-center gap-3">
          <a
            href="https://yxnliu.net"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-[10px] border border-(--border) px-4 py-2 text-[13px] text-(--text-muted) transition-all duration-150 hover:border-(--accent-border) hover:text-(--text-h)"
          >
            <Globe size={13} />
            yxnliu.net
          </a>
          <a
            href="https://github.com/YonLiud/gym-helper"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-[10px] border border-(--border) px-4 py-2 text-[13px] text-(--text-muted) transition-all duration-150 hover:border-(--accent-border) hover:text-(--text-h)"
          >
            <Github size={13} />
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}
