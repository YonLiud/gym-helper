import { Link } from '@tanstack/react-router'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../lib/cn'

interface HintRowBase {
  Icon: LucideIcon
  label: string
  badge?: string
}

interface HintRowLink extends HintRowBase {
  to: string
  onClick?: never
  open?: never
}

interface HintRowButton extends HintRowBase {
  to?: never
  onClick: () => void
  open?: boolean
}

type HintRowProps = HintRowLink | HintRowButton

const rowClass =
  'flex items-center gap-3 rounded-[14px] px-4 py-3 text-(--text-muted) transition-colors hover:text-(--text-h)'

export function HintRow(props: HintRowProps) {
  const inner = (
    <>
      <props.Icon size={15} className="shrink-0 text-(--text-disabled)" />
      <span className="flex-1 text-[13px]">
        {props.label}
        {props.badge && (
          <span className="ml-1.5 text-[11px] text-(--text-disabled)">{props.badge}</span>
        )}
      </span>
      {props.to ? (
        <ChevronRight size={15} className="shrink-0 text-(--text-disabled)" />
      ) : (
        <ChevronDown
          size={15}
          className={cn('shrink-0 text-(--text-disabled) transition-transform', props.open && 'rotate-180')}
        />
      )}
    </>
  )

  if (props.to) {
    return (
      <Link to={props.to as any} className={rowClass}>
        {inner}
      </Link>
    )
  }

  return (
    <button onClick={props.onClick} className={`${rowClass} w-full text-left`}>
      {inner}
    </button>
  )
}
