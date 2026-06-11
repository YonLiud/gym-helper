import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { cn } from '../lib/cn'

interface CTACardBase {
  icon: React.ReactNode
  title: string
  description: string
  className?: string
}

interface CTACardLink extends CTACardBase {
  to: string
  onClick?: never
  disabled?: never
}

interface CTACardButton extends CTACardBase {
  to?: never
  onClick: () => void
  disabled?: boolean
}

type CTACardProps = CTACardLink | CTACardButton

const cardStyle = { borderColor: 'rgba(200,247,58,0.22)' }

function CTACardInner({ icon, title, description, arrow }: CTACardBase & { arrow: boolean }) {
  return (
    <>
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px]"
        style={{ background: 'rgba(200,247,58,0.1)', border: '1px solid rgba(200,247,58,0.2)' }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[15px] font-semibold text-(--text-h)">{title}</p>
        <p className="mt-0.5 text-[13px] text-(--text-muted)">{description}</p>
      </div>
      {arrow && <ArrowRight size={18} className="shrink-0 text-(--text-disabled)" />}
    </>
  )
}

export function CTACard(props: CTACardProps) {
  const base = cn('glass flex items-center gap-4 rounded-[18px] p-5 transition-opacity active:opacity-80', props.className)

  if (props.to) {
    return (
      <Link to={props.to as any} className={base} style={cardStyle}>
        <CTACardInner {...props} arrow />
      </Link>
    )
  }

  return (
    <button
      onClick={props.onClick}
      disabled={props.disabled}
      className={cn(base, 'w-full text-left disabled:opacity-50')}
      style={cardStyle}
    >
      <CTACardInner {...props} arrow={false} />
    </button>
  )
}
