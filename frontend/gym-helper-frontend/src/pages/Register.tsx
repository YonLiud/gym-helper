import { Link } from '@tanstack/react-router'
import { Lock } from 'lucide-react'
import { AuthFooter } from '../components/AuthFooter'
import { Logo } from '../components/Logo'

export function RegisterPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center px-5">
      {/* dot grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 10%, transparent 100%)',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 10%, transparent 100%)',
        }}
      />
      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(200,247,58,0.06) 0%, transparent 100%)' }} />

      <div className="relative z-10 w-full max-w-sm">
        {/* header */}
        <div className="mb-8 flex flex-col items-center gap-5 text-center">
          <Link to="/">
            <Logo size={22} wordmark={false} />
          </Link>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>Create an account</h1>
            <p className="mt-1.5 text-[14px] text-(--text-muted)">Join gym helper and start tracking.</p>
          </div>
        </div>

        {/* closed beta card */}
        <div className="glass rounded-[20px] p-7 text-center">
          <div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-(--accent-bg)"
            style={{ border: '1px solid var(--accent-border)' }}
          >
            <Lock size={24} color="#c8f73a" />
          </div>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-(--accent-border) bg-(--accent-bg) px-3 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-(--accent)" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-(--accent)">Closed beta</span>
          </div>

          <p className="mt-3 text-[15px] font-semibold text-(--text-h)">Registration is closed</p>
          <p className="mt-2 text-[13px] leading-relaxed text-(--text-muted)">
            gym helper is currently invite-only. We'll open up to everyone soon — check back later.
          </p>
        </div>

        <AuthFooter links={[{ label: '← Home', to: '/' }, { label: 'Sign in instead', to: '/login' }]} />
      </div>
    </div>
  )
}
