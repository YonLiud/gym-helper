interface StatCardProps {
  label: string
  value: string | number
  sub?: string
}

export function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div
      className="glass flex-1 rounded-[14px] px-4 py-4"
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 0 0 1px rgba(200,247,58,0.08), 0 4px 16px rgba(0,0,0,0.2)' }}
    >
      <p className="text-[11px] font-medium uppercase tracking-wider text-(--text-muted)">{label}</p>
      <p className="mt-2 text-[30px] font-bold leading-none tracking-tight text-(--text-h)">{value}</p>
      {sub && <p className="mt-1.5 text-[12px] text-(--text-muted)">{sub}</p>}
    </div>
  )
}
