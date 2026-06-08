import { cn } from '../lib/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, id, className, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-medium text-(--text-muted)">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full rounded-[10px] border border-(--border) bg-(--surface) px-4 py-3 text-[14px] text-(--text-h) placeholder:text-(--text-hint) focus:outline-none focus:border-(--accent) transition-colors',
          error && 'border-red-500 focus:border-red-500',
          className,
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}
