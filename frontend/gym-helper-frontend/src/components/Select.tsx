import { cn } from '../lib/cn'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export function Select({
  label,
  error,
  id,
  options,
  placeholder,
  className,
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={selectId} className="text-[13px] font-medium text-(--text-muted)">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full rounded-[10px] border border-(--border) bg-(--surface) px-4 py-3 text-[14px] text-(--text-h) focus:outline-none focus:border-(--accent) transition-colors',
          error && 'border-red-500 focus:border-red-500',
          className,
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}
