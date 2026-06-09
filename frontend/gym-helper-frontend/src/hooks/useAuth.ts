import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { User } from '../types'

const STORAGE_KEY = 'gym_user'

function getStoredUser(): User | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : null
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(getStoredUser)
  const queryClient = useQueryClient()

  async function login(username: string, password: string) {
    const data = await api.post<User>('/auth/login', { username, password })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    setUser(data)
  }

  async function logout() {
    await api.post('/auth/logout', {})
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
    queryClient.clear()
  }

  return { user, login, logout, isAuthenticated: !!user }
}
