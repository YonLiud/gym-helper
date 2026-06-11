import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { toast as toastSingleton, type Toast } from '../lib/toast'

export function ToastStack() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => { const unsub = toastSingleton.subscribe(setToasts); return () => { unsub() } }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed right-4 top-[72px] z-50 flex flex-col gap-2 md:right-5">
      {toasts.map(t => (
        <div
          key={t.id}
          className="glass flex min-w-[260px] max-w-[340px] items-start gap-3 rounded-[14px] px-4 py-3.5"
          style={{
            animation: 'toast-in 0.22s ease-out',
            borderColor: t.type === 'error'
              ? 'rgba(248,113,113,0.3)'
              : 'rgba(200,247,58,0.3)',
          }}
        >
          <span
            className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
            style={{ background: t.type === 'error' ? '#f87171' : '#c8f73a' }}
          />
          <p className="flex-1 text-[13px] leading-snug text-(--text)">
            {t.message}
          </p>
          <button
            onClick={() => toastSingleton.dismiss(t.id)}
            className="shrink-0 text-(--text-disabled) transition-colors hover:text-(--text-muted)"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
