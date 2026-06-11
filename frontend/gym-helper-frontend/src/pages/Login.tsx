import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { AuthFooter, Button, Input } from '../components'
import { Logo } from '../components/Logo'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const uErr = username.trim() ? null : 'Required'
    const pErr = password ? null : 'Required'
    setUsernameError(uErr)
    setPasswordError(pErr)
    if (uErr || pErr) return
    setLoading(true)
    try {
      await login(username, password)
      navigate({ to: '/home' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      setUsernameError(' ')
      setPasswordError(msg)
    } finally {
      setLoading(false)
    }
  }

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
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>Welcome back</h1>
            <p className="mt-1.5 text-[14px] text-(--text-muted)">Log in to continue tracking your gains.</p>
          </div>
        </div>

        {/* form card */}
        <div className="glass rounded-[20px] p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value.toLowerCase()); setUsernameError(null) }}
              error={usernameError ?? undefined}
              autoFocus
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setPasswordError(null) }}
              error={passwordError ?? undefined}
            />
            <div className="pt-1">
              <Button type="submit" size="lg" className="w-full" loading={loading}>
                <span className="flex items-center justify-center gap-2">
                  Log in <ArrowRight size={15} />
                </span>
              </Button>
            </div>
          </form>
        </div>

        <AuthFooter links={[{ label: '← Home', to: '/' }, { label: 'Register', to: '/register' }]} />
      </div>
    </div>
  )
}
