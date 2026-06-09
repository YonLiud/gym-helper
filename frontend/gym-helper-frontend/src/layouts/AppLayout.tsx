import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import { Activity, Dumbbell, LogOut, MapPin, Menu, Plus, X } from 'lucide-react'
import { cn } from '../lib/cn'
import { useAuth } from '../hooks/useAuth'


function NavItem({ to, label, Icon }: { to: string; label: string; Icon: LucideIcon }) {
  const pathname = useRouterState({ select: s => s.location.pathname })
  const isActive = pathname.startsWith(to)

  return (
    <Link
      to={to}
      className={cn(
        'flex flex-1 flex-col items-center gap-1 py-2 text-[10px] transition-colors',
        isActive ? 'text-(--accent)' : 'text-(--text-disabled) hover:text-(--text-muted)',
      )}
    >
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
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-(--border) bg-(--bg) px-5 py-3.5">
        <Link to="/home" className="text-[18px] font-medium text-(--text-h)">Gym Helper</Link>

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
              className="relative -top-5 flex h-14 w-14 items-center justify-center rounded-full bg-(--accent) text-[#0f0f0f] transition-transform active:scale-95"
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
