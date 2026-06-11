import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import { Activity, Download, Dumbbell, Home, LogOut, MapPin, Menu, Plus, Share, X } from 'lucide-react'
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

const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: s => s.location.pathname })
  const [panelOpen, setPanelOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setPanelOpen(false)
    }
    if (panelOpen) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [panelOpen])

  useEffect(() => {
    function onBeforeInstall(e: Event) {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  async function handleInstall() {
    if (!installPrompt) return
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setInstallPrompt(null)
  }

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

      {/* slide panel backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity duration-200',
          panelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={() => setPanelOpen(false)}
      />

      {/* slide panel */}
      <div
        ref={panelRef}
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-72 flex-col border-l border-(--border) bg-(--bg) transition-transform duration-200 ease-out',
          panelOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* panel header */}
        <div className="flex items-center justify-between border-b border-(--border) px-5 py-3.5">
          <div>
            <p className="text-[11px] text-(--text-muted)">Signed in as</p>
            <p className="text-[13px] font-semibold text-(--text-h)">@{user?.username}</p>
          </div>
          <button
            onClick={() => setPanelOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-[10px] text-(--text-muted) transition-colors hover:bg-(--surface) hover:text-(--text-h)"
          >
            <X size={17} />
          </button>
        </div>

        {/* panel nav */}
        <nav className="flex-1 px-3 py-3">
          <Link
            to="/exercises"
            onClick={() => setPanelOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14px] transition-colors',
              pathname.startsWith('/exercises')
                ? 'bg-(--surface) text-(--accent)'
                : 'text-(--text) hover:bg-(--surface) hover:text-(--text-h)',
            )}
          >
            <Activity size={16} />
            Exercises
          </Link>
          <Link
            to="/gyms"
            onClick={() => setPanelOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14px] transition-colors',
              pathname.startsWith('/gyms')
                ? 'bg-(--surface) text-(--accent)'
                : 'text-(--text) hover:bg-(--surface) hover:text-(--text-h)',
            )}
          >
            <MapPin size={16} />
            Gyms
          </Link>
        </nav>

        {/* install + sign out */}
        <div className="border-t border-(--border) px-3 py-3 space-y-0.5" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          {!isInStandaloneMode && installPrompt && (
            <button
              onClick={handleInstall}
              className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14px] text-(--text) transition-colors hover:bg-(--surface) hover:text-(--text-h)"
            >
              <Download size={16} />
              Install app
            </button>
          )}
          {!isInStandaloneMode && isIos && (
            <div className="flex items-start gap-3 rounded-[10px] px-3 py-2.5 text-[14px] text-(--text-muted)">
              <Share size={16} className="mt-0.5 shrink-0" />
              <span className="text-[13px] leading-snug">
                Tap <span className="text-(--text)">Share</span> then <span className="text-(--text)">Add to Home Screen</span> to install
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14px] text-(--text) transition-colors hover:bg-(--surface) hover:text-red-400"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </div>

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-(--border) bg-(--bg) px-5 py-3.5">
        <Link to="/home"><Logo size={20} /></Link>

        <button
          onClick={() => setPanelOpen(v => !v)}
          className="relative flex h-8.5 w-8.5 items-center justify-center rounded-[10px] bg-(--surface) text-(--text-muted) transition-colors hover:text-(--text-h)"
        >
          <Menu
            size={18}
            className={cn(
              'absolute transition-all duration-150',
              panelOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100',
            )}
          />
          <X
            size={18}
            className={cn(
              'absolute transition-all duration-150',
              panelOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75',
            )}
          />
        </button>
      </header>

      <main className="flex-1 px-5 py-6" style={{ paddingBottom: 'max(112px, calc(112px + env(safe-area-inset-bottom)))' }}>
        <div key={pathname} className="animate-[page-in_220ms_ease-out]">
          <Outlet />
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#1e1e1e] bg-(--bg)">
        <div className="mx-auto flex max-w-150 items-center px-4 pt-4" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
          <NavItem to="/home" label="Home" Icon={Home} />

          <div className="flex flex-1 justify-center">
            <Link
              to="/workouts/new"
              className="relative -top-5 flex h-14 w-14 items-center justify-center rounded-full bg-(--accent) text-[#0f0f0f] shadow-[0_2px_20px_rgba(200,247,58,0.45)] transition-transform active:scale-95"
            >
              <Plus size={24} />
            </Link>
          </div>

          <NavItem to="/workouts" label="Workouts" Icon={Dumbbell} />
        </div>
      </nav>
    </div>
  )
}
