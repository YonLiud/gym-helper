import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Dumbbell } from 'lucide-react'
import { Button, Input } from '../components'
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
    <div className="flex min-h-svh flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm space-y-8">

        <div className="flex flex-col items-center gap-4">
          <Link to="/" className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-(--accent) transition-opacity hover:opacity-90">
            <Dumbbell size={26} color="#0f0f0f" />
          </Link>
          <div className="text-center">
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.3px' }}>Welcome back</h1>
            <p className="mt-1 text-[14px] text-(--text-muted)">Log in to continue tracking.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            type="text"
            value={username}
            onChange={e => { setUsername(e.target.value); setUsernameError(null) }}
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
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Log in
          </Button>
        </form>

      </div>
    </div>
  )
}
