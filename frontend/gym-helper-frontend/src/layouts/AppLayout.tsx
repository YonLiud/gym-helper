import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import { Activity, Dumbbell, LogOut, MapPin, Menu, Plus, X } from 'lucide-react'
import { cn } from '../lib/cn'
import { useAuth } from '../hooks/useAuth'
import { Logo } from '../components/Logo'
import { ToastStack } from '../components/ToastStack'

// ── Background particles ──────────────────────────────────────────────────────

interface Particle {
  x: number; y: number
  vy: number; vx: number
  size: number
  life: number; maxLife: number
}

function spawnParticle(w: number, h: number): Particle {
  return {
    x: w * (0.05 + Math.random() * 0.9),
    y: h + Math.random() * 20,
    vy: 0.4 + Math.random() * 1.0,
    vx: (Math.random() - 0.5) * 0.5,
    size: 0.8 + Math.random() * 2.2,
    life: 0,
    maxLife: 200 + Math.random() * 160,
  }
}

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const particles: Particle[] = []
    const MAX = 38

    // seed spread across screen at start
    for (let i = 0; i < MAX; i++) {
      const p = spawnParticle(canvas.width, canvas.height)
      p.y = canvas.height * (0.3 + Math.random() * 0.7)
      p.life = Math.random() * p.maxLife
      particles.push(p)
    }

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      while (particles.length < MAX) particles.push(spawnParticle(canvas.width, canvas.height))

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life++
        p.x += p.vx
        p.y -= p.vy

        if (p.y < -10 || p.life > p.maxLife) { particles.splice(i, 1); continue }

        const t = p.life / p.maxLife
        // fade in (0–15%), hold, fade out (65–100%)
        let alpha = t < 0.15 ? t / 0.15 : t > 0.65 ? 1 - (t - 0.65) / 0.35 : 1
        // also fade out as particle rises (y < 50% of screen)
        alpha *= Math.min(1, (p.y / canvas.height) / 0.45) * 0.5

        if (alpha <= 0) continue
        ctx.save()
        ctx.globalAlpha = Math.max(0, alpha)

        // soft glow halo
        const r = p.size * 5
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r)
        grad.addColorStop(0, 'rgba(200,247,58,0.65)')
        grad.addColorStop(0.35, 'rgba(200,247,58,0.12)')
        grad.addColorStop(1, 'rgba(200,247,58,0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fill()

        // bright core dot
        ctx.fillStyle = 'rgba(220,255,100,0.95)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 0.38, 0, Math.PI * 2)
        ctx.fill()

        ctx.restore()
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('resize', resize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0" />
}

// ─────────────────────────────────────────────────────────────────────────────

function NavItem({ to, label, Icon }: { to: string; label: string; Icon: LucideIcon }) {
  const pathname = useRouterState({ select: s => s.location.pathname })
  const isActive = pathname.startsWith(to)

  return (
    <Link
      to={to}
      className={cn(
        'relative flex flex-1 flex-col items-center gap-1 py-2 text-[10px] transition-colors',
        isActive ? 'text-(--accent)' : 'text-(--text-disabled) hover:text-(--text-muted)',
      )}
    >
      {isActive && (
        <span className="absolute top-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-(--accent)" />
      )}
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  )
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: s => s.location.pathname })
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuClosing, setMenuClosing] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  function closeMenu() {
    setMenuClosing(true)
    setTimeout(() => {
      setMenuOpen(false)
      setMenuClosing(false)
    }, 100)
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu()
      }
    }
    if (menuOpen) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [menuOpen])

  async function handleLogout() {
    await logout()
    navigate({ to: '/login' })
  }

  return (
    <div className="flex min-h-svh flex-col text-left">
      {/* background layer */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* dot grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
        {/* static base flame glow */}
        <div style={{
          position: 'absolute', bottom: 0, left: '50%',
          transform: 'translateX(-50%)',
          width: '130%', height: '45%',
          background: 'radial-gradient(ellipse 55% 100% at 50% 100%, rgba(200,247,58,0.1) 0%, rgba(200,247,58,0.03) 50%, transparent 70%)',
          filter: 'blur(56px)',
        }} />
        {/* animated particles */}
        <ParticleBackground />
      </div>
      <ToastStack />
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-(--border) bg-(--bg) px-5 py-3.5">
        <Link to="/home"><Logo size={20} /></Link>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => menuOpen ? closeMenu() : setMenuOpen(true)}
            className="relative flex h-8.5 w-8.5 items-center justify-center rounded-[10px] bg-(--surface) text-(--text-muted) transition-colors hover:text-(--text-h)"
          >
            <Menu
              size={18}
              className={cn(
                'absolute transition-all duration-150',
                menuOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100',
              )}
            />
            <X
              size={18}
              className={cn(
                'absolute transition-all duration-150',
                menuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75',
              )}
            />
          </button>

          {menuOpen && (
            <div className={`${menuClosing ? 'animate-[dropdown-out_100ms_ease-in]' : 'animate-[dropdown-in_150ms_ease-out]'} absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-[14px] border border-(--border) bg-(--surface)`}>
              <div className="border-b border-(--border) px-4 py-2.5">
                <p className="text-[11px] text-(--text-muted)">Signed in as</p>
                <p className="text-[13px] font-medium text-(--text-h)">@{user?.username}</p>
              </div>
              <Link
                to="/gyms"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-(--text) transition-colors hover:bg-(--surface-2) hover:text-(--text-h)"
              >
                <MapPin size={14} />
                Gyms
              </Link>
              <div className="border-t border-(--border)" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] text-(--text) transition-colors hover:bg-(--surface-2) hover:text-(--text-h)"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 px-5 py-6" style={{ paddingBottom: 'max(112px, calc(112px + env(safe-area-inset-bottom)))' }}>
        <div key={pathname} className="animate-[page-in_220ms_ease-out]">
          <Outlet />
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#1e1e1e] bg-(--bg)">
        <div className="mx-auto flex max-w-150 items-center px-4 pt-4" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
          <NavItem to="/workouts" label="Workouts" Icon={Dumbbell} />

          <div className="flex flex-1 justify-center">
            <Link
              to="/workouts/new"
              className="relative -top-5 flex h-14 w-14 items-center justify-center rounded-full bg-(--accent) text-[#0f0f0f] shadow-[0_2px_20px_rgba(200,247,58,0.45)] transition-transform active:scale-95"
            >
              <Plus size={24} />
            </Link>
          </div>

          <NavItem to="/exercises" label="Exercises" Icon={Activity} />
        </div>
      </nav>
    </div>
  )
}
