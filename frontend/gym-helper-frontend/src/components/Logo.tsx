interface LogoProps {
  size?: number
  wordmark?: boolean
  className?: string
}

export function Logo({ size = 22, wordmark = true, className = '' }: LogoProps) {
  const box = Math.round(size * 1.45)

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={box}
        height={box}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect width="28" height="28" rx="6" fill="#272727" />
        <rect width="28" height="28" rx="6" fill="rgba(200,247,58,0.06)" />
        <text
          x="14"
          y="14"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="12.5"
          fontWeight="800"
          fill="#c8f73a"
          textAnchor="middle"
          dominantBaseline="central"
          letterSpacing="-0.4"
        >
          GH
        </text>
      </svg>

      {wordmark && (
        <span
          style={{
            fontSize: size * 0.82,
            fontWeight: 600,
            letterSpacing: '-0.3px',
            color: 'var(--text-h)',
          }}
        >
          Gym Helper
        </span>
      )}
    </span>
  )
}
