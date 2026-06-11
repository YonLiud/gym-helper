export type ToastType = 'error' | 'success'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

type Listener = (toasts: Toast[]) => void

let toasts: Toast[] = []
const listeners = new Set<Listener>()

function notify() {
  const snapshot = [...toasts]
  listeners.forEach(l => l(snapshot))
}

function add(message: string, type: ToastType, duration: number) {
  if (toasts.some(t => t.message === message)) return  // deduplicate identical messages
  const id = Math.random().toString(36).slice(2)
  toasts = [...toasts, { id, message, type }]
  notify()
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id)
    notify()
  }, duration)
}

export const toast = {
  error:   (message: string) => add(message, 'error',   4500),
  success: (message: string) => add(message, 'success', 3000),
  dismiss: (id: string) => {
    toasts = toasts.filter(t => t.id !== id)
    notify()
  },
  subscribe: (listener: Listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}
