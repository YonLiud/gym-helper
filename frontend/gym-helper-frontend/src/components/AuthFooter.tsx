import { Link } from '@tanstack/react-router'

interface AuthFooterProps {
  links: { label: string; to: string }[]
}

export function AuthFooter({ links }: AuthFooterProps) {
  return (
    <div className="mt-5 flex items-center justify-center gap-4 text-[13px] text-(--text-disabled)">
      {links.map((link, i) => (
        <span key={link.to} className="contents">
          {i > 0 && <span>·</span>}
          <Link to={link.to} className="transition-colors hover:text-(--text-muted)">
            {link.label}
          </Link>
        </span>
      ))}
    </div>
  )
}
