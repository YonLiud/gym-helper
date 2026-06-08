import { cn } from '../lib/cn'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, id, className, ...props }: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-(--text-h)">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          'w-full rounded-lg border border-(--border) bg-(--bg) px-3 py-2 text-(--text-h) placeholder:text-(--text) focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-colors resize-y min-h-[80px]',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className,
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
